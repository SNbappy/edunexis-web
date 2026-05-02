import { useParams, Navigate } from "react-router-dom"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { useCourseAccess } from "@/hooks/useCourseAccess"
import BrandLoader from "@/components/ui/BrandLoader"
import Button from "@/components/ui/Button"

export default function EnrollmentGuard({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>()
  const { status } = useCourseAccess(courseId!)

  if (status === "loading") {
    return (
      <BrandLoader variant="page" />

    )
  }

  // Hard redirects - the course genuinely doesn't exist or user isn't a member
  if (status === "not-found")    return <Navigate to="/404" replace />
  if (status === "not-enrolled") return <Navigate to={`/courses/${courseId}/join`} replace />

  // Transient errors are shown in-place, NOT as a redirect. This prevents
  // teachers mid-class from being booted to dashboard by a background
  // refetch failure. User can hit Retry to refetch, or wait - the query
  // will auto-recover on next poll.
  if (status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Couldn't load course
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          The connection hiccuped. Your session is fine \u2014 this usually resolves in a few seconds.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
