import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import {
  friendlyDbMessage,
  prepareCategoryRow,
  validateCategoryIdAvailable,
  validateCategoryParent,
} from "@/lib/cms/category-mutate";
import { editorScope } from "@/lib/cms/editor-scope";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { categorySchema, formatZodError } from "@/lib/validation";

export async function GET() {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const supabase = await createPrivilegedServerClient();
  let query = supabase
    .from("categories")
    .select("id, parent_id, label, title, subtitle, sort_order, is_active, emoji, cover_class, created_by")
    .order("sort_order");
  if (!scope.isAdmin) {
    query = query.eq("created_by", scope.userId);
  }
  const { data, error: dbError } = await query;
  if (dbError) return jsonError(dbError.message, 500);
  return jsonOk({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 400);

  const supabase = await createPrivilegedServerClient();
  try {
    let row: Record<string, unknown>;
    try {
      row = prepareCategoryRow(parsed.data);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Invalid category", 400);
    }

    row.created_by = profile!.id;

    await validateCategoryIdAvailable(supabase, String(row.id));
    row.parent_id = await validateCategoryParent(supabase, row.parent_id as string | null, String(row.id));

    const { data, error: dbError } = await supabase.from("categories").insert(row).select().single();
    if (dbError) return jsonError(friendlyDbMessage(dbError.message), 500);
    return jsonOk({ category: data }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Create failed", 400);
  }
}
