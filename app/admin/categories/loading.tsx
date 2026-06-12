import { AdminPageSkeleton, TableSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminCategoriesLoading() {
  return (
    <>
      <AdminPageSkeleton />
      <TableSkeleton rows={8} cols={5} />
    </>
  );
}
