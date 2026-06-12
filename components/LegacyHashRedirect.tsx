"use client";

import { useEffect } from "react";

function mapHash(hash: string): string | null {
  const h = hash.replace(/^#/, "");
  const lesson = h.match(/^\/g\/([\w-]+)\/(\d+)/);
  if (lesson) return `/lessons/${lesson[1]}/${lesson[2]}`;
  const genre = h.match(/^\/g\/([\w-]+)/);
  if (genre) {
    if (genre[1] === "ai") return "/lessons/ai-chatgpt";
    return `/lessons/${genre[1]}`;
  }
  if (h === "/courses" || h.startsWith("/courses")) return "/courses";
  if (h === "/categories") return "/categories";
  if (h === "/seminars" || h.startsWith("/seminars")) return "/seminars";
  if (h === "/favorites") return "/favorites";
  if (h.startsWith("/search")) {
    const q = (h.match(/[?&]q=([^&]+)/) || [])[1];
    return q ? `/search?q=${encodeURIComponent(decodeURIComponent(q.replace(/\+/g, " ")))}` : "/search";
  }
  const seminar = h.match(/^\/seminar\/(.+)$/);
  if (seminar) return `/seminars/${seminar[1]}`;
  return null;
}

export function LegacyHashRedirect() {
  useEffect(() => {
    const target = mapHash(window.location.hash);
    window.location.replace(target ?? "/");
  }, []);

  return (
    <div className="static-page" style={{ padding: 48, textAlign: "center" }}>
      <p>旧URLからリダイレクトしています…</p>
    </div>
  );
}
