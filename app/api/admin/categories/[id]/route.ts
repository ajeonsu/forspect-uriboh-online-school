import { jsonError, jsonOk, requireApiEditor } from "@/lib/api";
import {
  friendlyDbMessage,
  prepareCategoryRow,
  validateCategoryParent,
} from "@/lib/cms/category-mutate";
import { editorScope } from "@/lib/cms/editor-scope";
import { getCategoryForEditor } from "@/lib/cms/scoped-db";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";
import { categorySchema, formatZodError } from "@/lib/validation";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return PUT(request, ctx);
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const parsed = categorySchema.partial().safeParse(await request.json());
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 400);

  const supabase = await createPrivilegedServerClient();
  const existing = await getCategoryForEditor(supabase, scope, id);
  if (!existing) return jsonError("Not found", 404);

  try {
    const { id: _ignoredId, ...rest } = parsed.data;
    let row: Record<string, unknown>;
    try {
      row = prepareCategoryRow(rest, { categoryId: id });
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Invalid category", 400);
    }

    if ("parent_id" in row) {
      row.parent_id = await validateCategoryParent(supabase, row.parent_id as string | null, id);
    }

    const { data, error: dbError } = await supabase.from("categories").update(row).eq("id", id).select().single();
    if (dbError) return jsonError(friendlyDbMessage(dbError.message), 500);
    return jsonOk({ category: data });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Update failed", 400);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, profile } = await requireApiEditor();
  if (error) return error;
  const scope = editorScope(profile!);
  const { id } = await ctx.params;
  const supabase = await createPrivilegedServerClient();
  const existing = await getCategoryForEditor(supabase, scope, id);
  if (!existing) return jsonError("Not found", 404);
  const { error: dbError } = await supabase.from("categories").delete().eq("id", id);
  if (dbError) return jsonError(friendlyDbMessage(dbError.message), 500);
  return jsonOk({ ok: true });
}
