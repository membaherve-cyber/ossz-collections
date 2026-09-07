export default function Loading() {
  return (
    <div className="wrap pb-10 pt-4 md:pb-14">
      <div className="h-3 w-40 animate-pulse rounded bg-line/50" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="aspect-[3/4] animate-pulse rounded-sm bg-line/50" />
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 rounded bg-line/50" />
          <div className="h-8 w-2/3 rounded bg-line/60" />
          <div className="h-5 w-28 rounded bg-line/50" />
          <div className="h-20 w-full rounded bg-line/40" />
          <div className="h-11 w-full rounded bg-line/50" />
        </div>
      </div>
    </div>
  );
}
