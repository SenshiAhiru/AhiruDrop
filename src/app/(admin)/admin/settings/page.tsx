"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Ticket,
  Wrench,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [contactSettings, setContactSettings] = useState({
    support_email: "",
    support_phone: "",
  });

  const [raffleSettings, setRaffleSettings] = useState({
    reservation_timeout: 15,
    min_purchase: 1,
    max_purchase: 100,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || {};
        setContactSettings({
          support_email: data.support_email || "",
          support_phone: data.support_phone || "",
        });
        setRaffleSettings({
          reservation_timeout: Number(data.reservation_timeout_minutes) || 15,
          min_purchase: Number(data.min_purchase) || 1,
          max_purchase: Number(data.max_purchase) || 100,
        });
        setMaintenanceMode(data.maintenance_mode === "true");
      })
      .catch(() => {});
  }, []);

  async function handleSaveContact() {
    setSaving("contact");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [
            { key: "support_email", value: contactSettings.support_email, type: "string" },
            { key: "support_phone", value: contactSettings.support_phone, type: "string" },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", message: data.error || "Erro ao salvar configurações de contato" });
        return;
      }
      addToast({ type: "success", message: "Configurações de contato salvas" });
    } catch {
      addToast({ type: "error", message: "Erro ao salvar configurações de contato" });
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveRaffles() {
    setSaving("raffles");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [
            { key: "reservation_timeout_minutes", value: String(raffleSettings.reservation_timeout), type: "number" },
            { key: "min_purchase", value: String(raffleSettings.min_purchase), type: "number" },
            { key: "max_purchase", value: String(raffleSettings.max_purchase), type: "number" },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", message: data.error || "Erro ao salvar configurações de rifas" });
        return;
      }
      addToast({ type: "success", message: "Configurações de rifas salvas" });
    } catch {
      addToast({ type: "error", message: "Erro ao salvar configurações de rifas" });
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveMaintenance() {
    setSaving("maintenance");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: [
            { key: "maintenance_mode", value: String(maintenanceMode), type: "boolean" },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", message: data.error || "Erro ao salvar modo de manutenção" });
        return;
      }
      addToast({ type: "success", message: "Modo de manutenção atualizado" });
    } catch {
      addToast({ type: "error", message: "Erro ao salvar modo de manutenção" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Configurações do Sistema
      </h1>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary-600" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Email de Suporte
            </label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={contactSettings.support_email}
              onChange={(e) =>
                setContactSettings({
                  ...contactSettings,
                  support_email: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Telefone de Suporte
            </label>
            <Input
              placeholder="(00) 00000-0000"
              value={contactSettings.support_phone}
              onChange={(e) =>
                setContactSettings({
                  ...contactSettings,
                  support_phone: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveContact} disabled={saving === "contact"}>
              <Save className="h-4 w-4" />
              {saving === "contact" ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Raffles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary-600" />
            Rifas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Tempo de Reserva (minutos)
            </label>
            <Input
              type="number"
              min={1}
              value={raffleSettings.reservation_timeout}
              onChange={(e) =>
                setRaffleSettings({
                  ...raffleSettings,
                  reservation_timeout: Number(e.target.value),
                })
              }
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Tempo máximo para o usuário finalizar o pagamento após reservar
              números.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
                Compra Mínima
              </label>
              <Input
                type="number"
                min={1}
                value={raffleSettings.min_purchase}
                onChange={(e) =>
                  setRaffleSettings({
                    ...raffleSettings,
                    min_purchase: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
                Compra Máxima
              </label>
              <Input
                type="number"
                min={1}
                value={raffleSettings.max_purchase}
                onChange={(e) =>
                  setRaffleSettings({
                    ...raffleSettings,
                    max_purchase: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveRaffles} disabled={saving === "raffles"}>
              <Save className="h-4 w-4" />
              {saving === "raffles" ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary-600" />
            Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
            <div>
              <p className="font-medium">Modo de Manutenção</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Quando ativado, apenas administradores podem acessar a
                plataforma.
              </p>
            </div>
            <button
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                maintenanceMode ? "bg-red-500" : "bg-[var(--muted)]"
              )}
              onClick={() => setMaintenanceMode(!maintenanceMode)}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  maintenanceMode ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
          {maintenanceMode && (
            <p className="mt-3 text-sm font-medium text-red-500">
              A plataforma está em modo de manutenção. Usuários não
              conseguirão acessar.
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveMaintenance} disabled={saving === "maintenance"}>
              <Save className="h-4 w-4" />
              {saving === "maintenance" ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
