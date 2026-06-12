import Link from "next/link";
import { Carousel } from "@/components/Carousel";
import { CatNav } from "@/components/CatNav";
import { HomeCatTree } from "@/components/HomeCatTree";
import { HomeFavorites } from "@/components/HomeFavorites";
import { LessonCard } from "@/components/LessonCard";
import { LessonThumb } from "@/components/LessonThumb";
import { PickupCarousel } from "@/components/PickupCarousel";
import { PickupItem } from "@/components/PickupItem";
import { SeminarCarouselCard, SeminarCarouselCta } from "@/components/SeminarCarouselCard";
import { getSessionProfile } from "@/lib/auth";
import { buildHomeCarouselSections } from "@/lib/home-sections";
import {
  getActiveCategories,
  getPublishedLessons,
  getPublishedSeminars,
  getUserFavoriteLessonIds,
  lessonHref,
} from "@/lib/data";
import { getPickupLessons } from "@/lib/data-pickup";
import { getHomeSeminarCarouselItems } from "@/lib/seminar-carousel";

export const revalidate = 120;

const INFO_ITEMS = [
  { date: "2026.06.01", title: "新カテゴリ「AIニュース」を追加しました", href: "/lessons/news-ai" },
  { date: "2026.05.20", title: "人気授業ランキングをリニューアル", href: "/#rankingSection" },
  { date: "2026.05.01", title: "セミナー投稿機能をベータ公開中", href: "/seminars" },
];

