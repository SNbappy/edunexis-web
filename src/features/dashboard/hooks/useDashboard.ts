import { useCourses } from "@/features/courses/hooks/useCourses"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"

/**
 * Dashboard aggregates data from the feature hooks instead of fetching
 * its own copy. This keeps the React Query cache shared across pages —
 * clicking Dashboard → Courses is instant since both pages read the
 * same queryKey.
 */
export function useDashboard() {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const {
    enrolled, pending, rejected,
    isLoading: coursesLoading,
    isError:   coursesError,
  } = useCourses()

  const {
    notifications, unreadCount,
    isLoading: notifLoading,
  } = useNotifications()

  // Honest real stats — no fake numbers
  const activeCourses  = enrolled.filter((c: any) => !c.isArchived).length
  const archivedCount  = enrolled.length - activeCourses

  const totalStudents = teacher
    ? enrolled.reduce(
        (sum: number, c: any) => sum + (c.memberCount ?? 0),
        0,
      )
    : 0

  const recentActivity = notifications.slice(0, 6)

  return {
    // full course lists so the dashboard UI can show pending/rejected if it wants
    courses:  enrolled,     // back-compat alias — existing dashboard reads this
    enrolled,
    pending,
    rejected,
    notifications,
    recentActivity,

    stats: {
      totalCourses:  enrolled.length,
      activeCourses,
      archivedCount,
      pendingCount:  pending.length,
      rejectedCount: rejected.length,
      totalStudents,
      unreadCount,
    },

    isLoading: coursesLoading || notifLoading,
    isError:   coursesError,
  }
}
