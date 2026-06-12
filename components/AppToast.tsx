"use client";

import { consumeFlashToast } from "@/lib/flash-toast";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ToastTone = "ok" | "error";

type Toast = { id: number; message: string; tone: ToastTone };

const ToastCtx = createContext<{
  push: (message: string, tone?: ToastTone) => void;
} | null>(null);

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="app-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`app-toast app-toast--${t.tone}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function FlashToastHydrator({ push }: { push: (message: string, tone?: ToastTone) => void }) {
  useEffect(() => {
    const flash = consumeFlashToast();
    if (flash) push(flash.message, flash.tone);
  }, [push]);
  return null;
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: ToastTone = "ok") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <FlashToastHydrator push={push} />
      <ToastStack toasts={toasts} />
    </ToastCtx.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useAppToast must be used within AppToastProvider");
  return ctx;
}
