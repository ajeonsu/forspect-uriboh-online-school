import { LessonCardSkeleton } from "@/components/skeletons/Skeletons";

export default function GenreLessonsLoading() {
  return (
    <div className="courses-grid--skel" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <LessonCardSkeleton key={i} />
      ))}
    </div>
  );
}
