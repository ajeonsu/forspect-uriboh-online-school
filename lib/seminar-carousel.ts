import { STATIC_SEMINAR_SEED } from "@/lib/data/static-seminar-seed";
import type { Seminar } from "@/lib/types";

export const SEMINAR_CATS: Record<string, { label: string; color: string }> = {
  ai: { label: "AI", color: "#6366f1" },
  claude: { label: "Claude", color: "#8b5cf6" },
  sns: { label: "SNS", color: "#c13584" },
  sales: { label: "営業", color: "#2563eb" },
  money: { label: "お金・税金", color: "#16a34a" },
  other: { label: "その他", color: "#6b7280" },
};

export type SeminarCarouselItem = {
  id: string;
  href: string;
  title: string;
  host: string;
  categoryKey: string;
  dateISO: string;
  format: "online" | "offline" | "hybrid";
  price: string;
};

/** Static demo seminars (shown when DB has none published). */
export const SAMPLE_SEMINAR_CAROUSEL: SeminarCarouselItem[] = [
  {
    id: "sample-001",
    href: "/seminars",
    title: "ChatGPT × 業務効率化セミナー｜現役マーケターが実演する3つのシーン",
    host: "佐藤 直樹",
    categoryKey: "ai",
    dateISO: "2026-06-15",
    format: "online",
    price: "無料",
  },
  {
    id: "sample-002",
    href: "/seminars",
    title: "Instagram運用1day集中ワークショップ｜プロフ4行→リール台本まで",
    host: "鈴木 麻衣",
    categoryKey: "sns",
    dateISO: "2026-06-22",
    format: "offline",
    price: "8,800円（税込）",
  },
  {
    id: "sample-003",
    href: "/seminars",
    title: "法人税&決算対策セミナー｜中小企業の経営者向け",
    host: "高橋 健一",
    categoryKey: "money",
    dateISO: "2026-07-05",
    format: "online",
    price: "3,300円（税込）",
  },
  {
    id: "sample-004",
    href: "/seminars",
    title: "即決営業の型を1日で体得｜ロープレ8セット+講師添削",
    host: "山田 翔太",
    categoryKey: "sales",
    dateISO: "2026-07-12",
    format: "offline",
    price: "16,500円（税込）",
  },
  {
    id: "sample-005",
    href: "/seminars",
    title: "Claude Codeで非エンジニアも自動化｜実践ハンズオン",
    host: "中村 光",
    categoryKey: "ai",
    dateISO: "2026-07-20",
    format: "online",
    price: "無料",
  },
];

function inferFormat(location: string | null): "online" | "offline" | "hybrid" {
  const loc = (location ?? "").toLowerCase();
  if (!loc) return "online";
  if (/zoom|online|youtube|オンライン|live/i.test(loc)) return "online";
  if (/会場|渋谷|大阪|東京|offline/i.test(loc)) return "offline";
  return "hybrid";
}

function categoryFromSeminar(s: Seminar): string {
  const tag = s.category_tags?.[0]?.toLowerCase() ?? "";
  if (tag in SEMINAR_CATS) return tag;
  if (tag.includes("ai") || tag.includes("chatgpt")) return "ai";
  if (tag.includes("sns") || tag.includes("instagram")) return "sns";
  if (tag.includes("営業") || tag === "sales") return "sales";
  if (tag.includes("税") || tag.includes("money")) return "money";
  return "other";
}

function priceFromDescription(s: Seminar): string {
  const d = s.description ?? "";
  if (/無料/.test(d)) return "無料";
  const m = d.match(/(\d[\d,]*円[^<\n]*)/);
  return m?.[1] ?? "—";
}

export function seminarToCarouselItem(s: Seminar, priceOverride?: string): SeminarCarouselItem {
  return {
    id: s.id,
    href: `/seminars/${s.id}`,
    title: s.title,
    host: s.host_name ?? "",
    categoryKey: categoryFromSeminar(s),
    dateISO: s.start_at ? s.start_at.slice(0, 10) : "",
    format: inferFormat(s.location),
    price: priceOverride ?? priceFromDescription(s),
  };
}

/** Map static seed metadata price labels when bridging samples. */
export function seminarToCarouselItemWithMeta(
  s: Seminar,
  meta?: { price?: string },
): SeminarCarouselItem {
  return seminarToCarouselItem(s, meta?.price);
}

export function getHomeSeminarCarouselItems(dbSeminars: Seminar[]): SeminarCarouselItem[] {
  const fromDb = dbSeminars.map((s) => {
    const seed = STATIC_SEMINAR_SEED.find((x) => x.title === s.title);
    return seminarToCarouselItem(s, seed?.price_label);
  });
  if (fromDb.length > 0) return fromDb.slice(0, 12);
  return SAMPLE_SEMINAR_CAROUSEL;
}

export function formatLabel(fmt: SeminarCarouselItem["format"]) {
  return fmt === "online" ? "オンライン" : fmt === "offline" ? "会場開催" : "ハイブリッド";
}

export function formatIcon(fmt: SeminarCarouselItem["format"]) {
  return fmt === "online" ? "🖥️" : fmt === "offline" ? "📍" : "🔀";
}

export function seminarCategoryStyle(key: string) {
  return SEMINAR_CATS[key] ?? SEMINAR_CATS.other;
}
