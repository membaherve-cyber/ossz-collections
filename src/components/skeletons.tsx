/**
 * Lightweight loading skeletons.
 *
 * Every public route is dynamically rendered (cookie-based locale, cart and
 * sign-in state), so a navigation waits on a server round-trip. Showing an
 * instant skeleton via `loading.tsx` makes that wait feel immediate — the
 * single biggest perceived-speed win available without re-architecting the
 * locale system.
 */
export function CardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] w-full rounded-sm bg-line/60" />
          <div className="mt-3 h-3 w-2/3 rounded bg-line/60" />
          <div className="mt-2 h-3 w-1/3 rounded bg-line/50" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 rounded bg-line/60" />
      <div className="mt-3 h-9 w-2/3 max-w-md rounded bg-line/60" />
      <div className="mt-3 h-3 w-1/2 max-w-sm rounded bg-line/50" />
    </div>
  );
}
