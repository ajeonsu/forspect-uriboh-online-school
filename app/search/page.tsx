import Link from "next/link";
import { CatNav } from "@/components/CatNav";
import { LessonCard } from "@/components/LessonCard";
import { getSessionProfile } from "@/lib/auth";
import { recordSearchQuery } from "@/lib/analytics/record";
import {
  getActiveCategories,
  getPublishedSeminars,
  getUserFavoriteLessonIds,
  searchLessons,
} from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  if (query) await recordSearchQuery(query);
  const [categories, lessons, seminars, profile] = await Promise.all([
    getActiveCategories(),
    query ? searchLessons(query) : Promise.resolve([]),
    query ? getPublishedSeminars() : Promise.resolve([]),
    getSessionProfile(),
  ]);
  const favoriteIds = profile ? await getUserFavoriteLessonIds(profile.id) : new Set<string>();
  const catById = new Map(categories.map((c) => [c.id, c]));
  const seminarHits = query
    ? seminars.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          (s.description ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <>
      <CatNav />
      <div className="static-page">
        <div className="static-page__head">
          <h1 className="static-page__title">検索</h1>
          <form action="/search" method="get" className="header-search" style={{ maxWidth: 480, marginTop: 16 }}>
            <input type="search" name="q" defaultValue={query} placeholder="キーワードで検索" aria-label="検索" />
          </form>
        </div>
        {query && (
          <p className="static-page__lead" style={{ padding: "0 28px" }}>
            「{query}」の結果: 授業 {lessons.length} 件
            {seminarHits.length > 0 ? ` · セミナー ${seminarHits.length} 件` : ""}
          </p>
        )}
        {!query && (
          <p className="static-page__lead" style={{ padding: "0 28px" }}>
            キーワードを入力して検索してください。
          </p>
        )}
        <div className="courses-grid" style={{ padding: "0 28px 48px" }}>
          {lessons.map((lesson) => {
            const cat = catById.get(lesson.category_id);
            if (!cat) return null;
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                category={cat}
                categoryLabel={cat.label}
                favorited={favoriteIds.has(lesson.id)}
              />
            );
          })}
        </div>
        {seminarHits.length > 0 && (
          <section className="section" style={{ padding: "32px 28px" }}>
            <h2 className="section__title">セミナー</h2>
            <div className="seminar-grid">
              {seminarHits.map((s) => (
                <Link key={s.id} href={`/seminars/${s.id}`} className="seminar-card">
                  <div className="seminar-card__inner">
                    <h3 className="seminar-card__title">{s.title}</h3>
                    <p className="seminar-card__desc">{s.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        {query && lessons.length === 0 && seminarHits.length === 0 && (
          <p style={{ padding: "0 28px" }}>該当するコンテンツが見つかりませんでした。</p>
        )}
      </div>
    </>
  );
}
