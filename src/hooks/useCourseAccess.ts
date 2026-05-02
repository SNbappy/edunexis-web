import { useQuery } from "@tanstack/react-query"
import { courseService } from "@/features/courses/services/courseService"
import { useAuthStore } from "@/store/authStore"

export type AccessStatus = "loading" | "granted" | "not-enrolled" | "not-found" | "error"

/**
 * Determines whether the current user may view this course.
 *
 * Important: we only treat *initial* load failures as errors. If a background
 * refetch fails transiently (network blip, Render cold start mid-request),
 * we keep showing the last-known-good data rather than booting the user
 * to an error screen. This matters in demo scenarios — a teacher taking
 * attendance must never get redirected out of the course view just because
 * one background request happened to fail.
 */
export function useCourseAccess(courseId: string) {
  const user = useAuthStore((s) => s.user)

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await courseService.getById(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    enabled: !!courseId && !!user,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  const course = courseQuery.data
  const isTeacherOrAdmin =
    !!user && !!course &&
    (course.teacherId === user.id || user.role === "Admin" || user.role === "SuperAdmin")

  const membersQuery = useQuery({
    queryKey: ["course-members", courseId],
    queryFn: async () => {
      const res = await courseService.getMembers(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    enabled: !!course && !!user && !isTeacherOrAdmin,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  // Still loading the very first time — show loader
  if (!user || (courseQuery.isLoading && !course)) {
    return { status: "loading" as AccessStatus, course: null }
  }

  // INITIAL load failed (not a background refetch). This is the only case
  // where we surface a hard error status.
  if (courseQuery.isLoadingError && !course) {
    const code = (courseQuery.error as any)?.response?.status
    return {
      status: (code === 404 ? "not-found" : "error") as AccessStatus,
      course: null,
    }
  }

  // No course data: only treat as not-found if the fetch genuinely returned
  // null/empty. During a background refetch, `course` can be transiently
  // undefined while data is in flight — fall back to loading in that case
  // so we don't unmount the page mid-poll.
  if (!course) {
    if (courseQuery.isFetching) {
      return { status: "loading" as AccessStatus, course: null }
    }
    if (courseQuery.isSuccess && courseQuery.data === null) {
      return { status: "not-found" as AccessStatus, course: null }
    }
    return { status: "loading" as AccessStatus, course: null }
  }

  if (isTeacherOrAdmin) {
    return { status: "granted" as AccessStatus, course }
  }

  // For students: check membership. Same pattern — only treat initial load as blocking.
  if (membersQuery.isLoading && !membersQuery.data) {
    return { status: "loading" as AccessStatus, course: null }
  }

  const isMember = membersQuery.data?.some((m) => m.userId === user.id) ?? false
  return {
    status: (isMember ? "granted" : "not-enrolled") as AccessStatus,
    course,
  }
}
