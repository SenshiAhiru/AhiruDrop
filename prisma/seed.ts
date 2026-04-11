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

  // Rifas serao criadas pelo admin via painel com busca de skins CS2
  console.log("✅ Rifas serao criadas via painel admin (CS2 skins)");

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
