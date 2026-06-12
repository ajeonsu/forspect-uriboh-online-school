export function AdminPageSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="skel" aria-busy="true" aria-label="Loading">
      {title ? <div className="skel__bar skel__bar--title" /> : null}
      <div className="skel__bar skel__bar--sub" />
      <div className="skel__grid skel__grid--stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skel__card" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="skel skel-table" aria-busy="true">
      <div className="skel__row skel__row--head">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skel__cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skel__row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skel__cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return <div className="skel__card skel__card--stat" />;
}

export function LessonCardSkeleton() {
  return (
    <div className="skel skel-lesson-card">
      <div className="skel__thumb" />
      <div className="skel__bar" />
      <div className="skel__bar skel__bar--short" />
    </div>
  );
}

export function LessonDetailSkeleton() {
  return (
    <div className="skel skel-lesson-detail" aria-busy="true">
      <div className="skel__bar skel__bar--title" />
      <div className="skel__thumb skel__thumb--hero" />
      <div className="skel__bar" />
      <div className="skel__bar" />
      <div className="skel__bar skel__bar--short" />
    </div>
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="skel skel-media-grid" aria-busy="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skel__media-tile" />
      ))}
    </div>
  );
}
