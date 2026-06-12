import { requireApiAdmin } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const { data, error: dbError } = await supabase
    .from("newsletter_subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: true });
  if (dbError) {
    return new Response(dbError.message, { status: 500 });
  }

  const lines = ["email,created_at"];
  for (const row of data ?? []) {
    const email = String(row.email).replace(/"/g, '""');
    lines.push(`"${email}",${row.created_at}`);
  }
  const csv = lines.join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
    },
  });
}
