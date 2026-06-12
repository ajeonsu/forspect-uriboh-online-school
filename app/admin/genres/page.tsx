import { redirect } from "next/navigation";

export default function AdminGenresRedirect() {
  redirect("/admin/categories");
}
