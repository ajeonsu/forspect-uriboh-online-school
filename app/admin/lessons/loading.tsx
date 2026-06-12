import { AdminPageSkeleton, TableSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminLessonsLoading() {
  return (
    <>
      <AdminPageSkeleton />
      <TableSkeleton rows={10} cols={8} />
    </>
  );
}
