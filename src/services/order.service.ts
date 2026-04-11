import { prisma } from "@/lib/prisma";
import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { orderRepository } from "@/repositories/order.repository";
import { couponService } from "./coupon.service";
import { settingsService } from "./settings.service";
import { OrderStatus } from "@prisma/client";

export const orderService = {
  async create(
    userId: string,
    input: { raffleId: string; numbers: number[]; couponCode?: string }
  ) {
    const raffle = await raffleRepository.findById(input.raffleId);
    if (!raffle) throw new Error("Rifa nao encontrada");
    if (raffle.status !== "ACTIVE") {
      throw new Error("Esta rifa nao esta ativa para compras");
    }

    // Validate number count within min/maxPerPurchase
    const count = input.numbers.length;
    if (count < raffle.minPerPurchase) {
      throw new Error(
        `Minimo de ${raffle.minPerPurchase} numero(s) por compra`
      );
    }
    if (count > raffle.maxPerPurchase) {
      throw new Error(
        `Maximo de ${raffle.maxPerPurchase} numero(s) por compra`
      );
    }

    // Check all selected numbers are AVAILABLE
    const availableNumbers = await raffleNumberRepository.findAvailable(
      input.raffleId,
      input.numbers
    );
    if (availableNumbers.length !== input.numbers.length) {
      const availableSet = new Set(availableNumbers.map((n) => n.number));
      const unavailable = input.numbers.filter((n) => !availableSet.has(n));
      throw new Error(
        `Os seguintes numeros nao estao disponiveis: ${unavailable.join(", ")}`
      );
    }

    // Calculate amounts
    const pricePerNumber = Number(raffle.pricePerNumber);
    const totalAmount = count * pricePerNumber;
    let discount = 0;
    let couponId: string | undefined;

    // Validate coupon if provided
    if (input.couponCode) {
      const couponResult = await couponService.validate(
        input.couponCode,
        totalAmount
      );
      discount = couponResult.discount;
      couponId = couponResult.coupon.id;
    }

    const finalAmount = totalAmount - discount;

    // Get reservation timeout from settings (default 15 minutes)
    const timeoutMinutes =
      ((await settingsService.get("reservationTimeoutMinutes")) as number) || 15;
    const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await orderRepository.create({
        userId,
        totalAmount,
        discount,
        finalAmount,
        couponId,
        expiresAt,
        items: [
          {
            raffleId: input.raffleId,
            quantity: count,
            pricePerNumber,
            subtotal: totalAmount,
          },
        ],
      });

      // Reserve numbers with expiry
      await raffleNumberRepository.reserveNumbers(
        input.raffleId,
        input.numbers,
        created.id,
        expiresAt
      );

      // Increment coupon uses if coupon was applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { currentUses: { increment: 1 } },
        });
      }

      return created;
    });

    return order;
  },

  async getById(id: string, userId?: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Pedido nao encontrado");

    if (userId && order.userId !== userId) {
      throw new Error("Acesso negado a este pedido");
    }

    return order;
  },

  async listByUser(
    userId: string,
    params: { page?: number; limit?: number; status?: OrderStatus }
  ) {
    return orderRepository.findByUser(userId, params);
  },

  async listAll(params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
  }) {
    return orderRepository.findMany(params);
  },

  async cancel(id: string, userId?: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Pedido nao encontrado");

    if (userId && order.userId !== userId) {
      throw new Error("Acesso negado a este pedido");
    }

    if (order.status !== "PENDING") {
      throw new Error("Apenas pedidos pendentes podem ser cancelados");
    }

    // Release reserved numbers
    await raffleNumberRepository.releaseByOrder(id);

    // Update order status
    return orderRepository.updateStatus(id, "CANCELLED");
  },

  async expire(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Pedido nao encontrado");

    if (order.status !== "PENDING") return order;

    // Release reserved numbers
    await raffleNumberRepository.releaseByOrder(id);

    // Update order status
    return orderRepository.updateStatus(id, "EXPIRED");
  },

  async expireAll() {
    // Find all PENDING orders past their expiresAt
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    let count = 0;
    for (const order of expiredOrders) {
      await this.expire(order.id);
      count++;
    }

    // Also release any orphaned expired numbers
    await raffleNumberRepository.releaseExpired();

    return count;
  },
};
