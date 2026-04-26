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
    if (!order) throw new Error("Pedido não encontrado");
    if (order.status !== "PENDING") {
      throw new Error("Apenas pedidos pendentes podem gerar pagamento");
    }

    // Load the user so we can pass customer info to the gateway adapter
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { name: true, email: true, cpf: true },
    });
    if (!user) throw new Error("Usuário do pedido não encontrado");

    // Get gateway (by name or default)
    const gateway = await prisma.paymentGateway.findFirst({
      where: gatewayName
        ? { name: gatewayName, isActive: true }
        : { isDefault: true, isActive: true },
      include: { configs: true },
    });

    if (!gateway) {
      throw new Error("Nenhum gateway de pagamento disponível");
    }

    // Get gateway adapter via dynamic import
    const { PaymentGatewayFactory } = await import("@/gateways/payment-gateway.factory");
    const adapter = await PaymentGatewayFactory.create(gateway.name);

    // Call adapter to create payment
    const paymentResult = await adapter.createPayment({
      orderId: order.id,
      amount: Number(order.finalAmount),
      currency: "BRL",
      description: `Pedido #${order.id}`,
      method,
      customerEmail: user.email,
      customerName: user.name,
      customerDocument: user.cpf ?? undefined,
    });

    // Save payment record
    const payment = await paymentRepository.create({
      orderId: order.id,
      gatewayId: gateway.id,
      amount: Number(order.finalAmount),
      method,
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
      throw new Error(`Pagamento não encontrado: ${result.externalId}`);
    }

    // Idempotency guard: gateway webhooks are retried frequently. Only act on
    // genuine status TRANSITIONS. If we already saw the same status, just log
    // the event and return — don't re-fire confirmations / notifications.
    const previousStatus = payment.status;
    const isTransition = previousStatus !== result.status;

    // Always log the webhook event (audit trail of every callback we receive).
    await paymentRepository.createLog(payment.id, "WEBHOOK_RECEIVED", {
      gateway: gatewayName,
      status: result.status,
      previousStatus,
      duplicate: !isTransition,
      raw: result.raw,
    });

    if (!isTransition) {
      // No-op: same status as before. Common with gateway retry storms.
      return payment;
    }

    // Persist the new status
    await paymentRepository.updateStatus(payment.id, {
      status: result.status,
      paidAt: result.paidAt,
      gatewayResponse: result.raw,
    });

    if (result.status === "APPROVED" && previousStatus !== "APPROVED") {
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

      // Audit log — actor is the system (null) since this is gateway-driven.
      // We still capture which user owns the order for traceability.
      await auditService.log(
        payment.order.userId,
        "PAYMENT_APPROVED",
        "payment",
        payment.id,
        { orderId: payment.orderId, amount: Number(payment.amount), gateway: gatewayName }
      );
    } else if (
      (result.status === "REJECTED" || result.status === "EXPIRED") &&
      previousStatus !== "REJECTED" &&
      previousStatus !== "EXPIRED"
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
    if (!payment) throw new Error("Pagamento não encontrado");

    return payment;
  },

  async listAll(params: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    gatewayId?: string;
    search?: string;
  }) {
    return paymentRepository.findMany(params);
  },
};
