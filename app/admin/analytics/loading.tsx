import { AdminPageSkeleton, TableSkeleton } from "@/components/skeletons/Skeletons";

export default function AdminAnalyticsLoading() {
  return (
    <>
      <AdminPageSkeleton />
      <TableSkeleton rows={6} cols={4} />
    </>
  );
}
