import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
        <Skeleton className="h-3 w-1/4 skeleton-shimmer" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full skeleton-shimmer" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 skeleton-shimmer" />
          <Skeleton className="h-8 w-20 skeleton-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonMessage({ isAi = false }: { isAi?: boolean }) {
  return (
    <div className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0 skeleton-shimmer" />
      <div className={`space-y-2 ${isAi ? '' : 'items-end'}`}>
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
        <Skeleton className={`h-16 skeleton-shimmer ${isAi ? 'w-72' : 'w-48'}`} />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl skeleton-shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12 skeleton-shimmer" />
                  <Skeleton className="h-3 w-16 skeleton-shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
          <Skeleton className="h-12 w-12 rounded-xl skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 skeleton-shimmer" />
            <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
          </div>
          <Skeleton className="h-8 w-20 skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full skeleton-shimmer" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 skeleton-shimmer" />
          <Skeleton className="h-4 w-48 skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2 skeleton-shimmer" />
              <Skeleton className="h-3 w-20 mx-auto skeleton-shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <Card className="glass">
      <CardHeader>
        <Skeleton className="h-5 w-32 skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-around gap-2">
          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
            <Skeleton 
              key={i} 
              className="w-8 skeleton-shimmer rounded-t" 
              style={{ height: `${h}%` }} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
