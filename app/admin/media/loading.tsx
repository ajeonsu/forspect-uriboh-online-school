import { AdminPageSkeleton, MediaGridSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminMediaLoading() {
  return (
    <>
      <AdminPageSkeleton title={false} />
      <MediaGridSkeleton />
    </>
  );
}
