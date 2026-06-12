"use client";

import { AppConfirmProvider } from "@/components/AppConfirm";
import { AppToastProvider } from "@/components/AppToast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppToastProvider>
      <AppConfirmProvider>{children}</AppConfirmProvider>
    </AppToastProvider>
  );
}
