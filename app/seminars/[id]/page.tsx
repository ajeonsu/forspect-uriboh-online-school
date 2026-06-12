import Link from "next/link";
import { notFound } from "next/navigation";
import { CatNav } from "@/components/CatNav";
import { getSeminarById } from "@/lib/data";

export default async function SeminarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seminar = await getSeminarById(id);
  if (!seminar) notFound();

  return (
    <>
      <CatNav />
      <article className="seminar-detail" style={{ padding: "24px 28px 56px", maxWidth: 880, margin: "0 auto" }}>
        <Link href="/seminars" className="catalog-head__back">
          ← セミナー一覧
        </Link>
        <h1 className="seminar-detail__title">{seminar.title}</h1>
        {seminar.host_name && <p>主催: {seminar.host_name}</p>}
        {seminar.location && <p>場所: {seminar.location}</p>}
        <div className="seminar-detail__desc" style={{ marginTop: 16 }}>
          {seminar.description}
        </div>
        {seminar.apply_url && (
          <p style={{ marginTop: 24 }}>
            <a className="seminar-detail__apply-btn btn btn--primary" href={seminar.apply_url} target="_blank" rel="noopener noreferrer">
              申し込む
            </a>
          </p>
        )}
      </article>
    </>
  );
}
