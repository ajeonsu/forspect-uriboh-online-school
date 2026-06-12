"use client";

/** Triggers CSV download without using a raw `<a href>` to an app route (ESLint-safe). */
export function NewsletterExportButton() {
  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => {
        window.location.assign("/api/admin/newsletter/export");
      }}
    >
      Export CSV
    </button>
  );
}
