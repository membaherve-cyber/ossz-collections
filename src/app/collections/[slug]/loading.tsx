import { CardGridSkeleton } from "@/components/skeletons";
export default function Loading() {
  return (
    <div>
      <div className="h-[52vh] min-h-[360px] w-full animate-pulse bg-line/40" />
      <div className="wrap py-14"><CardGridSkeleton count={8} /></div>
    </div>
  );
}
