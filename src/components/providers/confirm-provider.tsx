"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type ConfirmContextValue = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

/**
 * Promise-based confirmation dialog that replaces native window.confirm().
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Excluir rifa?", description: "Ação irreversível." })) { ... }
 */
export function useConfirm(): ConfirmContextValue {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    open: boolean;
    opts: ConfirmOptions | null;
    resolver: ((v: boolean) => void) | null;
  }>({
    open: false,
    opts: null,
    resolver: null,
  });

  const confirm = React.useCallback<ConfirmContextValue>((opts) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolver: resolve });
    });
  }, []);

  function handleOpenChange(open: boolean) {
    if (!open && state.resolver) {
      state.resolver(false);
      setState({ open: false, opts: null, resolver: null });
    }
  }

  function handleConfirm() {
    if (state.resolver) state.resolver(true);
    setState({ open: false, opts: null, resolver: null });
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.opts && (
        <ConfirmDialog
          open={state.open}
          onOpenChange={handleOpenChange}
          title={state.opts.title}
          description={state.opts.description ?? ""}
          confirmLabel={state.opts.confirmLabel}
          cancelLabel={state.opts.cancelLabel}
          variant={state.opts.variant}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
}
