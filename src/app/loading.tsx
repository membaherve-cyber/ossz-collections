export default function Loading() {
  return (
    <div>
      <div className="h-[78vh] min-h-[520px] w-full animate-pulse bg-line/40" />
      <div className="wrap py-20">
        <div className="h-8 w-56 animate-pulse rounded bg-line/50" />
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-line/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
