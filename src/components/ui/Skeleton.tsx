import { cn } from "@/utils/cn"

interface SkeletonProps {
  className?: string
  rounded?: "sm" | "md" | "lg" | "full" | "xl" | "2xl"
}

const ROUNDED = {
  sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg",
  xl: "rounded-xl", "2xl": "rounded-2xl", full: "rounded-full",
}

/**
 * Skeleton.
 *
 * A sweeping shimmer rather than a pulse. A pulse fades the whole block in and
 * out, which at a glance is hard to tell from content that is actually there;
 * a sweep is unambiguously "still loading" and is calmer to sit next to.
 */
export default function Skeleton({ className, rounded = "lg" }: SkeletonProps) {
  return <div className={cn("skeleton", ROUNDED[rounded], className)} aria-hidden />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" rounded="full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/** Placeholder for a table or list while rows load. */
export function SkeletonRows({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-8 w-8" rounded="full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}
