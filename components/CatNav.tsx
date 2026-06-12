import Link from "next/link";
import { getActiveCategories } from "@/lib/data";

const TOP_NAV = ["ai", "sns", "sales", "money", "news"] as const;

export async function CatNav({ activeId }: { activeId?: string }) {
  const categories = await getActiveCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <nav className="catnav">
      <div className="catnav__inner">
        {TOP_NAV.map((id) => {
          const g = byId.get(id);
          if (!g) return null;
          const subs = categories.filter((c) => c.parent_id === id);
          if (subs.length > 0) {
            return (
              <div key={id} className="catnav__dropdown">
                <Link
                  href={`/lessons/${id}`}
                  className={`catnav__item catnav__item--dropdown ${activeId === id ? "catnav__item--active" : ""}`}
                >
                  {g.label}
                  <span className="catnav__chev">▾</span>
                </Link>
                <div className="catnav__menu">
                  {subs.map((s) => (
                    <Link
                      key={s.id}
                      href={`/lessons/${s.id}`}
                      className={`catnav__menu-item ${activeId === s.id ? "catnav__menu-item--active" : ""}`}
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={id}
              href={`/lessons/${id}`}
              className={`catnav__item ${activeId === id ? "catnav__item--active" : ""}`}
            >
              {g.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
