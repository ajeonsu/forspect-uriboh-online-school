export type ToastTone = "ok" | "error";

const STORAGE_KEY = "uriboh_flash_toast";

export function queueFlashToast(message: string, tone: ToastTone = "ok") {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ message, tone }));
}

export function consumeFlashToast(): { message: string; tone: ToastTone } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw) as { message?: string; tone?: ToastTone };
    if (!parsed.message) return null;
    return { message: parsed.message, tone: parsed.tone ?? "ok" };
  } catch {
    return null;
  }
}
