"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/provider";

export default function PrivacyPage() {
  const { t } = useTranslation();

  const sections: { title: string; body: string }[] = [
    { title: t("privacy.s1Title"), body: t("privacy.s1Body") },
    { title: t("privacy.s2Title"), body: t("privacy.s2Body") },
    { title: t("privacy.s3Title"), body: t("privacy.s3Body") },
    { title: t("privacy.s4Title"), body: t("privacy.s4Body") },
    { title: t("privacy.s5Title"), body: t("privacy.s5Body") },
    { title: t("privacy.s6Title"), body: t("privacy.s6Body") },
    { title: t("privacy.s7Title"), body: t("privacy.s7Body") },
    { title: t("privacy.s8Title"), body: t("privacy.s8Body") },
    { title: t("privacy.s9Title"), body: t("privacy.s9Body") },
    { title: t("privacy.s10Title"), body: t("privacy.s10Body") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
        {t("privacy.title")}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        {t("privacy.lastUpdated", { date: "21/04/2026" })}
      </p>

      <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {t("privacy.intro")}
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              {s.title}
            </h2>
            <p>{s.body}</p>
          </section>
        ))}

        <section>
          <p>
            <a
              href="mailto:suporte@ahirudrop.com"
              className="text-primary-500 hover:underline"
            >
              suporte@ahirudrop.com
            </a>{" "}
            ·{" "}
            <Link href="/contact" className="text-primary-500 hover:underline">
              {t("footer.contact")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
