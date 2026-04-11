"use client";

import { useState } from "react";
import {
  Globe,
  Phone,
  Ticket,
  Wrench,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [siteSettings, setSiteSettings] = useState({
    site_name: "",
    site_description: "",
  });

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

  async function handleSaveSite() {
    setSaving("site");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao salvar configuracoes do site.");
        return;
      }
      alert("Configuracoes salvas!");
    } catch {
      alert("Erro ao salvar configuracoes do site.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveContact() {
    setSaving("contact");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactSettings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao salvar configuracoes de contato.");
        return;
      }
      alert("Configuracoes salvas!");
    } catch {
      alert("Erro ao salvar configuracoes de contato.");
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
        body: JSON.stringify(raffleSettings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao salvar configuracoes de rifas.");
        return;
      }
      alert("Configuracoes salvas!");
    } catch {
      alert("Erro ao salvar configuracoes de rifas.");
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
        body: JSON.stringify({ maintenance_mode: maintenanceMode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao salvar configuracao de manutencao.");
        return;
      }
      alert("Configuracoes salvas!");
    } catch {
      alert("Erro ao salvar configuracao de manutencao.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Configuracoes do Sistema
      </h1>

      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary-600" />
            Informacoes do Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Nome do Site
            </label>
            <Input
              placeholder="Nome do site"
              value={siteSettings.site_name}
              onChange={(e) =>
                setSiteSettings({ ...siteSettings, site_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
              Descricao do Site
            </label>
            <Input
              placeholder="Descricao do site"
              value={siteSettings.site_description}
              onChange={(e) =>
                setSiteSettings({
                  ...siteSettings,
                  site_description: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveSite} disabled={saving === "site"}>
              <Save className="h-4 w-4" />
              {saving === "site" ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              Tempo maximo para o usuario finalizar o pagamento apos reservar
              numeros.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
                Compra Minima
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
                Compra Maxima
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
            Manutencao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
            <div>
              <p className="font-medium">Modo de Manutencao</p>
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
              A plataforma esta em modo de manutencao. Usuarios nao
              conseguirao acessar.
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
