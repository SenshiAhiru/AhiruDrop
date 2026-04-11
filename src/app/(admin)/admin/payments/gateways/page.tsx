"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Save,
  CheckCircle,
  Globe,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GatewayConfig {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  sandbox: boolean;
  borderColor: string;
  iconColor: string;
  credentials: { key: string; label: string; value: string }[];
  webhookPath: string;
}

const initialGateways: GatewayConfig[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    displayName: "Mercado Pago",
    isActive: true,
    isDefault: true,
    sandbox: false,
    borderColor: "border-l-blue-500",
    iconColor: "bg-blue-500",
    credentials: [
      { key: "access_token", label: "Access Token", value: "APP_USR-xxxxx-xxxxx" },
      { key: "public_key", label: "Public Key", value: "APP_USR-yyyyy-yyyyy" },
      { key: "webhook_secret", label: "Webhook Secret", value: "whsec_xxxxx" },
    ],
    webhookPath: "mercadopago",
  },
  {
    id: "stripe",
    name: "Stripe",
    displayName: "Stripe",
    isActive: false,
    isDefault: false,
    sandbox: true,
    borderColor: "border-l-violet-500",
    iconColor: "bg-violet-500",
    credentials: [
      { key: "secret_key", label: "Secret Key", value: "sk_test_xxxxx" },
      { key: "publishable_key", label: "Publishable Key", value: "pk_test_xxxxx" },
      { key: "webhook_secret", label: "Webhook Signing Secret", value: "whsec_xxxxx" },
    ],
    webhookPath: "stripe",
  },
  {
    id: "pushinpay",
    name: "PushinPay",
    displayName: "PushinPay",
    isActive: true,
    isDefault: false,
    sandbox: false,
    borderColor: "border-l-green-500",
    iconColor: "bg-green-500",
    credentials: [
      { key: "api_key", label: "API Key", value: "ppay_xxxxx" },
      { key: "webhook_secret", label: "Webhook Secret", value: "whsec_xxxxx" },
    ],
    webhookPath: "pushinpay",
  },
];

const appUrl = "https://ahirudrop.com";

export default function GatewaysPage() {
  const [gateways, setGateways] = useState(initialGateways);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleActive = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const toggleSandbox = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, sandbox: !g.sandbox } : g))
    );
  };

  const setDefault = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => ({ ...g, isDefault: g.id === id }))
    );
  };

  const updateCredential = (gatewayId: string, key: string, value: string) => {
    setGateways((prev) =>
      prev.map((g) =>
        g.id === gatewayId
          ? {
              ...g,
              credentials: g.credentials.map((c) =>
                c.key === key ? { ...c, value } : c
              ),
            }
          : g
      )
    );
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const copyWebhook = (gatewayName: string) => {
    navigator.clipboard.writeText(`${appUrl}/api/webhooks/${gatewayName}`);
    setCopiedWebhook(gatewayName);
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configuracao de Gateways
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Configure os meios de pagamento da plataforma. Altere gateways sem
          modificar codigo.
        </p>
      </div>

      {/* Gateway Cards */}
      <div className="space-y-4">
        {gateways.map((gateway) => (
          <Card
            key={gateway.id}
            className={cn("overflow-hidden border-l-4", gateway.borderColor)}
          >
            {/* Header */}
            <button
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--muted)]/20"
              onClick={() => toggleExpand(gateway.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold",
                    gateway.iconColor
                  )}
                >
                  {gateway.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{gateway.displayName}</span>
                    {gateway.isDefault && (
                      <Badge variant="accent" className="text-[10px]">
                        Padrao
                      </Badge>
                    )}
                    {gateway.sandbox && (
                      <Badge variant="warning" className="text-[10px]">
                        Sandbox
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {gateway.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Toggle Switch */}
                <button
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                    gateway.isActive ? "bg-emerald-500" : "bg-[var(--muted)]"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActive(gateway.id);
                  }}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      gateway.isActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
                {expandedId === gateway.id ? (
                  <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
                )}
              </div>
            </button>

            {/* Expanded Config */}
            {expandedId === gateway.id && (
              <CardContent className="border-t border-[var(--border)] pt-5 space-y-5">
                {/* Credentials */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Credenciais</p>
                  {gateway.credentials.map((cred) => {
                    const fieldId = `${gateway.id}-${cred.key}`;
                    const isVisible = visibleFields[fieldId] ?? false;
                    return (
                      <div key={cred.key}>
                        <label className="mb-1 block text-xs text-[var(--muted-foreground)]">
                          {cred.label}
                        </label>
                        <div className="relative">
                          <Input
                            type={isVisible ? "text" : "password"}
                            value={cred.value}
                            onChange={(e) =>
                              updateCredential(
                                gateway.id,
                                cred.key,
                                e.target.value
                              )
                            }
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            onClick={() => toggleFieldVisibility(fieldId)}
                          >
                            {isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sandbox Toggle */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={gateway.sandbox}
                      onChange={() => toggleSandbox(gateway.id)}
                      className="h-4 w-4 rounded accent-primary-600"
                    />
                    Modo Sandbox
                  </label>
                </div>

                {/* Webhook URL */}
                <div>
                  <p className="mb-1 text-xs text-[var(--muted-foreground)]">
                    Webhook URL
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-[var(--muted)]/50 px-3 py-2">
                      <code className="text-xs select-all">
                        {appUrl}/api/webhooks/{gateway.webhookPath}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => copyWebhook(gateway.webhookPath)}
                    >
                      {copiedWebhook === gateway.webhookPath ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {!gateway.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefault(gateway.id)}
                    >
                      <Globe className="h-4 w-4" />
                      Definir como Padrao
                    </Button>
                  )}
                  <Button size="sm">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Para adicionar novos gateways de pagamento, entre em contato com o
          suporte tecnico ou configure diretamente no painel de administracao
          avancado.
        </p>
      </div>
    </div>
  );
}
