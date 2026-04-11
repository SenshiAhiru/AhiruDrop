"use client";

import { ToastProvider as ToastContextProvider, ToastContainer } from "@/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContextProvider>
      {children}
      <ToastContainer />
    </ToastContextProvider>
  );
}
