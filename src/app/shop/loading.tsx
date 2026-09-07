import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="wrap py-12 md:py-16">
      <PageHeaderSkeleton />
      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <div className="hidden animate-pulse space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-40 rounded bg-line/50" />
          ))}
        </div>
        <div>
          <div className="mb-8 h-8 w-full animate-pulse rounded bg-line/40" />
          <CardGridSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}
