import Link from "next/link";
import {
  formatIcon,
  formatLabel,
  seminarCategoryStyle,
  type SeminarCarouselItem,
} from "@/lib/seminar-carousel";

export function SeminarCarouselCard({ item }: { item: SeminarCarouselItem }) {
  const cat = seminarCategoryStyle(item.categoryKey);
  const isFree = item.price === "無料";
  const day = item.dateISO.slice(8, 10) || "—";
  const month = item.dateISO.slice(5, 7) ? `${Number(item.dateISO.slice(5, 7))}月` : "";

  return (
    <Link href={item.href} className="seminar-carousel-card">
      <div
        className="seminar-carousel-card__cover"
        style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}88)` }}
      >
        <div className="seminar-carousel-card__date">
          <div className="seminar-carousel-card__date-day">{day}</div>
          <div className="seminar-carousel-card__date-mon">{month}</div>
        </div>
        <div className="seminar-carousel-card__fmt">
          {formatIcon(item.format)} {formatLabel(item.format)}
        </div>
      </div>
      <div className="seminar-carousel-card__body">
        <div className="seminar-carousel-card__head">
          <span
            className="seminar-card__cat"
            style={{ background: `${cat.color}15`, color: cat.color }}
          >
            {cat.label}
          </span>
          <span className={`seminar-card__price${isFree ? " seminar-card__price--free" : ""}`}>
            {item.price}
          </span>
        </div>
        <h3 className="seminar-carousel-card__title">{item.title}</h3>
        <div className="seminar-carousel-card__host">{item.host}</div>
      </div>
    </Link>
  );
}

export function SeminarCarouselCta() {
  return (
    <Link href="/seminars" className="seminar-carousel-card seminar-carousel-card--cta">
      <div className="seminar-carousel-cta__inner">
        <div className="seminar-carousel-cta__plus">＋</div>
        <div className="seminar-carousel-cta__title">
          あなたのセミナーを
          <br />
          告知する
        </div>
        <div className="seminar-carousel-cta__sub">一覧から詳しく見る</div>
      </div>
    </Link>
  );
}
