import Link from "next/link";
import { CatNav } from "@/components/CatNav";
import { LessonCard } from "@/components/LessonCard";
import { getSessionProfile } from "@/lib/auth";
import { getActiveCategories, getPublishedLessons, getUserFavoriteLessonIds } from "@/lib/data";

export const revalidate = 120;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g: filterId = "" } = await searchParams;
  const [categories, lessons, profile] = await Promise.all([
    getActiveCategories(),
    getPublishedLessons(),
    getSessionProfile(),
  ]);
  const favoriteIds = profile ? await getUserFavoriteLessonIds(profile.id) : new Set<string>();
  const catById = new Map(categories.map((c) => [c.id, c]));
  const topGenres = categories.filter((c) => !c.parent_id);

  const filtered = filterId
    ? lessons.filter((l) => {
        const cat = catById.get(l.category_id);
        return l.category_id === filterId || cat?.parent_id === filterId;
      })
    : lessons;

  return (
    <>
      <CatNav />
      <div className="static-page courses-page">
        <div className="static-page__head">
          <Link href="/" className="static-page__back">
            ← トップへ戻る
          </Link>
          <div className="static-page__eyebrow">全授業</div>
          <h1 className="static-page__title">授業一覧</h1>
          <p className="static-page__lead">
            URIBOH に掲載されている全 {lessons.length} 授業。ジャンルで絞り込めます。
          </p>
          <div className="filter-chips">
            <Link href="/courses" className={`filter-chip${!filterId ? " filter-chip--active" : ""}`}>
              すべて<span className="filter-chip__n">{lessons.length}</span>
            </Link>
            {topGenres.map((genre) => {
              const n = lessons.filter((l) => {
                const cat = catById.get(l.category_id);
                return l.category_id === genre.id || cat?.parent_id === genre.id;
              }).length;
              return (
                <Link
                  key={genre.id}
                  href={`/courses?g=${encodeURIComponent(genre.id)}`}
                  className={`filter-chip${filterId === genre.id ? " filter-chip--active" : ""}`}
                >
                  {genre.label}
                  <span className="filter-chip__n">{n}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="courses-grid" style={{ padding: "0 28px 48px" }}>
          {filtered.length === 0 ? (
            <div className="no-result">該当する授業がありません</div>
          ) : (
            filtered.map((lesson) => {
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
            })
          )}
        </div>
      </div>
    </>
  );
}
