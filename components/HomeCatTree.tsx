import Link from "next/link";
import type { Category, Lesson } from "@/lib/types";
import { countLessonsForParent } from "@/lib/home-sections";

const HIDE_SUBS_ON_HOME = new Set(["money"]);

function childLabel(label: string) {
  return label.replace(/^(AI-|SNS-|ニュース-)/, "");
}

export function HomeCatTree({
  categories,
  lessons,
}: {
  categories: Category[];
  lessons: Lesson[];
}) {
  const parents = categories.filter((c) => !c.parent_id);
  const totalCourses = lessons.length;

  return (
    <section className="section">
      <div className="section__head">
        <div className="section__title">
          <h2>カテゴリから探す</h2>
          <p>
            {parents.length}つの学習ジャンル ・ 全{totalCourses}授業
          </p>
        </div>
      </div>
      <div className="cat-tree">
        {parents.map((parent) => {
          const subs = categories.filter((c) => c.parent_id === parent.id);
          const topicCount = countLessonsForParent(parent, categories, lessons);
          const showAsList = subs.length === 0 || HIDE_SUBS_ON_HOME.has(parent.id);

          return (
            <div key={parent.id} className="cat-tree__row">
              <Link href={`/lessons/${parent.id}`} className="cat-tree__parent">
                <span className="cat-tree__parent-label">{parent.label}</span>
                <span className="cat-tree__parent-n">{topicCount}</span>
                <span className="cat-tree__parent-arrow">›</span>
              </Link>
              <div className="cat-tree__children">
                {!showAsList
                  ? subs.map((s) => {
                      const n = lessons.filter((l) => l.category_id === s.id).length;
                      return (
                        <Link key={s.id} href={`/lessons/${s.id}`} className="cat-tree__child">
                          <span className="cat-tree__child-label">{childLabel(s.label)}</span>
                          <span className="cat-tree__child-n">{n}</span>
                        </Link>
                      );
                    })
                  : (
                    <Link href={`/lessons/${parent.id}`} className="cat-tree__child cat-tree__child--all">
                      <span className="cat-tree__child-label">授業一覧へ</span>
                      <span className="cat-tree__child-n">{topicCount}</span>
                    </Link>
                  )}
              </div>
            </div>
          );
        })}
        <div className="cat-tree__row">
          <Link href="/seminars" className="cat-tree__parent">
            <span className="cat-tree__parent-label">セミナー / ウェビナー</span>
            <span className="cat-tree__parent-arrow">›</span>
          </Link>
          <div className="cat-tree__children">
            <Link href="/seminars" className="cat-tree__child cat-tree__child--all">
              <span className="cat-tree__child-label">セミナー一覧へ</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
