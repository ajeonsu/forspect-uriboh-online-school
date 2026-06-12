import { AdminPageSkeleton, TableSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminSeminarsLoading() {
  return (
    <>
      <AdminPageSkeleton />
      <TableSkeleton rows={8} cols={4} />
    </>
  );
}
