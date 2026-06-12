import { MediaLibrary } from "@/components/admin/cms/MediaLibrary";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui/AdminChrome";

export default function AdminMediaPage() {
  return (
    <>
      <AdminPageHeader
        title="Media manager"
        description="Upload images for lessons and seminars. Copy URLs into the block editor or thumbnail fields."
      />
      <AdminCard>
        <MediaLibrary />
      </AdminCard>
    </>
  );
}
