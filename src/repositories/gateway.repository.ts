import { prisma } from "@/lib/prisma";

export const gatewayRepository = {
  async findAll() {
    return prisma.paymentGateway.findMany({
      include: { configs: true },
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.paymentGateway.findUnique({
      where: { id },
      include: { configs: true },
    });
  },

  async findByName(name: string) {
    return prisma.paymentGateway.findUnique({
      where: { name },
      include: { configs: true },
    });
  },

  async findDefault() {
    return prisma.paymentGateway.findFirst({
      where: { isActive: true, isDefault: true },
      include: { configs: true },
    });
  },

  async create(data: { name: string; displayName: string }) {
    return prisma.paymentGateway.create({
      data: {
        name: data.name,
        displayName: data.displayName,
      },
    });
  },

  async update(
    id: string,
    data: {
      displayName?: string;
      isActive?: boolean;
      isDefault?: boolean;
      sandbox?: boolean;
    }
  ) {
    return prisma.paymentGateway.update({
      where: { id },
      data,
    });
  },

  async upsertConfig(gatewayId: string, key: string, value: string) {
    return prisma.paymentGatewayConfig.upsert({
      where: { gatewayId_key: { gatewayId, key } },
      update: { value },
      create: { gatewayId, key, value },
    });
  },

  async deleteConfig(gatewayId: string, key: string) {
    return prisma.paymentGatewayConfig.delete({
      where: { gatewayId_key: { gatewayId, key } },
    });
  },

  async clearDefault() {
    return prisma.paymentGateway.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  },
};
