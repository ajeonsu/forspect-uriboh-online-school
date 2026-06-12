import { unstable_cache } from "next/cache";
import { createPrivilegedServerClient } from "@/lib/supabase/privileged";

async function fetchGenreOptions() {
  const supabase = await createPrivilegedServerClient();
  const { data } = await supabase.from("categories").select("id, label").order("sort_order");
  return data ?? [];
}

export const getGenreOptions = unstable_cache(fetchGenreOptions, ["admin-genre-options"], {
  revalidate: 120,
});
