"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface CouponInputProps {
  onApply: (code: string) => void;
}

export function CouponInput({ onApply }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
      setCode("");
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-primary-500 transition-colors"
      >
        <Tag className="h-3.5 w-3.5" />
        Cupom
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="CODIGO"
        className="h-9 w-28 rounded-lg border border-[var(--input)] bg-transparent px-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary-500"
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        autoFocus
      />
      <Button size="sm" variant="outline" onClick={handleApply}>
        Aplicar
      </Button>
    </div>
  );
}
