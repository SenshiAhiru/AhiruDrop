import { prisma } from "@/lib/prisma";
import { paymentRepository } from "@/repositories/payment.repository";
import { orderRepository } from "@/repositories/order.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { notificationService } from "./notification.service";
import { auditService } from "./audit.service";
import { PaymentStatus } from "@prisma/client";

export const paymentService = {
  async createPayment(
    orderId: string,
    gatewayName?: string,
    method?: string
  ) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Pedido nao encontrado");
    if (order.status !== "PENDING") {
      throw new Error("Apenas pedidos pendentes podem gerar pagamento");
    }

    // Get gateway (by name or default)
    const gateway = await prisma.paymentGateway.findFirst({
      where: gatewayName
        ? { name: gatewayName, isActive: true }
        : { isDefault: true, isActive: true },
      include: { configs: true },
    });

    if (!gateway) {
      throw new Error("Nenhum gateway de pagamento disponivel");
    }

    // Build config map for the adapter
    const configMap: Record<string, string> = {};
    for (const cfg of gateway.configs) {
      configMap[cfg.key] = cfg.value;
    }

    // Get gateway adapter via dynamic import
    const { getGatewayAdapter } = await import("@/lib/payment-gateways");
    const adapter = getGatewayAdapter(gateway.name, configMap);

    // Call adapter to create payment
    const paymentResult = await adapter.createPayment({
      orderId: order.id,
      amount: Number(order.finalAmount),
      description: `Pedido #${order.id}`,
      method,
    });

    // Save payment record
    const payment = await paymentRepository.create({
      orderId: order.id,
      gatewayId: gateway.id,
      amount: Number(order.finalAmount),
      method: method || paymentResult.method,
      expiresAt: paymentResult.expiresAt,
    });

    // Update with external ID
    await paymentRepository.updateStatus(payment.id, {
      status: "PENDING",
      externalId: paymentResult.externalId,
    });

    // Log the creation event
    await paymentRepository.createLog(payment.id, "PAYMENT_CREATED", {
      externalId: paymentResult.externalId,
      gateway: gateway.name,
      amount: Number(order.finalAmount),
    });

    return {
      ...payment,
      externalId: paymentResult.externalId,
      paymentUrl: paymentResult.paymentUrl,
      qrCode: paymentResult.qrCode,
      qrCodeBase64: paymentResult.qrCodeBase64,
    };
  },

  async processWebhook(
    gatewayName: string,
    result: {
      externalId: string;
      status: PaymentStatus;
      paidAt?: Date;
      raw: any;
    }
  ) {
    // Find payment by externalId
    const payment = await paymentRepository.findByExternalId(result.externalId);
    if (!payment) {
      throw new Error(`Pagamento nao encontrado: ${result.externalId}`);
    }

    // Update payment status
    await paymentRepository.updateStatus(payment.id, {
      status: result.status,
      paidAt: result.paidAt,
      gatewayResponse: result.raw,
    });

    // Log the webhook event
    await paymentRepository.createLog(payment.id, "WEBHOOK_RECEIVED", {
      gateway: gatewayName,
      status: result.status,
      raw: result.raw,
    });

    if (result.status === "APPROVED") {
      // Update order to CONFIRMED
      await orderRepository.updateStatus(payment.orderId, "CONFIRMED");

      // Confirm numbers (RESERVED -> PAID)
      await raffleNumberRepository.confirmNumbers(payment.orderId);

      // Notify user
      await notificationService.notifyPaymentReceived(
        payment.order.userId,
        payment.orderId,
        Number(payment.amount)
      );

      await notificationService.notifyOrderConfirmed(
        payment.order.userId,
        payment.orderId
      );

      // Audit log
      await auditService.log(
        payment.order.userId,
        "PAYMENT_APPROVED",
        "payment",
        payment.id,
        { orderId: payment.orderId, amount: Number(payment.amount) }
      );
    } else if (
      result.status === "REJECTED" ||
      result.status === "EXPIRED"
    ) {
      // Release numbers
      await raffleNumberRepository.releaseByOrder(payment.orderId);

      // Update order status based on payment result
      const orderStatus =
        result.status === "EXPIRED" ? "EXPIRED" : "CANCELLED";
      await orderRepository.updateStatus(payment.orderId, orderStatus);
    }

    return payment;
  },

  async checkStatus(paymentId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Pagamento nao encontrado");

    return payment;
  },

  async listAll(params: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    gatewayId?: string;
  }) {
    return paymentRepository.findMany(params);
  },
};
