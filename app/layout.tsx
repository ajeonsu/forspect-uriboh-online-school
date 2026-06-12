import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-en-loaded",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "URIBOH | 実務に効く学びを、短時間で。",
  description:
    "AI・SNS・営業・お金＆税金の4分野を、仕事で使える手順と型として学べるオンライン学習プラットフォーム。",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const adminRoute = (await headers()).get("x-uriboh-admin-route") === "1";

  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} notranslate`}
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body suppressHydrationWarning>
        <SiteHeader adminRoute={adminRoute} />
        <main className={adminRoute ? "site-main site-main--admin" : "site-main"}>{children}</main>
        {!adminRoute && <SiteFooter />}
      </body>
    </html>
  );
}
