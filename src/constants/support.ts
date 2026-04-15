export const SUPPORT_CATEGORIES = [
  { value: "duvida", label: "Dúvida geral" },
  { value: "pagamento", label: "Problema com pagamento / depósito" },
  { value: "rifa", label: "Problema com rifa / sorteio" },
  { value: "tecnico", label: "Problema técnico" },
  { value: "outro", label: "Outro assunto" },
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["value"];
