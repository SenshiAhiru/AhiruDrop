import { prisma } from "@/lib/prisma";
import { raffleRepository } from "@/repositories/raffle.repository";
import { raffleNumberRepository } from "@/repositories/raffle-number.repository";
import { orderRepository } from "@/repositories/order.repository";
import { couponService } from "./coupon.service";
import { settingsService } from "./settings.service";
import { OrderStatus, NumberStatus } from "@prisma/client";

export const orderService = {
  async create(
    userId: string,
    input: { raffleId: string; numbers: number[]; couponCode?: string }
  ) {
    const raffle = await raffleRepository.findById(input.raffleId);
    if (!raffle) throw new Error("Rifa não encontrada");
    if (raffle.status !== "ACTIVE") {
      throw new Error("Esta rifa não está ativa para compras");
    }

    // Validate number count within min/maxPerPurchase
    const count = input.numbers.length;
    if (count < raffle.minPerPurchase) {
      throw new Error(
        `Mínimo de ${raffle.minPerPurchase} número(s) por compra`
      );
    }
    if (count > raffle.maxPerPurchase) {
      throw new Error(
        `Máximo de ${raffle.maxPerPurchase} número(s) por compra`
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
        `Os seguintes números não estão disponíveis: ${unavailable.join(", ")}`
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

  /**
   * Purchase raffle tickets directly with AHC balance.
   * Atomic: debits balance, creates CONFIRMED order, marks numbers as PAID.
   * No reservation window — AHC is the user's own money, payment is instant.
   */
  async purchaseWithBalance(
    userId: string,
    input: { raffleId: string; numbers: number[]; couponCode?: string }
  ) {
    const raffle = await raffleRepository.findById(input.raffleId);
    if (!raffle) throw new Error("Rifa não encontrada");
    if (raffle.status !== "ACTIVE") {
      throw new Error("Esta rifa não está ativa para compras");
    }

    const count = input.numbers.length;
    if (count < raffle.minPerPurchase) {
      throw new Error(`Mínimo de ${raffle.minPerPurchase} número(s) por compra`);
    }
    if (count > raffle.maxPerPurchase) {
      throw new Error(`Máximo de ${raffle.maxPerPurchase} número(s) por compra`);
    }

    const pricePerNumber = Number(raffle.pricePerNumber);
    const totalAmount = count * pricePerNumber;

    let discount = 0;
    let couponId: string | undefined;
    if (input.couponCode) {
      const couponResult = await couponService.validate(input.couponCode, totalAmount);
      discount = couponResult.discount;
      couponId = couponResult.coupon.id;
    }

    const finalAmount = totalAmount - discount;

    return prisma.$transaction(async (tx) => {
      // Lock user row and check balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
      if (!user) throw new Error("Usuário não encontrado");

      const currentBalance = Number(user.balance);
      if (currentBalance < finalAmount) {
        throw new Error(
          `Saldo insuficiente. Você tem ${currentBalance.toFixed(2)} AHC e precisa de ${finalAmount.toFixed(2)} AHC`
        );
      }

      // Atomically flip only AVAILABLE numbers to PAID (placeholder orderId)
      const flip = await tx.raffleNumber.updateMany({
        where: {
          raffleId: input.raffleId,
          number: { in: input.numbers },
          status: NumberStatus.AVAILABLE,
        },
        data: { status: NumberStatus.PAID },
      });

      if (flip.count !== input.numbers.length) {
        throw new Error(
          `Alguns números já foram vendidos ou reservados. Tente selecionar outros.`
        );
      }

      // Debit balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalAmount } },
      });

      // Create CONFIRMED order
      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.CONFIRMED,
          totalAmount,
          discount,
          finalAmount,
          couponId,
          expiresAt: new Date(),
          items: {
            create: [
              {
                raffleId: input.raffleId,
                quantity: count,
                pricePerNumber,
                subtotal: totalAmount,
              },
            ],
          },
        },
        include: { items: true },
      });

      // Link numbers to the order
      await tx.raffleNumber.updateMany({
        where: {
          raffleId: input.raffleId,
          number: { in: input.numbers },
          status: NumberStatus.PAID,
          orderId: null,
        },
        data: { orderId: order.id, reservedUntil: null },
      });

      // Increment coupon uses if applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { currentUses: { increment: 1 } },
        });
      }

      const newBalance = currentBalance - finalAmount;
      return { order, balance: newBalance, spent: finalAmount };
    });
  },

  async getById(id: string, userId?: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Pedido não encontrado");

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
    if (!order) throw new Error("Pedido não encontrado");

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
    if (!order) throw new Error("Pedido não encontrado");

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
