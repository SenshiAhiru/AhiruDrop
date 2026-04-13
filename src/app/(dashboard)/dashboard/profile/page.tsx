"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Lock, Eye, EyeOff, Save, Link2, CheckCircle, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [steamLinked, setSteamLinked] = useState(false);
  const [steamName, setSteamName] = useState("");
  const [steamMessage, setSteamMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check Steam link status and URL params
  useState(() => {
    // Fetch profile to check if steam is linked
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data || json;
        if (data.cpf && typeof data.cpf === "string" && data.cpf.startsWith("steam:")) {
          setSteamLinked(true);
          setSteamName(data.cpf.replace("steam:", ""));
        }
        if (data.phone) setPhone(maskPhone(data.phone));
      })
      .catch(() => {});

    // Check URL params for Steam link result
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const steamResult = params.get("steam");
      if (steamResult === "success") {
        setSteamLinked(true);
        setSteamName(params.get("name") || "");
        setSteamMessage({ type: "success", text: `Steam vinculada com sucesso! (${params.get("name") || ""})` });
        // Clean URL
        window.history.replaceState({}, "", "/dashboard/profile");
      } else if (steamResult === "error") {
        const reason = params.get("reason");
        const messages: Record<string, string> = {
          already_linked: "Esta conta Steam já está vinculada a outro usuário.",
          verification_failed: "Falha na verificação do Steam. Tente novamente.",
          not_configured: "Login Steam não está configurado.",
          not_authenticated: "Você precisa estar logado para vincular.",
          unknown: "Erro desconhecido. Tente novamente.",
        };
        setSteamMessage({ type: "error", text: messages[reason || "unknown"] || messages.unknown });
        window.history.replaceState({}, "", "/dashboard/profile");
      }
    }
  });

  // Initialize name from session once loaded
  useState(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name);
    }
  });

  function maskCpf(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function maskPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setProfileMessage({ type: "error", text: data.error || "Erro ao salvar perfil." });
        return;
      }

      setProfileMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch {
      setProfileMessage({ type: "error", text: "Erro ao salvar perfil." });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setPasswordMessage({ type: "error", text: data.error || "Erro ao alterar senha." });
        return;
      }

      setPasswordMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({ type: "error", text: "Erro ao alterar senha." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Meu Perfil</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Gerencie suas informações pessoais e segurança
        </p>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
              <User className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-base">Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de perfil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20 ring-2 ring-primary-500/30 text-primary-400 text-xl font-bold">
                {(session?.user?.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-[var(--foreground)]">
                  Nome completo
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                  Email
                </label>
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-[var(--foreground)]">
                  Telefone
                </label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cpf" className="text-sm font-medium text-[var(--foreground)]">
                  CPF
                </label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {profileMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  profileMessage.type === "success"
                    ? "border border-success/30 bg-success/10 text-success"
                    : "border border-danger/30 bg-danger/10 text-danger"
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <Button type="submit" isLoading={isSavingProfile}>
              <Save className="h-4 w-4 mr-2" />
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Steam Link */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800">
              <svg className="h-5 w-5 text-white" viewBox="0 0 256 259" fill="currentColor">
                <path d="M128.006 0C60.563 0 5.17 50.474.49 114.506l69.463 28.694c5.878-4.054 12.964-6.425 20.602-6.425.684 0 1.36.02 2.03.058l30.836-44.703v-.627c0-27.96 22.753-50.713 50.716-50.713 27.96 0 50.717 22.753 50.717 50.716 0 27.96-22.757 50.713-50.717 50.713h-1.18l-43.97 31.373c0 .523.032 1.047.032 1.584 0 20.99-17.065 38.052-38.055 38.052-18.655 0-34.2-13.46-37.513-31.186L2.625 158.01C18.266 214.398 68.627 256.03 128.006 256.03c70.394 0 127.487-57.093 127.487-127.516C255.493 58.091 198.4 0 128.006 0"/>
              </svg>
            </div>
            <div>
              <CardTitle className="text-base">Conta Steam</CardTitle>
              <CardDescription>Vincule sua conta Steam para receber skins</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {steamMessage && (
            <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${steamMessage.type === "success" ? "border border-success/30 bg-success/10 text-success" : "border border-danger/30 bg-danger/10 text-danger"}`}>
              {steamMessage.text}
            </div>
          )}
          {steamLinked ? (
            <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Steam vinculada</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Steam ID: {steamName}</p>
                </div>
              </div>
              <a href={`https://steamcommunity.com/profiles/${steamName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Ver perfil <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                Vincule sua conta Steam para que possamos enviar as skins diretamente para seu inventário quando você ganhar uma rifa.
              </p>
              <a href="/api/auth/steam/link" className="inline-flex items-center gap-2 rounded-lg bg-surface-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-surface-700 border border-surface-700 transition-colors">
                <Link2 className="h-4 w-4" />
                Vincular conta Steam
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10">
              <Lock className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <CardTitle className="text-base">Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-[var(--foreground)]">
                Senha atual
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  required
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-[var(--foreground)]">
                  Nova senha
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    required
                    minLength={6}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmNewPassword" className="text-sm font-medium text-[var(--foreground)]">
                  Confirmar nova senha
                </label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  passwordMessage.type === "success"
                    ? "border border-success/30 bg-success/10 text-success"
                    : "border border-danger/30 bg-danger/10 text-danger"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <Button type="submit" variant="accent" isLoading={isSavingPassword}>
              <Lock className="h-4 w-4 mr-2" />
              Alterar senha
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
