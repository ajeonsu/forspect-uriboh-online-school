import type { ConfirmRequest } from "@/components/AppConfirm";

/** Defaults for English admin confirmations. */
export const adminConfirmLabels = {
  cancelLabel: "Cancel",
  confirmLabel: "Confirm",
} as const;

/** Defaults for Japanese public-site confirmations. */
export const publicConfirmLabels = {
  cancelLabel: "キャンセル",
  confirmLabel: "OK",
} as const;

export function withAdminConfirm(message: string, extra?: Partial<ConfirmRequest>): ConfirmRequest {
  return { message, ...adminConfirmLabels, ...extra };
}

export function withPublicConfirm(message: string, extra?: Partial<ConfirmRequest>): ConfirmRequest {
  return { message, ...publicConfirmLabels, ...extra };
}
