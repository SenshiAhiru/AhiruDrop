import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

// Fields to exclude from user responses
const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  role: true,
  steamId: true,
  avatarUrl: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userService = {
  async register(data: { name: string; email: string; password: string }) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("Este email já está cadastrado");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: userSelect,
    });

    return user;
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) throw new Error("Usuário não encontrado");

    return user;
  },

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      cpf?: string;
      avatarUrl?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    // Check phone uniqueness if changing
    if (data.phone && data.phone !== user.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (phoneExists) {
        throw new Error("Este telefone já está cadastrado");
      }
    }

    if (data.cpf && data.cpf !== user.cpf) {
      const cpfExists = await prisma.user.findUnique({
        where: { cpf: data.cpf },
      });
      if (cpfExists) {
        throw new Error("Este CPF já está cadastrado");
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Senha atual incorreta");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  },

  async listAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) {
    const { page = 1, limit = 20, search, role } = params;
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  },

  async updateRole(userId: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: userSelect,
    });
  },

  async toggleActive(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: userSelect,
    });
  },
};
