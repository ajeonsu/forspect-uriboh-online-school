"use client";

import { useAppToast } from "@/components/AppToast";
import { useConfirm } from "@/components/AppConfirm";
import { withPublicConfirm } from "@/lib/confirm-action";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonDetailHeadActions({
  lessonId,
  initialFavorited,
}: {
  lessonId: string;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const { push: toast } = useAppToast();
  const { confirm } = useConfirm();
  const [fav, setFav] = useState(initialFavorited);

  async function toggleFavorite() {
    if (fav) {
      if (!(await confirm(withPublicConfirm("お気に入りから削除しますか？")))) return;
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
      setFav(false);
      toast("お気に入りから削除しました");
      return;
    }
    if (!(await confirm(withPublicConfirm("お気に入りに追加しますか？")))) return;
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
    setFav(true);
    toast("お気に入りに追加しました");
  }

  return (
    <button
      type="button"
      className={`fav-btn${fav ? " fav-btn--on" : ""}`}
      aria-pressed={fav}
      onClick={() => void toggleFavorite()}
    >
      <span className="fav-btn__icon">{fav ? "★" : "☆"}</span>
      <span>{fav ? "お気に入り済み" : "お気に入り"}</span>
    </button>
  );
}

export function LessonLikeActions({
  lessonId,
  initialLiked,
  initialCount,
}: {
  lessonId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const { push: toast } = useAppToast();
  const { confirm } = useConfirm();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function toggleLike() {
    if (
      !(await confirm(
        withPublicConfirm(liked ? "いいねを取り消しますか？" : "いいねしますか？"),
      ))
    ) {
      return;
    }
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/lessons/${lessonId}/like`, { method });
    if (res.status === 401) {
      toast("いいねするにはログインしてください", "error");
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!res.ok) {
      toast("いいねの更新に失敗しました", "error");
      return;
    }
    setLiked(!liked);
    setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    toast(liked ? "いいねを取り消しました" : "いいねしました");
  }

  return (
    <div className="catalog-head__meta" style={{ marginTop: 8 }}>
      <button
        type="button"
        className={`like-btn like-btn--lg${liked ? " like-btn--liked" : ""}`}
        onClick={() => void toggleLike()}
      >
        <span className="like-btn__icon">{liked ? "♥" : "♡"}</span>
        <span className="like-btn__count">{count.toLocaleString()}</span>
      </button>
    </div>
  );
}
