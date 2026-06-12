import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-foot-rich">
      <div className="site-foot-rich__inner">
        <div className="site-foot-rich__cols">
          <div className="site-foot-rich__brand">
            <div className="brand">
              <div className="brand__tag">ONLINE LEARNING</div>
              <div className="brand__name">URIBOH</div>
            </div>
            <p className="site-foot-rich__lead">
              実務に効く学びを、短時間で。AI・SNS・営業・お金＆税金の4分野を、仕事で使える手順や型として学べるオンライン学習プラットフォーム。
            </p>
          </div>
          <div className="site-foot-rich__col">
            <h4>カテゴリ</h4>
            <ul>
              <li>
                <Link href="/lessons/ai-chatgpt">AI</Link>
              </li>
              <li>
                <Link href="/lessons/ai-claude">Claude</Link>
              </li>
              <li>
                <Link href="/lessons/sns-instagram">SNS</Link>
              </li>
              <li>
                <Link href="/lessons/sales">営業</Link>
              </li>
              <li>
                <Link href="/lessons/money">お金・税金</Link>
              </li>
            </ul>
          </div>
          <div className="site-foot-rich__col">
            <h4>サポート</h4>
            <ul>
              <li>
                <Link href="/faq">よくある質問</Link>
              </li>
              <li>
                <Link href="/seminars">セミナー / ウェビナー</Link>
              </li>
              <li>
                <Link href="/favorites">お気に入り</Link>
              </li>
              <li>
                <a href="https://forspect.co.jp/#contact-section" target="_blank" rel="noopener noreferrer">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>
          <div className="site-foot-rich__col">
            <h4>サービス</h4>
            <ul>
              <li>
                <Link href="/company">運営会社</Link>
              </li>
              <li>
                <Link href="/tokushoho">利用規約</Link>
              </li>
              <li>
                <Link href="/privacy">プライバシーポリシー</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-foot-rich__copy">© 2026 URIBOH</div>
      </div>
    </footer>
  );
}
