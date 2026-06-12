import Link from "next/link";
import { CatNav } from "@/components/CatNav";
import { SeminarCarouselCard } from "@/components/SeminarCarouselCard";
import { getPublishedSeminars } from "@/lib/data";
import { STATIC_SEMINAR_SEED } from "@/lib/data/static-seminar-seed";
import {
  SAMPLE_SEMINAR_CAROUSEL,
  getHomeSeminarCarouselItems,
  seminarToCarouselItem,
} from "@/lib/seminar-carousel";

export default async function SeminarsPage() {
  const seminars = await getPublishedSeminars();
  const items =
    seminars.length > 0
      ? seminars.map((s, i) => {
          const seed = STATIC_SEMINAR_SEED.find((x) => x.title === s.title);
          return seminarToCarouselItem(s, seed?.price_label);
        })
      : getHomeSeminarCarouselItems([]);

  const count = seminars.length > 0 ? seminars.length : items.length;

  return (
    <>
      <CatNav />
      <div className="catalog-head seminars-page">
        <div className="seminars-page__label">COMMUNITY — セミナー告知</div>
        <h1>セミナー</h1>
        <p className="catalog-head__meta" style={{ maxWidth: 720, lineHeight: 1.7 }}>
          URIBOHコミュニティメンバーが主催するセミナー・勉強会の掲示板です。あなたのセミナーも告知できます。申込はGoogleフォームなど外部URLで行います。
        </p>
        <div className="seminars-actions">
          <span className="seminars-count">
            現在掲載中：<strong>{count}</strong> 件
          </span>
        </div>
      </div>
      <section className="section seminars-page">
        {seminars.length === 0 && (
          <p style={{ padding: "0 28px 16px", fontSize: 13, color: "var(--text-muted)" }}>
            データベースにセミナーがまだありません。下記はデモ表示です。管理者は{" "}
            <code>npm run db:seed-seminars</code> で5件を投入できます。
          </p>
        )}
        <div className="seminar-grid seminar-grid--listing">
          {items.map((item) => (
            <SeminarCarouselCard key={item.id} item={item} />
          ))}
        </div>
        {seminars.length === 0 && items === SAMPLE_SEMINAR_CAROUSEL && (
          <p style={{ padding: "16px 28px" }}>
            <Link href="/admin/seminars">管理画面でセミナーを承認・公開</Link>すると、この一覧がDB連動になります。
          </p>
        )}
      </section>
    </>
  );
}
