import Link from "next/link";
import { Carousel } from "@/components/Carousel";
import { LessonCard } from "@/components/LessonCard";
import { createClient } from "@/lib/supabase/server";
import { getActiveCategories } from "@/lib/data";
import type { Category, Lesson } from "@/lib/types";

export async function HomeFavorites({ userId }: { userId: string }) {
  const supabase = await createClient();
  const categories = await getActiveCategories();
  const catById = new Map(categories.map((c) => [c.id, c]));

  const { data } = await supabase
    .from("favorites")
    .select("lesson:lessons(*)")
    .eq("user_id", userId)
    .limit(8);

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
      <div className="home-fav-empty">
        <div className="home-fav-empty__icon">☆</div>
        <p className="home-fav-empty__lead">お気に入りはまだ登録されていません</p>
        <p className="home-fav-empty__sub">
          気になる授業の <strong>★ 保存</strong> を押すと、ここに自動で並びます
        </p>
        <Link href="/courses" className="home-fav-empty__cta">
          授業を探す →
        </Link>
      </div>
    );
  }

  return (
    <Carousel>
      {lessons.map((lesson) => {
        const cat = catById.get(lesson.category_id);
        if (!cat) return null;
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            category={cat}
            favorited
            compact
          />
        );
      })}
    </Carousel>
  );
}
