import Link from "next/link";
import { CatNav } from "@/components/CatNav";
import { getActiveCategories, getPublishedLessons } from "@/lib/data";

export const revalidate = 120;

export default async function CategoriesPage() {
  const [categories, lessons] = await Promise.all([getActiveCategories(), getPublishedLessons()]);
  const parents = categories.filter((c) => !c.parent_id);

  return (
    <>
      <CatNav />
      <div className="static-page categories-page">
        <div className="static-page__head">
          <Link href="/" className="static-page__back">
            ← トップへ戻る
          </Link>
          <div className="static-page__eyebrow">カテゴリ</div>
          <h1 className="static-page__title">カテゴリ一覧</h1>
          <p className="static-page__lead">学びたい分野から、授業を探せます。</p>
        </div>
        <div className="cat-overview-grid">
          {parents.map((p) => {
            const children = categories.filter((c) => c.parent_id === p.id);
            const count =
              lessons.filter((l) => l.category_id === p.id).length +
              lessons.filter((l) => children.some((c) => c.id === l.category_id)).length;
            return (
              <div key={p.id} className="cat-overview">
                <Link href={`/lessons/${p.id}`} className="cat-overview__head">
                  <div className="cat-overview__icon">{p.emoji ?? "📚"}</div>
                  <div>
                    <div className="cat-overview__title">{p.title}</div>
                    <div className="cat-overview__desc">{p.description ?? p.subtitle}</div>
                    <div className="cat-overview__stats">{count} 授業</div>
                  </div>
                </Link>
                {children.length > 0 && (
                  <div className="cat-overview__subs">
                    {children.map((c) => (
                      <Link key={c.id} href={`/lessons/${c.id}`} className="cat-overview__sub">
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
