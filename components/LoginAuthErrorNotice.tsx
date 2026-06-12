"use client";

import { useAppToast } from "@/components/AppToast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function LoginAuthErrorNotice() {
  const err = useSearchParams().get("error");
  const { push: toast } = useAppToast();

  useEffect(() => {
    if (err === "auth_callback") {
      toast(
        "Googleログインに失敗しました。SupabaseとGoogleのリダイレクトURLを確認してください。",
        "error",
      );
    }
  }, [err, toast]);

  return null;
}
