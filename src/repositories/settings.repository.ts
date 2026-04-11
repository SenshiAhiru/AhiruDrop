import { prisma } from "@/lib/prisma";

export const settingsRepository = {
  async get(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  },

  async getMany(keys: string[]) {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },

  async getAll() {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },

  async set(key: string, value: string, type?: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value, type: type ?? undefined },
      create: { key, value, type: type ?? "string" },
    });
  },

  async setMany(settings: { key: string; value: string; type?: string }[]) {
    return prisma.$transaction(
      settings.map((s) =>
        prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, type: s.type ?? undefined },
          create: { key: s.key, value: s.value, type: s.type ?? "string" },
        })
      )
    );
  },
};
