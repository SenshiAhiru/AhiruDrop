"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/logo";

function SteamCompleteInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Conectando com Steam...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Token inválido");
      return;
    }

    async function completeSteamLogin() {
      try {
        const res = await fetch("/api/auth/steam/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const json = await res.json();
        if (!json.success || !json.data) {
          setStatus("Erro ao verificar login Steam");
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }

        const { email } = json.data;

        const result = await signIn("credentials", {
          email,
          password: `steam_auto_${token}`,
          redirect: false,
        });

        if (result?.ok) {
          setStatus("Login realizado! Redirecionando...");
          window.location.href = "/dashboard";
        } else {
          setStatus("Redirecionando...");
          window.location.href = "/dashboard";
        }
      } catch {
        setStatus("Erro na conexão. Redirecionando...");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    }

    completeSteamLogin();
  }, [searchParams]);

  return <p className="text-surface-400">{status}</p>;
}

export default function SteamCompletePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mx-auto" />
        <Suspense fallback={<p className="text-surface-400">Carregando...</p>}>
          <SteamCompleteInner />
        </Suspense>
      </div>
    </div>
  );
}
