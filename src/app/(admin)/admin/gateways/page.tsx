"use client";

import { useState, useEffect } from "react";
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
    id: "stripe",
    name: "Stripe",
    displayName: "Stripe",
    isActive: true,
    isDefault: true,
    sandbox: true,
    borderColor: "border-l-primary-500",
    iconColor: "bg-primary-600",
    credentials: [
      { key: "secret_key", label: "Secret Key", value: "" },
      { key: "publishable_key", label: "Publishable Key", value: "" },
      { key: "webhook_secret", label: "Webhook Signing Secret", value: "" },
    ],
    webhookPath: "stripe",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    displayName: "Mercado Pago",
    isActive: false,
    isDefault: false,
    sandbox: false,
    borderColor: "border-l-accent-500",
    iconColor: "bg-accent-500",
    credentials: [
      { key: "access_token", label: "Access Token", value: "" },
      { key: "public_key", label: "Public Key", value: "" },
      { key: "webhook_secret", label: "Webhook Secret", value: "" },
    ],
    webhookPath: "mercadopago",
  },
];

const appUrl = typeof window !== "undefined" ? window.location.origin : "https://ahirudrop.vercel.app";

export default function GatewaysPage() {
  const [gateways, setGateways] = useState(initialGateways);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);

  // Load saved gateway configs from API
  useEffect(() => {
    fetch("/api/admin/gateways")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const saved = json.data;
          if (Array.isArray(saved) && saved.length > 0) {
            setGateways((prev) =>
              prev.map((gw) => {
                const match = saved.find((s: any) => s.name === gw.id);
                if (!match) return gw;
                return {
                  ...gw,
                  isActive: match.isActive ?? gw.isActive,
                  isDefault: match.isDefault ?? gw.isDefault,
                  sandbox: match.sandbox ?? gw.sandbox,
                  credentials: gw.credentials.map((c) => {
                    const sandbox = match.sandbox ?? gw.sandbox;
                    const prefix = sandbox ? "test_" : "live_";
                    // Try prefixed first, then unprefixed fallback
                    const cfg = (match.configs || []).find((cf: any) =>
                      cf.key === `${prefix}${c.key}` || cf.key === c.key
                    );
                    return cfg ? { ...c, value: cfg.value } : c;
                  }),
                };
              })
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  // Save gateway config to API - credentials prefixed by environment
  const handleSave = async (gatewayId: string) => {
    setSaving(gatewayId);
    setSaveMessage(null);
    const gw = gateways.find((g) => g.id === gatewayId);
    if (!gw) return;

    const envPrefix = gw.sandbox ? "test_" : "live_";

    try {
      const res = await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: gw.id,
          displayName: gw.displayName,
          isActive: gw.isActive,
          isDefault: gw.isDefault,
          sandbox: gw.sandbox,
          credentials: Object.fromEntries(
            gw.credentials.map((c) => [`${envPrefix}${c.key}`, c.value])
          ),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMessage({ id: gatewayId, type: "success", text: "Configurações salvas!" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ id: gatewayId, type: "error", text: json.error || "Erro ao salvar" });
      }
    } catch {
      setSaveMessage({ id: gatewayId, type: "error", text: "Erro ao salvar configurações" });
    } finally {
      setSaving(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleActive = async (id: string) => {
    const gw = gateways.find((g) => g.id === id);
    if (!gw) return;
    const newActive = !gw.isActive;
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: newActive } : g))
    );
    // Auto-save active state
    try {
      await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: id,
          displayName: gw.displayName,
          isActive: newActive,
          isDefault: gw.isDefault,
          sandbox: gw.sandbox,
          credentials: {},
        }),
      });
    } catch {}
  };

  const toggleSandbox = async (id: string) => {
    const gw = gateways.find((g) => g.id === id);
    if (!gw) return;
    const newSandbox = !gw.sandbox;

    // Clear current credentials and load from the other environment
    setGateways((prev) =>
      prev.map((g) => g.id === id ? {
        ...g,
        sandbox: newSandbox,
        credentials: g.credentials.map((c) => ({ ...c, value: "" })),
      } : g)
    );

    // Auto-save the sandbox toggle
    try {
      await fetch("/api/admin/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: id, displayName: gw.displayName,
          isActive: gw.isActive, isDefault: gw.isDefault,
          sandbox: newSandbox, credentials: {},
        }),
      });
    } catch {}

    // Reload credentials for the new environment
    try {
      const res = await fetch("/api/admin/gateways");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const match = json.data.find((s: any) => s.name === id);
        if (match) {
          const envPrefix = newSandbox ? "test_" : "live_";
          setGateways((prev) =>
            prev.map((g) => g.id === id ? {
              ...g,
              credentials: g.credentials.map((c) => {
                const cfg = (match.configs || []).find((cf: any) =>
                  cf.key === `${envPrefix}${c.key}` || cf.key === c.key
                );
                return cfg ? { ...c, value: cfg.value } : { ...c, value: "" };
              }),
            } : g)
          );
        }
      }
    } catch {}
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

  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});

  const toggleFieldVisibility = async (gatewayId: string, credKey: string) => {
    const fieldKey = `${gatewayId}-${credKey}`;
    const isVisible = visibleFields[fieldKey];

    if (isVisible) {
      // Hide it
      setVisibleFields((prev) => ({ ...prev, [fieldKey]: false }));
      return;
    }

    // If already revealed, just toggle visibility
    if (revealedValues[fieldKey]) {
      setVisibleFields((prev) => ({ ...prev, [fieldKey]: true }));
      return;
    }

    // Fetch real value from API
    try {
      const gw = gateways.find((g) => g.id === gatewayId);
      const envPrefix = gw?.sandbox ? "test_" : "live_";
      // Try prefixed key first
      let res = await fetch("/api/admin/gateways/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayName: gatewayId, key: `${envPrefix}${credKey}` }),
      });
      let json = await res.json();
      // Fallback to unprefixed
      if (!json.success || !json.data?.value) {
        res = await fetch("/api/admin/gateways/reveal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gatewayName: gatewayId, key: credKey }),
        });
        json = await res.json();
      }
      if (json.success && json.data?.value) {
        setRevealedValues((prev) => ({ ...prev, [fieldKey]: json.data.value }));
        updateCredential(gatewayId, credKey, json.data.value);
        setVisibleFields((prev) => ({ ...prev, [fieldKey]: true }));
      }
    } catch {}
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
          Configuração de Gateways
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Configure os meios de pagamento da plataforma. Altere gateways sem
          modificar código.
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
                            onClick={() => toggleFieldVisibility(gateway.id, cred.key)}
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

                {/* Mode Toggle */}
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <p className="text-sm font-semibold mb-3">Ambiente</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (!gateway.sandbox) toggleSandbox(gateway.id); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                        gateway.sandbox
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-surface-700 text-surface-500 hover:border-surface-500"
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full", gateway.sandbox ? "bg-amber-500" : "bg-surface-600")} />
                      Teste
                    </button>
                    <button
                      onClick={() => { if (gateway.sandbox) toggleSandbox(gateway.id); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                        !gateway.sandbox
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-surface-700 text-surface-500 hover:border-surface-500"
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full", !gateway.sandbox ? "bg-emerald-500" : "bg-surface-600")} />
                      Produção
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-surface-500">
                    {gateway.sandbox
                      ? "Usando chaves de teste. Pagamentos não são reais."
                      : "Usando chaves de produção. Pagamentos reais ativados."}
                  </p>
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
                  <Button
                    size="sm"
                    disabled={saving === gateway.id}
                    onClick={() => handleSave(gateway.id)}
                  >
                    <Save className="h-4 w-4" />
                    {saving === gateway.id ? "Salvando..." : "Salvar"}
                  </Button>

                  {saveMessage?.id === gateway.id && (
                    <span className={cn(
                      "text-xs font-medium",
                      saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"
                    )}>
                      {saveMessage.text}
                    </span>
                  )}
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
