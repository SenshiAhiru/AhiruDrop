import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export const SUPPORT_CATEGORIES = [
  { value: "duvida", label: "Dúvida geral" },
  { value: "pagamento", label: "Problema com pagamento / depósito" },
  { value: "rifa", label: "Problema com rifa / sorteio" },
  { value: "tecnico", label: "Problema técnico" },
  { value: "outro", label: "Outro assunto" },
] as const;

export const supportService = {
  async createTicket(
    userId: string,
    input: { subject: string; category: string; message: string }
  ) {
    const subject = input.subject.trim();
    const body = input.message.trim();
    const category = SUPPORT_CATEGORIES.some((c) => c.value === input.category)
      ? input.category
      : "outro";

    if (subject.length < 3) throw new Error("Assunto muito curto");
    if (subject.length > 200) throw new Error("Assunto muito longo");
    if (body.length < 5) throw new Error("Mensagem muito curta");
    if (body.length > 5000) throw new Error("Mensagem muito longa");

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          userId,
          subject,
          message: body,
          category,
          status: "OPEN",
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          senderRole: "USER",
          body,
          readByUser: true,
          readByAdmin: false,
        },
      });

      return ticket;
    });
  },

  async listByUser(userId: string) {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Append unread count per ticket (for this user)
    const withUnread = await Promise.all(
      tickets.map(async (t) => {
        const unread = await prisma.supportMessage.count({
          where: { ticketId: t.id, readByUser: false, senderRole: "ADMIN" },
        });
        return { ...t, unreadForUser: unread };
      })
    );

    return withUnread;
  },

  async listAll(params: {
    status?: TicketStatus;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, category, search, page = 1, limit = 50 } = params;
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { subject: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    const withUnread = await Promise.all(
      tickets.map(async (t) => {
        const unread = await prisma.supportMessage.count({
          where: { ticketId: t.id, readByAdmin: false, senderRole: "USER" },
        });
        return { ...t, unreadForAdmin: unread };
      })
    );

    return { data: withUnread, total, pages: Math.ceil(total / limit) };
  },

  async countOpenForAdmin() {
    return prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    });
  },

  async getWithMessages(ticketId: string, requester: { userId: string; isAdmin: boolean }) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
    });

    if (!ticket) throw new Error("Ticket não encontrado");
    if (!requester.isAdmin && ticket.userId !== requester.userId) {
      throw new Error("Acesso negado a este ticket");
    }

    // Mark as read for the side that's opening the ticket
    if (requester.isAdmin) {
      await prisma.supportMessage.updateMany({
        where: { ticketId, readByAdmin: false },
        data: { readByAdmin: true },
      });
    } else {
      await prisma.supportMessage.updateMany({
        where: { ticketId, readByUser: false },
        data: { readByUser: true },
      });
    }

    return ticket;
  },

  async addMessage(
    ticketId: string,
    sender: { userId: string; isAdmin: boolean },
    body: string
  ) {
    const text = body.trim();
    if (text.length < 1) throw new Error("Mensagem vazia");
    if (text.length > 5000) throw new Error("Mensagem muito longa");

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, status: true },
    });
    if (!ticket) throw new Error("Ticket não encontrado");
    if (!sender.isAdmin && ticket.userId !== sender.userId) {
      throw new Error("Acesso negado a este ticket");
    }
    if (ticket.status === "CLOSED" && !sender.isAdmin) {
      throw new Error("Ticket fechado. Abra um novo ticket para continuar.");
    }

    return prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: {
          ticketId,
          senderId: sender.userId,
          senderRole: sender.isAdmin ? "ADMIN" : "USER",
          body: text,
          readByUser: !sender.isAdmin,
          readByAdmin: sender.isAdmin,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      });

      // Auto-transitions:
      // - Admin first reply on OPEN → IN_PROGRESS
      // - User replies on RESOLVED → IN_PROGRESS (reopens)
      const updates: any = { updatedAt: new Date() };
      if (sender.isAdmin && ticket.status === "OPEN") {
        updates.status = "IN_PROGRESS";
      } else if (!sender.isAdmin && ticket.status === "RESOLVED") {
        updates.status = "IN_PROGRESS";
      }
      await tx.supportTicket.update({ where: { id: ticketId }, data: updates });

      return message;
    });
  },

  async updateStatus(ticketId: string, newStatus: TicketStatus) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });
    if (!ticket) throw new Error("Ticket não encontrado");

    const data: any = { status: newStatus };
    if (newStatus === "CLOSED") data.closedAt = new Date();
    if (ticket.status === "CLOSED" && newStatus !== "CLOSED") data.closedAt = null;

    return prisma.supportTicket.update({ where: { id: ticketId }, data });
  },
};
