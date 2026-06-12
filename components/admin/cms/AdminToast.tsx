import { useAppToast } from "@/components/AppToast";

/** @deprecated Use useAppToast — kept for admin CRUD components. */
export function useAdminToast() {
  return useAppToast();
}
