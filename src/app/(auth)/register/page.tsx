"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";
import { useTranslation } from "@/i18n/provider";

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

const SCORE_CONFIG: Record<number, { color: string; width: string; text: string }> = {
  0: { color: "bg-surface-700", width: "w-0", text: "text-surface-500" },
  1: { color: "bg-red-500", width: "w-1/5", text: "text-red-400" },
  2: { color: "bg-orange-500", width: "w-2/5", text: "text-orange-400" },
  3: { color: "bg-amber-500", width: "w-3/5", text: "text-amber-400" },
  4: { color: "bg-emerald-500", width: "w-full", text: "text-emerald-400" },
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const policy = useMemo(() => validatePasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!policy.ok) {
      setError(policy.message);
      return;
    }

    if (!acceptTerms) {
      setError("Você deve aceitar os termos de uso.");
      return;
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError("Complete a verificação humana antes de continuar.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta. Tente novamente.");
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard/profile?welcome=true");
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-surface-800/50 bg-surface-900/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-[var(--foreground)]">
          {t("auth.register.title")}
        </CardTitle>
        <CardDescription>
          {t("auth.register.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.register.name")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="name"
                type="text"
                placeholder={t("auth.register.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.register.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="email"
                type="email"
                placeholder={t("auth.register.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.register.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.register.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-surface-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${SCORE_CONFIG[policy.score].color} ${SCORE_CONFIG[policy.score].width}`}
                  />
                </div>
                <p className="text-xs">
                  <span className="text-surface-400">Força: </span>
                  <span className={`font-semibold capitalize ${SCORE_CONFIG[policy.score].text}`}>
                    {policy.label}
                  </span>
                </p>
                <ul className="text-[11px] space-y-0.5">
                  <PolicyCheck ok={password.length >= PASSWORD_MIN_LENGTH} text={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`} />
                  <PolicyCheck ok={/[A-Z]/.test(password)} text="Uma letra maiúscula" />
                  <PolicyCheck ok={/[a-z]/.test(password)} text="Uma letra minúscula" />
                  <PolicyCheck ok={/[0-9]/.test(password)} text="Um número" />
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.register.confirmPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-danger">As senhas não coincidem</p>
            )}
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-surface-700 bg-surface-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-[var(--muted-foreground)] cursor-pointer">
              {t("auth.register.acceptTerms")}{" "}
              <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                {t("auth.register.termsLink")}
              </Link>
            </label>
          </div>

          {TURNSTILE_ENABLED && (
            <div className="pt-1">
              <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={!acceptTerms || (TURNSTILE_ENABLED && !turnstileToken)}
          >
            {isLoading ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            {t("auth.register.signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function PolicyCheck({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-400" : "text-surface-500"}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </li>
  );
}
