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
      if (!res.success) {
        /* The API answers these with HTTP 200 and `success: false`, so the
           thrown error carries no status code and everything landed in the
           transient-error branch below — a deleted course showed "the
           connection hiccuped", inviting the user to retry something that
           will never succeed. `definitive` marks a refusal the server made
           on purpose, as opposed to a network failure worth retrying. */
        throw Object.assign(new Error(res.message ?? "Course unavailable"), {
          definitive: true,
          serverMessage: res.message ?? "",
        })
      }
      return res.data
    },
    enabled: !!courseId && !!user,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  const course = courseQuery.data
  const isOwnerOrAdmin =
    !!user && !!course &&
    (course.teacherId === user.id || user.role === "SuperAdmin")

  /* A course can be taught by more than one person, and a co-teacher is not on
     the student roster — so without this they failed both the owner check and
     the membership check and were bounced to "request to join" on a course they
     had just accepted an invitation to. Only queried when the cheaper owner
     check has already failed. */
  const teachersQuery = useQuery({
    queryKey: ["course-teachers", courseId],
    queryFn: async () => {
      const res = await courseService.getTeachers(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!course && !!user && !isOwnerOrAdmin,
    retry: false,
    staleTime: 30_000,
  })

  const isCoTeacher =
    !!user && (teachersQuery.data ?? []).some(t => t.userId === user.id)

  /* "Admin" is not a role this app has — the only admin role is SuperAdmin.
     Comparing against "Admin" could never be true, which dropped admins into
     the student membership check below and showed them "not enrolled" on
     courses they are entitled to administer. */
  const isTeacherOrAdmin = isOwnerOrAdmin || isCoTeacher

  const membersQuery = useQuery({
    queryKey: ["course-members", courseId],
    queryFn: async () => {
      const res = await courseService.getMembers(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    // Wait for the co-teacher answer before falling back to the roster check,
    // or the redirect fires on the first render and the user never sees the
    // course they do have access to.
    enabled: !!course && !!user && !isOwnerOrAdmin && teachersQuery.isFetched && !isCoTeacher,
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
    const err  = courseQuery.error as any
    const code = err?.response?.status

    if (code === 404) return { status: "not-found" as AccessStatus, course: null }

    /* A refusal the server made deliberately. Two shapes matter to the user:
       the course is gone, or they are simply not in it — and the second has a
       real next step (the join page) rather than an error screen. */
    if (err?.definitive) {
      const msg = String(err.serverMessage ?? "")
      const gone = /no longer exists|not found/i.test(msg)
      return {
        status: (gone ? "not-found" : "not-enrolled") as AccessStatus,
        course: null,
      }
    }

    return { status: "error" as AccessStatus, course: null }
  }

  // No course data: only treat as not-found if the fetch genuinely returned
  // null/empty. During a background refetch, `course` can be transiently
  // undefined while data is in flight — fall back to loading in that case
  // so we don't unmount the page mid-poll.
  if (!course) {
    if (courseQuery.isFetching) {
      return { status: "loading" as AccessStatus, course: null }
    }
    // `course` is already known falsy in this branch, so a settled successful
    // query here means the API genuinely returned nothing.
    if (courseQuery.isSuccess) {
      return { status: "not-found" as AccessStatus, course: null }
    }
    return { status: "loading" as AccessStatus, course: null }
  }

  if (isTeacherOrAdmin) {
    return { status: "granted" as AccessStatus, course }
  }

  /* The co-teacher lookup has to settle before the roster check can decide
     anything: treating "not answered yet" as "not a co-teacher" is what sent an
     invited colleague to the join page on first load. */
  if (!isOwnerOrAdmin && teachersQuery.isLoading && !teachersQuery.data) {
    return { status: "loading" as AccessStatus, course: null }
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
