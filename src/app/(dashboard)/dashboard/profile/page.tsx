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
import { User, Lock, Eye, EyeOff, Save, Camera } from "lucide-react";

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
        method: "PUT",
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
      setPasswordMessage({ type: "error", text: "As senhas nao coincidem." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter no minimo 6 caracteres." });
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
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
          Gerencie suas informacoes pessoais e seguranca
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
              <CardTitle className="text-base">Informacoes Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de perfil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-2">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20 ring-2 ring-primary-500/30 text-primary-400 text-xl font-bold">
                  {(session?.user?.name || "U")[0].toUpperCase()}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.name || "Usuario"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  JPG, PNG ou GIF. Max 2MB.
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
              Salvar alteracoes
            </Button>
          </form>
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
