import Image from "next/image";

export function AdminLessonThumb({ url }: { url: string | null }) {
  if (!url) {
    return <span className="admin-table__muted">—</span>;
  }
  const local = url.startsWith("/");
  return (
    <Image
      src={url}
      alt=""
      width={80}
      height={48}
      sizes="80px"
      className="admin-lesson-thumb"
      loading="lazy"
      unoptimized={local}
    />
  );
}
