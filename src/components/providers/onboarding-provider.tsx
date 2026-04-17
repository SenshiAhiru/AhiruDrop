"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { OnboardingWizard } from "@/components/shared/onboarding-wizard";

/**
 * On mount (if logged in and not yet onboarded), shows the welcome tutorial.
 * After user dismisses (by completing or skipping), marks as onboarded
 * via POST /api/user/onboarded so it won't show again.
 *
 * Shows a small delay so the page renders first.
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/user/onboarded", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success && !json.data.onboarded) {
          setShow(true);
        }
      } catch {
        // silent — failing to show onboarding shouldn't break anything
      }
    }

    const timer = setTimeout(check, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status, session?.user?.id]);

  async function handleDismiss() {
    setShow(false);
    try {
      await fetch("/api/user/onboarded", { method: "POST" });
    } catch {
      // if fails, tutorial will show again next visit — acceptable
    }
  }

  return (
    <>
      {children}
      {show && session?.user && (
        <OnboardingWizard
          userName={session.user.name ?? "você"}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