export default async function HomePage() {
  const [categories, lessons, seminars, profile] = await Promise.all([
    getActiveCategories(),
    getPublishedLessons(),
    getPublishedSeminars(),
    getSessionProfile(),
  ]);
  const favoriteIds = profile ? await getUserFavoriteLessonIds(profile.id) : new Set<string>();
  const catById = new Map(categories.map((c) => [c.id, c]));
  const carouselSections = buildHomeCarouselSections(categories, lessons);

  const ranking = [...lessons]
    .sort((a, b) => {
      const ds = b.likes_count - a.likes_count;
      if (ds !== 0) return ds;
      const ap = a.popular_rank ?? 999;
      const bp = b.popular_rank ?? 999;
      if (ap !== bp) return ap - bp;
      return b.views_count - a.views_count;
    })
    .slice(0, 6);

  const pickup = await getPickupLessons(lessons);
  const homeSeminars = getHomeSeminarCarouselItems(seminars);

  return (
    <>
      <CatNav />

      <section className="pickup-section pickup-section--hero">
        <div className="pickup-section__head">
          <div>
            <h2>おすすめ授業ピックアップ</h2>
            <p>編集部が選ぶ、いま学びたい注目の特集</p>
          </div>
          <Link className="pickup-section__more" href="/lessons/ai-chatgpt">
            すべての特集 →
          </Link>
        </div>
        <PickupCarousel>
          {pickup.map((lesson) => {
            const cat = catById.get(lesson.category_id);
            if (!cat) return null;
            return <PickupItem key={lesson.id} lesson={lesson} category={cat} />;
          })}
        </PickupCarousel>
      </section>

      <section className="info-bar">
        <div className="info-bar__inner">
          <div className="info-bar__label">INFORMATION</div>
          <div className="info-bar__divider" />
          <div className="info-bar__feed">
            {INFO_ITEMS.map((n, i) => (
              <Link
                key={n.title}
                href={n.href}
                className={`info-item${i === 0 ? " info-item--active" : ""}`}
              >
                <span className="info-item__date">{n.date}</span>
                {i === 0 && <span className="info-item__badge">NEW</span>}
                <span className="info-item__title">{n.title}</span>
              </Link>
            ))}
          </div>
          <Link className="info-bar__arrow" href="/" aria-label="お知らせ一覧">
            ›
          </Link>
        </div>
      </section>

      <section className="section" id="rankingSection">
        <div className="section__head">
          <div className="section__title">
            <h2>人気授業ランキング</h2>
            <p>いいね数と注目度で並べた、注目の6授業</p>
          </div>
        </div>
        <div className="ranking-grid">
          {ranking.map((lesson, i) => {
            const rank = i + 1;
            const rankCls =
              rank === 1 ? "rank-row--top1" : rank === 2 ? "rank-row--top2" : rank === 3 ? "rank-row--top3" : "";
            const cat = catById.get(lesson.category_id);
            if (!cat) return null;
            const hasImg = Boolean(lesson.thumbnail_url || lesson.thumbnail_path);
            return (
              <Link
                key={lesson.id}
                href={lessonHref(lesson.category_id, lesson.lesson_no)}
                className={`rank-row ${rankCls}`}
              >
                <div className="rank-row__num">{rank}</div>
                <div
                  className={`rank-row__thumb ${hasImg ? "rank-row__thumb--img" : "rank-row__thumb--designed"}`}
                >
                  <LessonThumb lesson={lesson} category={cat} imageFit="contain" />
                </div>
                <div>
                  <div className="rank-row__title">{lesson.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" id="homeFavSection">
        <div className="section__head">
          <div className="section__title">
            <h2>お気に入りの授業</h2>
            <p>
              {profile
                ? "あなたがブックマークした授業"
                : "★ を押した授業がここに集まります"}
            </p>
          </div>
          {profile && (
            <Link href="/favorites" className="section__more">
              すべて見る →
            </Link>
          )}
        </div>
        {profile ? (
          <HomeFavorites userId={profile.id} />
        ) : (
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
        )}
      </section>

      <HomeCatTree categories={categories} lessons={lessons} />

      <section className="section">
        <div className="section__head">
          <div className="section__title">
            <h2>URIBOHの3つの特徴</h2>
          </div>
        </div>
        <div className="features">
          <div className="feature">
            <div className="feature__num">POINT 01</div>
            <h3 className="feature__title">スキマ時間で学び切る</h3>
            <p className="feature__desc">
              1記事10〜15分の読了型。動画みたいに時間を確保しなくても、移動中や休憩中にサクッと1本、知識を持ち帰れます。
            </p>
          </div>
          <div className="feature">
            <div className="feature__num">POINT 02</div>
            <h3 className="feature__title">体系的なカリキュラム</h3>
            <p className="feature__desc">
              5つのジャンルに整理された授業を、入門から実践まで、自分のペースで学び進められます。
            </p>
          </div>
          <div className="feature">
            <div className="feature__num">POINT 03</div>
            <h3 className="feature__title">明日から使えるスキル</h3>
            <p className="feature__desc">
              理論だけでなく、実務でそのまま使えるテンプレ・手順を凝縮。学んだその日から仕事に活きます。
            </p>
          </div>
        </div>
      </section>

      {carouselSections.map((section) => (
        <section key={section.genreId} className="section home-cat-section">
          <div className="section__head">
            <div className="section__title">
              <h2>{section.title}</h2>
            </div>
            <Link href={`/lessons/${section.genreId}`} className="section__more">
              カテゴリーで探す →
            </Link>
          </div>
          <Carousel>
            {section.lessons.map((lesson) => {
              const cat = catById.get(lesson.category_id);
              if (!cat) return null;
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  category={cat}
                  favorited={favoriteIds.has(lesson.id)}
                  compact
                />
              );
            })}
          </Carousel>
        </section>
      ))}

      <section className="section">
        <div className="section__head">
          <div className="section__title">
            <h2>セミナー / ウェビナー</h2>
            <p>コミュニティメンバー主催のセミナー・ウェビナー・勉強会</p>
          </div>
          <Link href="/seminars" className="section__more">
            すべて見る →
          </Link>
        </div>
        <Carousel className="carousel--seminar">
          {homeSeminars.map((item) => (
            <SeminarCarouselCard key={item.id} item={item} />
          ))}
          <SeminarCarouselCta />
        </Carousel>
      </section>

      <section className="final-section">
        <div className="final-section__inner">
          <h2>学びはじめるなら、今日から。</h2>
          <p>
            気になるカテゴリから、最初の1授業を試してみてください。10〜15分でひとつ、実務に持ち帰れます。
          </p>
          <Link className="btn-primary" href="/courses">
            授業を探す →
          </Link>
        </div>
      </section>
    </>
  );
}
