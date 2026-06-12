import Link from "next/link";
import { CatNav } from "@/components/CatNav";

const FAQ_ITEMS = [
  {
    q: "URIBOHとは何ですか？",
    a: "AI・SNS・営業・お金＆税金の4分野を、10〜15分の記事で学べるオンライン学習プラットフォームです。",
  },
  {
    q: "無料で利用できますか？",
    a: "公開中の授業は無料で閲覧できます。お気に入り保存にはアカウント登録が必要です。",
  },
  {
    q: "スマートフォンでも読めますか？",
    a: "はい。レスポンシブ対応のため、スマートフォン・タブレットでも閲覧できます。",
  },
];

export default function FaqPage() {
  return (
    <>
      <CatNav />
      <div className="static-page">
        <div className="static-page__head">
          <Link href="/" className="static-page__back">
            ← トップへ戻る
          </Link>
          <div className="static-page__eyebrow">FAQ</div>
          <h1 className="static-page__title">よくある質問</h1>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 28px 48px" }}>
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="faq-item" style={{ marginBottom: 12 }}>
              <summary style={{ fontWeight: 700, cursor: "pointer", padding: "12px 0" }}>{item.q}</summary>
              <p style={{ color: "var(--text-soft)", lineHeight: 1.75, paddingBottom: 16 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
