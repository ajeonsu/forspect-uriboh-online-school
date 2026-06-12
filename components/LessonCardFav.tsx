"use client";

import { useAppToast } from "@/components/AppToast";
import { useConfirm } from "@/components/AppConfirm";
import { withPublicConfirm } from "@/lib/confirm-action";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonCardFav({
  lessonId,
  initialOn = false,
}: {
  lessonId: string;
  initialOn?: boolean;
}) {
  const router = useRouter();
  const { push: toast } = useAppToast();
  const { confirm } = useConfirm();
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (on) {
      if (!(await confirm(withPublicConfirm("お気に入りから削除しますか？")))) return;
    } else if (!(await confirm(withPublicConfirm("お気に入りに追加しますか？")))) {
      return;
    }
    setBusy(true);
    try {
      if (on) {
        const res = await fetch(`/api/favorites/${lessonId}`, { method: "DELETE" });
        if (res.status === 401) {
          toast("お気に入りの変更にはログインが必要です", "error");
          router.push("/login?next=" + encodeURIComponent(window.location.pathname));
          return;
        }
        if (!res.ok) {
          toast("お気に入りの更新に失敗しました", "error");
          return;
        }
        setOn(false);
        toast("お気に入りから削除しました");
        return;
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        if (res.status === 401) {
          toast("お気に入りの変更にはログインが必要です", "error");
          router.push("/login?next=" + encodeURIComponent(window.location.pathname));
          return;
        }
        if (!res.ok) {
          toast("お気に入りの更新に失敗しました", "error");
          return;
        }
        setOn(true);
        toast("お気に入りに追加しました");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`ccard__fav${on ? " ccard__fav--on" : ""}`}
      aria-pressed={on}
      aria-label="お気に入りに追加"
      onClick={(e) => void toggle(e)}
      disabled={busy}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
