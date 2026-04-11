import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create Admin User ───
  const adminPassword = await bcrypt.hash("@@Akali123@@", 12);
  const admin = await prisma.user.upsert({
    where: { email: "oprsenshi@gmail.com" },
    update: {},
    create: {
      name: "Senshi Ahiru",
      email: "oprsenshi@gmail.com",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ─── Create Test User ───
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "usuario@teste.com" },
    update: {},
    create: {
      name: "Usuario Teste",
      email: "usuario@teste.com",
      passwordHash: userPassword,
      role: "USER",
      phone: "11999999999",
      isActive: true,
    },
  });
  console.log(`✅ Test user created: ${user.email}`);

  // ─── Create Payment Gateways ───
  const mercadopago = await prisma.paymentGateway.upsert({
    where: { name: "mercadopago" },
    update: {},
    create: {
      name: "mercadopago",
      displayName: "Mercado Pago",
      isActive: false,
      isDefault: true,
      sandbox: true,
    },
  });

  const stripe = await prisma.paymentGateway.upsert({
    where: { name: "stripe" },
    update: {},
    create: {
      name: "stripe",
      displayName: "Stripe",
      isActive: false,
      isDefault: false,
      sandbox: true,
    },
  });

  const pushinpay = await prisma.paymentGateway.upsert({
    where: { name: "pushinpay" },
    update: {},
    create: {
      name: "pushinpay",
      displayName: "PushinPay",
      isActive: false,
      isDefault: false,
      sandbox: true,
    },
  });
  console.log("✅ Payment gateways created");

  // ─── Create Sample Raffles ───
  const raffles = [
    {
      title: "PlayStation 5 Slim",
      slug: "playstation-5-slim-" + Date.now().toString(36),
      description:
        "Concorra a um PlayStation 5 Slim novinho na caixa! Console de ultima geracao com SSD ultra-rapido, controle DualSense e acesso a centenas de jogos exclusivos.",
      shortDescription: "Console PS5 Slim novo na caixa",
      pricePerNumber: 2.5,
      totalNumbers: 200,
      minPerPurchase: 1,
      maxPerPurchase: 20,
      status: "ACTIVE" as const,
      category: "Games",
      prizeType: "Eletronico",
      isFeatured: true,
      scheduledDrawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max-" + Date.now().toString(36),
      description:
        "Concorra a um iPhone 15 Pro Max 256GB! O smartphone mais avancado da Apple com camera de 48MP, chip A17 Pro e corpo em titanio.",
      shortDescription: "iPhone 15 Pro Max 256GB lacrado",
      pricePerNumber: 5.0,
      totalNumbers: 500,
      minPerPurchase: 1,
      maxPerPurchase: 30,
      status: "ACTIVE" as const,
      category: "Smartphones",
      prizeType: "Eletronico",
      isFeatured: true,
      scheduledDrawAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "PC Gamer RTX 4070",
      slug: "pc-gamer-rtx-4070-" + Date.now().toString(36),
      description:
        "PC Gamer completo com RTX 4070, processador Intel i7 13700K, 32GB RAM DDR5, SSD 1TB NVMe, gabinete RGB e monitor 27 polegadas 144Hz.",
      shortDescription: "PC Gamer completo com RTX 4070",
      pricePerNumber: 10.0,
      totalNumbers: 1000,
      minPerPurchase: 1,
      maxPerPurchase: 50,
      status: "ACTIVE" as const,
      category: "Games",
      prizeType: "Eletronico",
      isFeatured: true,
      scheduledDrawAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Headset Gamer HyperX Cloud III",
      slug: "headset-hyperx-cloud-iii-" + Date.now().toString(36),
      description:
        "Headset gamer profissional HyperX Cloud III com som surround 7.1, microfone removivel e almofadas de espuma com memoria.",
      shortDescription: "Headset HyperX Cloud III",
      pricePerNumber: 1.0,
      totalNumbers: 100,
      minPerPurchase: 1,
      maxPerPurchase: 10,
      status: "DRAFT" as const,
      category: "Perifericos",
      prizeType: "Eletronico",
      isFeatured: false,
    },
  ];

  for (const raffleData of raffles) {
    const raffle = await prisma.raffle.upsert({
      where: { slug: raffleData.slug },
      update: {},
      create: raffleData,
    });

    // Generate numbers for each raffle
    const existingCount = await prisma.raffleNumber.count({
      where: { raffleId: raffle.id },
    });

    if (existingCount === 0) {
      const numbers = Array.from({ length: raffleData.totalNumbers }, (_, i) => ({
        raffleId: raffle.id,
        number: i + 1,
        status: "AVAILABLE" as const,
      }));

      await prisma.raffleNumber.createMany({ data: numbers });
      console.log(
        `✅ Raffle "${raffle.title}" created with ${raffleData.totalNumbers} numbers`
      );
    }
  }

  // ─── Simulate some sold numbers for active raffles ───
  const activeRaffles = await prisma.raffle.findMany({
    where: { status: "ACTIVE" },
  });

  for (const raffle of activeRaffles) {
    const soldCount = Math.floor(Number(raffle.totalNumbers) * 0.15);
    const reservedCount = Math.floor(Number(raffle.totalNumbers) * 0.03);

    // Mark some as PAID
    await prisma.raffleNumber.updateMany({
      where: {
        raffleId: raffle.id,
        status: "AVAILABLE",
        number: { lte: soldCount },
      },
      data: { status: "PAID" },
    });

    // Mark some as RESERVED
    await prisma.raffleNumber.updateMany({
      where: {
        raffleId: raffle.id,
        status: "AVAILABLE",
        number: { gt: soldCount, lte: soldCount + reservedCount },
      },
      data: {
        status: "RESERVED",
        reservedUntil: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }
  console.log("✅ Simulated sales for active raffles");

  // ─── Create Sample Coupon ───
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: {},
    create: {
      code: "BEMVINDO10",
      discountType: "percentage",
      discountValue: 10,
      maxUses: 100,
      currentUses: 0,
      isActive: true,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "DESCONTO5" },
    update: {},
    create: {
      code: "DESCONTO5",
      discountType: "fixed",
      discountValue: 5,
      maxUses: 50,
      currentUses: 0,
      minOrderAmount: 20,
      isActive: true,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Coupons created");

  // ─── System Settings ───
  const settings = [
    { key: "site_name", value: "AhiruDrop", type: "string" },
    { key: "site_description", value: "Plataforma de rifas online premium", type: "string" },
    { key: "support_email", value: "suporte@ahirudrop.com", type: "string" },
    { key: "reservation_timeout_minutes", value: "15", type: "number" },
    { key: "maintenance_mode", value: "false", type: "boolean" },
    { key: "min_purchase", value: "1", type: "number" },
    { key: "max_purchase", value: "50", type: "number" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ System settings created");

  console.log("\n🎉 Seed completed!");
  console.log("─────────────────────────────");
  console.log("Admin: oprsenshi@gmail.com");
  console.log("User:  usuario@teste.com / user123");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
