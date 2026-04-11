"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Tag, X } from "lucide-react";
import { CouponInput } from "./coupon-input";

interface CheckoutSummaryProps {
  selectedCount: number;
  pricePerNumber: number;
  discount: number;
  couponCode: string | null;
  onCouponApply: (code: string) => void;
  onCouponRemove: () => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function CheckoutSummary({
  selectedCount,
  pricePerNumber,
  discount,
  couponCode,
  onCouponApply,
  onCouponRemove,
  onCheckout,
  isLoading,
}: CheckoutSummaryProps) {
  const subtotal = selectedCount * pricePerNumber;
  const total = Math.max(0, subtotal - discount);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-lg p-4 shadow-2xl lg:sticky lg:bottom-auto lg:rounded-xl lg:border lg:shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary-500">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">
                {selectedCount} {selectedCount === 1 ? "numero" : "numeros"}
              </span>
            </div>

            {couponCode && (
              <div className="flex items-center gap-1 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-600">
                <Tag className="h-3 w-3" />
                {couponCode}
                <button
                  onClick={onCouponRemove}
                  className="ml-1 hover:text-accent-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!couponCode && (
              <CouponInput onApply={onCouponApply} />
            )}

            <div className="text-right">
              {discount > 0 && (
                <p className="text-xs text-[var(--muted-foreground)] line-through">
                  {formatCurrency(subtotal)}
                </p>
              )}
              <p className="text-lg font-bold text-[var(--foreground)]">
                {formatCurrency(total)}
              </p>
            </div>

            <Button
              size="lg"
              onClick={onCheckout}
              isLoading={isLoading}
              className="min-w-[140px]"
            >
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
