import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__text">
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function AdminCard({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={`admin-card ${className}`.trim()}>
      {title ? <h2 className="admin-section-title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function AdminTableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`admin-table-wrap${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const norm = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const text = label ?? value;
  return <span className={`status-badge status-badge--${norm}`}>{text}</span>;
}
