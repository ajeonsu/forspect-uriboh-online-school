import { LessonCardSkeleton } from "@/components/skeletons/Skeletons";

export default function RootLoading() {
  return (
    <div className="courses-grid--skel" aria-busy="true" aria-label="読み込み中">
      {Array.from({ length: 6 }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </div>
  );
}
