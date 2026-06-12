"use client";

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
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (on) {
        const res = await fetch(`/api/favorites/${lessonId}`, { method: "DELETE" });
        if (res.status === 401) {
          router.push("/login?next=" + encodeURIComponent(window.location.pathname));
          return;
        }
        if (res.ok) setOn(false);
        return;
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        if (res.status === 401) {
          router.push("/login?next=" + encodeURIComponent(window.location.pathname));
          return;
        }
        if (res.ok) setOn(true);
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
