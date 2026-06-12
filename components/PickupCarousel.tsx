"use client";

import { Children, useEffect, useRef } from "react";
import { PICKUP_AUTO_MS } from "@/lib/pickup-config";

/**
 * Infinite center-snap pickup track (ported from static index.html initPickupCarousel).
 */
export function PickupCarousel({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const slideCount = Children.count(children);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const dotsBox = dotsRef.current;
    if (!wrap || !track || !dotsBox || slideCount === 0) return;

    const realItems = Array.from(track.querySelectorAll<HTMLElement>(".pickup-item:not(.pickup-item--clone)"));
    const N = realItems.length;
    if (N === 0) return;

    const cloneCount = Math.min(N, 6);

    for (let i = N - cloneCount; i < N; i++) {
      const c = realItems[i].cloneNode(true) as HTMLElement;
      c.classList.add("pickup-item--clone");
      c.setAttribute("aria-hidden", "true");
      track.insertBefore(c, realItems[0]);
    }
    for (let i = 0; i < cloneCount; i++) {
      const c = realItems[i].cloneNode(true) as HTMLElement;
      c.classList.add("pickup-item--clone");
      c.setAttribute("aria-hidden", "true");
      track.appendChild(c);
    }

    const allItems = Array.from(track.querySelectorAll<HTMLElement>(".pickup-item"));
    const offset = cloneCount;
    const lastRealIdx = offset + N - 1;

    let currentIdx = offset;
    let isPaused = false;
    let isTeleporting = false;
    let pickupTimer: ReturnType<typeof setInterval> | null = null;

    const leftBtn = wrap.querySelector<HTMLButtonElement>(".pickup-arrow--left");
    const rightBtn = wrap.querySelector<HTMLButtonElement>(".pickup-arrow--right");

    const realIndex = () => ((currentIdx - offset) % N + N) % N;

    const buildDots = () => {
      dotsBox.innerHTML = Array.from(
        { length: N },
        (_, i) =>
          `<button type="button" class="pickup-dot${i === realIndex() ? " pickup-dot--active" : ""}" data-idx="${i}" aria-label="${i + 1}枚目へ"></button>`,
      ).join("");
      dotsBox.querySelectorAll<HTMLButtonElement>(".pickup-dot").forEach((d) => {
        d.addEventListener("click", (e) => {
          e.preventDefault();
          scrollTo(offset + parseInt(d.dataset.idx ?? "0", 10));
        });
      });
    };

    const updateDots = () => {
      const r = realIndex();
      dotsBox.querySelectorAll<HTMLElement>(".pickup-dot").forEach((d, i) => {
        d.classList.toggle("pickup-dot--active", i === r);
      });
    };

    const updateCenter = () => {
      allItems.forEach((it, i) => it.classList.toggle("pickup-item--center", i === currentIdx));
    };

    const setScrollLeftInstant = (val: number) => {
      const prev = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = val;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = prev;
      });
    };

    const centerOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;

    const teleportIfNeeded = () => {
      let target = currentIdx;
      if (currentIdx < offset) target = currentIdx + N;
      else if (currentIdx > lastRealIdx) target = currentIdx - N;
      if (target === currentIdx) return;
      isTeleporting = true;
      currentIdx = target;
      const item = allItems[target];
      if (item) setScrollLeftInstant(centerOf(item));
      updateCenter();
      setTimeout(() => {
        isTeleporting = false;
      }, 60);
    };

    const scrollTo = (idx: number, instant = false) => {
      if (idx < 0 || idx >= allItems.length) return;
      currentIdx = idx;
      const item = allItems[idx];
      if (item) {
        const target = centerOf(item);
        if (instant) setScrollLeftInstant(target);
        else track.scrollTo({ left: target, behavior: "smooth" });
      }
      updateDots();
      updateCenter();
      if (!instant) setTimeout(teleportIfNeeded, 700);
    };

    const next = () => scrollTo(currentIdx + 1);
    const prev = () => scrollTo(currentIdx - 1);

    const startAuto = () => {
      if (pickupTimer) clearInterval(pickupTimer);
      pickupTimer = setInterval(() => {
        if (!isPaused) next();
      }, PICKUP_AUTO_MS);
    };

    const onLeft = (e: Event) => {
      e.preventDefault();
      prev();
    };
    const onRight = (e: Event) => {
      e.preventDefault();
      next();
    };

    leftBtn?.addEventListener("click", onLeft);
    rightBtn?.addEventListener("click", onRight);

    const pause = () => {
      isPaused = true;
    };
    const unpause = () => {
      isPaused = false;
    };
    wrap.addEventListener("mouseenter", pause);
    wrap.addEventListener("mouseleave", unpause);
    wrap.addEventListener("touchstart", pause, { passive: true });
    let touchTimer: ReturnType<typeof setTimeout> | null = null;
    const onTouchEnd = () => {
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(unpause, 2000);
    };
    wrap.addEventListener("touchend", onTouchEnd, { passive: true });

    let scrollDebounce: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (isTeleporting) return;
      if (scrollDebounce) clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = currentIdx;
        let minDist = Infinity;
        allItems.forEach((it, i) => {
          const c = it.offsetLeft + it.offsetWidth / 2;
          const d = Math.abs(c - center);
          if (d < minDist) {
            minDist = d;
            closest = i;
          }
        });
        if (closest !== currentIdx) {
          currentIdx = closest;
          updateDots();
          updateCenter();
          teleportIfNeeded();
        }
      }, 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });

    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => scrollTo(currentIdx, true), 120);
    };
    window.addEventListener("resize", onResize);

    buildDots();
    updateCenter();
    requestAnimationFrame(() => {
      const item = allItems[currentIdx];
      if (item) setScrollLeftInstant(centerOf(item));
    });
    startAuto();

    return () => {
      if (pickupTimer) clearInterval(pickupTimer);
      if (touchTimer) clearTimeout(touchTimer);
      if (scrollDebounce) clearTimeout(scrollDebounce);
      if (resizeDebounce) clearTimeout(resizeDebounce);
      leftBtn?.removeEventListener("click", onLeft);
      rightBtn?.removeEventListener("click", onRight);
      wrap.removeEventListener("mouseenter", pause);
      wrap.removeEventListener("mouseleave", unpause);
      wrap.removeEventListener("touchstart", pause);
      wrap.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      track.querySelectorAll(".pickup-item--clone").forEach((el) => el.remove());
    };
  }, [slideCount]);

  return (
    <div className="pickup-wrap" ref={wrapRef}>
      <div className="pickup-backdrop" aria-hidden />
      <button type="button" className="pickup-arrow pickup-arrow--left" aria-label="前へ">
        ‹
      </button>
      <button type="button" className="pickup-arrow pickup-arrow--right" aria-label="次へ">
        ›
      </button>
      <div className="pickup-track" ref={trackRef}>
        {children}
      </div>
      {slideCount > 1 && <div className="pickup-dots" ref={dotsRef} role="tablist" aria-label="ピックアップ" />}
    </div>
  );
}
