"use client";

import { cn } from "@/lib/utils";
import { CreditCard, QrCode, Barcode } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: "pix" | "credit_card" | "boleto";
  description: string;
}

const methods: PaymentMethod[] = [
  { id: "pix", name: "PIX", icon: "pix", description: "Aprovacao instantanea" },
  { id: "credit_card", name: "Cartao de Credito", icon: "credit_card", description: "Ate 12x" },
  { id: "boleto", name: "Boleto", icon: "boleto", description: "Ate 3 dias uteis" },
];

const icons = {
  pix: QrCode,
  credit_card: CreditCard,
  boleto: Barcode,
};

interface PaymentMethodPickerProps {
  selected: string;
  onSelect: (method: string) => void;
  availableMethods?: string[];
}

export function PaymentMethodPicker({
  selected,
  onSelect,
  availableMethods,
}: PaymentMethodPickerProps) {
  const filtered = availableMethods
    ? methods.filter((m) => availableMethods.includes(m.id))
    : methods;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--foreground)]">
        Forma de pagamento
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filtered.map((method) => {
          const Icon = icons[method.icon];
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition-all text-left",
                isSelected
                  ? "border-primary-500 bg-primary-500/5 shadow-sm"
                  : "border-[var(--border)] hover:border-primary-300 bg-transparent"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{method.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {method.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
