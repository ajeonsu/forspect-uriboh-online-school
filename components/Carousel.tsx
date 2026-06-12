"use client";

import { useRef } from "react";

export function Carousel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  return (
    <div className="carousel-wrap">
      <button
        type="button"
        className="carousel-arrow carousel-arrow--left"
        aria-label="前へ"
        onClick={() => scroll(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="carousel-arrow carousel-arrow--right"
        aria-label="次へ"
        onClick={() => scroll(1)}
      >
        ›
      </button>
      <div ref={ref} className={`carousel${className ? ` ${className}` : ""}`}>
        {children}
      </div>
    </div>
  );
}
