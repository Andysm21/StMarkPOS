import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-16">
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-lg text-primary-foreground shadow-sm shadow-primary/30">
          🧺
        </span>
      </span>
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="h-11 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}
