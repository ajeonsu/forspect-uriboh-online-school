import Link from "next/link";
import { CatNav } from "@/components/CatNav";
import { LessonCard } from "@/components/LessonCard";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveCategories } from "@/lib/data";
import type { Lesson } from "@/lib/types";

export default async function FavoritesPage() {
  const profile = await getSessionProfile();

  return (
    <>
      <CatNav />
      <div className="static-page favorites-page">
        <div className="static-page__head">
          <Link href="/" className="static-page__back">
            ← トップへ戻る
          </Link>
          <div className="static-page__eyebrow">MY LIBRARY</div>
          <h1 className="static-page__title">お気に入りの授業</h1>
          <p className="static-page__lead">
            {profile
              ? "あなたがブックマークした授業です。"
              : "お気に入りを保存するにはログインしてください。"}
          </p>
        </div>
        {!profile ? (
          <p style={{ padding: "0 28px" }}>
            <Link href="/login">ログイン</Link>
          </p>
        ) : (
          <FavoritesList userId={profile.id} />
        )}
      </div>
    </>
  );
}

async function FavoritesList({ userId }: { userId: string }) {
  const supabase = await createClient();
  const categories = await getActiveCategories();
  const catById = new Map(categories.map((c) => [c.id, c]));

  const { data } = await supabase
    .from("favorites")
    .select(
      `lesson:lessons(id, category_id, lesson_no, slug, title, excerpt, thumbnail_path, thumbnail_url, thumb_intro, thumb_accent, thumb_subtitle, views_count, likes_count, popular_rank, status, published_at)`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const lessons = (data ?? [])
    .map((row) => {
      const raw = row as { lesson: Lesson | Lesson[] | null };
      const lesson = raw.lesson;
      if (Array.isArray(lesson)) return lesson[0] ?? null;
      return lesson;
    })
    .filter((l): l is Lesson => Boolean(l));

  if (lessons.length === 0) {
    return (
      <div className="favorites-empty" style={{ padding: "24px 28px" }}>
        <p>お気に入りはまだありません。</p>
        <Link href="/courses" className="btn btn--primary" style={{ display: "inline-block", marginTop: 16 }}>
          授業を探す
        </Link>
      </div>
    );
  }

  return (
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
            favorited
          />
        );
      })}
    </div>
  );
}
