import { revalidatePath, revalidateTag } from "next/cache";

/** Call after publish/update/archive of public content. */
export function revalidatePublicContent(opts?: {
  categoryId?: string;
  lessonNo?: string;
}) {
  revalidateTag("categories");
  revalidateTag("lessons");
  revalidateTag("seminars");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/categories");
  revalidatePath("/seminars");
  revalidatePath("/search");
  if (opts?.categoryId) {
    revalidatePath(`/lessons/${opts.categoryId}`);
    if (opts.lessonNo) {
      revalidatePath(`/lessons/${opts.categoryId}/${opts.lessonNo}`);
    }
  }
}
