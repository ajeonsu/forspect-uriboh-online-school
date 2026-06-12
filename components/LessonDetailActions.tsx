"use client";

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
  const [fav, setFav] = useState(initialFavorited);

  async function toggleFavorite() {
    if (fav) {
      const res = await fetch(`/api/favorites/${lessonId}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      if (res.ok) setFav(false);
      return;
    }
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    if (res.status === 401) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (res.ok) setFav(true);
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
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [msg, setMsg] = useState("");

  async function toggleLike() {
    setMsg("");
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/lessons/${lessonId}/like`, { method });
    if (res.status === 401) {
      setMsg("いいねするにはログインしてください");
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!res.ok) {
      setMsg("いいねの更新に失敗しました");
      return;
    }
    setLiked(!liked);
    setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
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
      {msg && (
        <span style={{ fontSize: 12, color: "#E11D48", marginLeft: 8 }}>{msg}</span>
      )}
    </div>
  );
}
