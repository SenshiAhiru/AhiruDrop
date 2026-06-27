import type { MessageKey } from "@/i18n/messages/pt";

/**
 * Support ticket categories.
 *
 * `label` is the PT fallback (used in admin, which is PT-only). User-facing
 * surfaces should render `t(labelKey)` so the category follows the UI language.
 */
export const SUPPORT_CATEGORIES = [
  { value: "duvida", label: "Dúvida geral", labelKey: "supportCategory.duvida" },
  { value: "pagamento", label: "Problema com pagamento / depósito", labelKey: "supportCategory.pagamento" },
  { value: "rifa", label: "Problema com rifa / sorteio", labelKey: "supportCategory.rifa" },
  { value: "tecnico", label: "Problema técnico", labelKey: "supportCategory.tecnico" },
  { value: "outro", label: "Outro assunto", labelKey: "supportCategory.outro" },
] as const satisfies readonly {
  value: string;
  label: string;
  labelKey: MessageKey;
}[];

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["value"];
