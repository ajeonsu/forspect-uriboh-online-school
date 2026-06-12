"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type ConfirmTone = "default" | "danger";

export type ConfirmRequest = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ConfirmState = ConfirmRequest & { open: true };

const ConfirmCtx = createContext<{
  confirm: (options: ConfirmRequest) => Promise<boolean>;
} | null>(null);

function ConfirmModal({
  state,
  onConfirm,
  onCancel,
}: {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  const tone = state.tone ?? "default";
  const confirmLabel = state.confirmLabel ?? "OK";
  const cancelLabel = state.cancelLabel ?? "キャンセル";

  return (
    <div className="app-confirm-root" role="presentation">
      <button
        type="button"
        className="app-confirm-overlay"
        aria-label={cancelLabel}
        onClick={onCancel}
      />
      <div
        className="app-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={state.title ? titleId : descId}
        aria-describedby={descId}
      >
        {state.title ? (
          <h2 id={titleId} className="app-confirm__title">
            {state.title}
          </h2>
        ) : null}
        <p id={descId} className="app-confirm__message">
          {state.message}
        </p>
        <div className="app-confirm__actions">
          <button type="button" className="btn app-confirm__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn app-confirm__ok${tone === "danger" ? " app-confirm__ok--danger" : " btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const finish = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options: ConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {state ? (
        <ConfirmModal
          state={state}
          onConfirm={() => finish(true)}
          onCancel={() => finish(false)}
        />
      ) : null}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within AppConfirmProvider");
  return ctx;
}
