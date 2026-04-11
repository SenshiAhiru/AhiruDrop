import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import type { PaymentGatewayAdapter } from "./payment-gateway.interface";
import { MercadoPagoAdapter } from "./mercadopago.adapter";
import { StripeAdapter } from "./stripe.adapter";
import { PushinPayAdapter } from "./pushinpay.adapter";

type AdapterConstructor = new (config: Record<string, string>, sandbox: boolean) => PaymentGatewayAdapter;

const adapterRegistry: Record<string, AdapterConstructor> = {
  mercadopago: MercadoPagoAdapter,
  stripe: StripeAdapter,
  pushinpay: PushinPayAdapter,
};

export class PaymentGatewayFactory {
  static async create(gatewayName: string): Promise<PaymentGatewayAdapter> {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: gatewayName },
      include: { configs: true },
    });

    if (!gateway) {
      throw new Error(`Gateway "${gatewayName}" nao encontrado`);
    }
    if (!gateway.isActive) {
      throw new Error(`Gateway "${gatewayName}" esta desativado`);
    }

    const AdapterClass = adapterRegistry[gateway.name];
    if (!AdapterClass) {
      throw new Error(`Adapter nao registrado para "${gateway.name}"`);
    }

    const config: Record<string, string> = {};
    for (const c of gateway.configs) {
      try {
        config[c.key] = decrypt(c.value);
      } catch {
        config[c.key] = c.value;
      }
    }

    return new AdapterClass(config, gateway.sandbox);
  }

  static async createDefault(): Promise<PaymentGatewayAdapter> {
    const gateway = await prisma.paymentGateway.findFirst({
      where: { isActive: true, isDefault: true },
    });

    if (!gateway) {
      throw new Error("Nenhum gateway de pagamento padrao configurado");
    }

    return this.create(gateway.name);
  }

  static async getAvailableGateways(): Promise<string[]> {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: { name: true, displayName: true },
    });
    return gateways.map((g) => g.name);
  }

  static registerAdapter(name: string, adapter: AdapterConstructor): void {
    adapterRegistry[name] = adapter;
  }
}
