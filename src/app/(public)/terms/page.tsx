"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/provider";

export default function TermsPage() {
  const { t } = useTranslation();

  const sections: { title: string; body: string }[] = [
    { title: t("terms.s1Title"), body: t("terms.s1Body") },
    { title: t("terms.s2Title"), body: t("terms.s2Body") },
    { title: t("terms.s3Title"), body: t("terms.s3Body") },
    { title: t("terms.s4Title"), body: t("terms.s4Body") },
    { title: t("terms.s5Title"), body: t("terms.s5Body") },
    { title: t("terms.s6Title"), body: t("terms.s6Body") },
    { title: t("terms.s7Title"), body: t("terms.s7Body") },
    { title: t("terms.s8Title"), body: t("terms.s8Body") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
        {t("terms.title")}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        {t("terms.lastUpdated", { date: "10/04/2026" })}
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
