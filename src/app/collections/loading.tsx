import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
export default function Loading() {
  return (
    <div className="wrap py-14">
      <PageHeaderSkeleton />
      <div className="mt-12"><CardGridSkeleton count={6} /></div>
    </div>
  );
}
