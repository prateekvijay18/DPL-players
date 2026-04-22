import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 space-y-8">
      {/* Hero skeleton */}
      <section className="scoreboard-hero relative overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="relative z-10 flex flex-col gap-5 px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-14">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-48 bg-white/10" />
            <Skeleton className="h-14 sm:h-20 w-80 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/10" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <Skeleton className="h-11 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Podium skeletons */}
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end">
        <div className="podium-card p-6 sm:order-1 sm:pt-6 sm:pb-8">
          <PodiumSkeleton />
        </div>
        <div className="podium-card p-6 sm:order-2 sm:scale-105 sm:-translate-y-4 sm:pt-8 sm:pb-10 z-10">
          <PodiumSkeleton />
        </div>
        <div className="podium-card p-6 sm:order-3 sm:pt-6 sm:pb-8">
          <PodiumSkeleton />
        </div>
      </div>

      {/* Table rows */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="divide-y divide-border/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 sm:px-6"
            >
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-48" />
              <div className="ml-auto flex gap-4">
                <Skeleton className="hidden sm:block h-4 w-6" />
                <Skeleton className="hidden sm:block h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function PodiumSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-14 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
