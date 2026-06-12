import { AdminPageSkeleton, TableSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminLoading() {
  return (
    <>
      <AdminPageSkeleton />
      <TableSkeleton rows={6} cols={5} />
    </>
  );
}
