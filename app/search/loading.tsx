import { LessonCardSkeleton } from "@/components/skeletons/Skeletons";

export default function SearchLoading() {
  return (
    <div className="courses-grid--skel" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </div>
  );
}
