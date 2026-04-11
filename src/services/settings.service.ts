import { prisma } from "@/lib/prisma";

type SettingType = "string" | "number" | "boolean" | "json";

function coerceValue(value: string, type: string): any {
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true" || value === "1";
    case "json":
      return JSON.parse(value);
    default:
      return value;
  }
}

function serializeValue(value: any): string {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function inferType(value: any): SettingType {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object") return "json";
  return "string";
}

export const settingsService = {
  async get(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    return coerceValue(setting.value, setting.type);
  },

  async getMany(keys: string[]) {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = coerceValue(setting.value, setting.type);
    }

    return result;
  },

  async getAll() {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = coerceValue(setting.value, setting.type);
    }

    return result;
  },

  async set(key: string, value: any, type?: SettingType) {
    const serialized = serializeValue(value);
    const settingType = type || inferType(value);

    return prisma.systemSetting.upsert({
      where: { key },
      update: { value: serialized, type: settingType },
      create: { key, value: serialized, type: settingType },
    });
  },

  async setMany(settings: Record<string, any>) {
    const operations = Object.entries(settings).map(([key, value]) => {
      const serialized = serializeValue(value);
      const type = inferType(value);

      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: serialized, type },
        create: { key, value: serialized, type },
      });
    });

    return prisma.$transaction(operations);
  },
};
