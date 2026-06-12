import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getManagementHref } from "@/lib/workspace/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function SiteHeader({ adminRoute = false }: { adminRoute?: boolean }) {
  const [user, manageHref] = await Promise.all([getSessionUser(), getManagementHref()]);

  return (
    <header
      className={`site-header notranslate${adminRoute ? " site-header--admin" : ""}`}
      translate="no"
      suppressHydrationWarning
    >
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="URIBOH home">
          <div className="brand__tag">ONLINE LEARNING</div>
          <div className="brand__name">URIBOH</div>
        </Link>
        <div className="header-search">
          <form action="/search" method="get" role="search">
            <span className="header-search__icon" aria-hidden>
              🔍
            </span>
            <input
              type="search"
              name="q"
              placeholder="授業・キーワードで検索"
              aria-label="授業を検索"
              suppressHydrationWarning
            />
          </form>
        </div>
        <nav className="nav" suppressHydrationWarning>
          <Link href="/courses">授業一覧</Link>
          <Link href="/categories">カテゴリ</Link>
          <Link href="/seminars">セミナー / ウェビナー</Link>
          <Link href="/favorites">お気に入り</Link>
          <Link href="/faq">FAQ</Link>
          {user && manageHref ? <Link href={manageHref}>管理</Link> : null}
          {user ? (
            <span className="nav-logout-form">
              <LogoutButton />
            </span>
          ) : (
            <Link href="/login">ログイン</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
