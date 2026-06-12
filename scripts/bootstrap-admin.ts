/**
 * Promote BOOTSTRAP_ADMIN_EMAIL to admin (service role; server-only).
 * User must exist in auth.users (sign up once) before running.
 */
import { createAdminClient } from "../lib/supabase/admin";

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error("Set BOOTSTRAP_ADMIN_EMAIL in .env.local");
    process.exit(1);
  }

  const admin = createAdminClient();

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, email, role")
    .ilike("email", email)
    .maybeSingle();

  if (profileErr) {
    console.error(profileErr.message);
    process.exit(1);
  }

  let userId = profile?.id;

  if (!userId) {
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.error(listErr.message);
      process.exit(1);
    }
    const authUser = list.users.find((u) => u.email?.toLowerCase() === email);
    if (!authUser) {
      console.error(
        `No user found for ${email}. Sign up at /signup first, then run: npm run db:bootstrap-admin`,
      );
      process.exit(1);
    }
    userId = authUser.id;
    const { error: insertErr } = await admin.from("profiles").upsert({
      id: userId,
      email: authUser.email,
      display_name: authUser.user_metadata?.display_name ?? email.split("@")[0],
      role: "admin",
    });
    if (insertErr) {
      console.error(insertErr.message);
      process.exit(1);
    }
    console.log(`Created profile and set admin for ${email}`);
    process.exit(0);
  }

  if (!profile) {
    console.error("Profile missing after lookup");
    process.exit(1);
  }

  if (profile.role === "admin") {
    console.log(`Already admin: ${email}`);
    process.exit(0);
  }

  const { error: updateErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
  if (updateErr) {
    console.error(updateErr.message);
    process.exit(1);
  }

  console.log(`Promoted to admin: ${email}`);
}

main();
