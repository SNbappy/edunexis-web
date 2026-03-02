import { useQueries } from '@tanstack/react-query'
import { dashboardService, mapNotificationToActivity } from '../services/dashboardService'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

export function useDashboard() {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const role = teacher ? 'Teacher' : 'Student'

    const [coursesQuery, notificationsQuery] = useQueries({
        queries: [
            {
                queryKey: ['courses', 'mine', user?.id],
                queryFn: async () => {
                    const res = await dashboardService.getCourses(role, user!.id)
                    if (!res.success) throw new Error(res.message)
                    return res.data ?? []
                },
                enabled: !!user,
                staleTime: 60_000,
            },
            {
                queryKey: ['notifications'],
                queryFn: async () => {
                    const res = await dashboardService.getNotifications()
                    if (!res.success) throw new Error(res.message)
                    return res.data ?? []
                },
                enabled: !!user,
                staleTime: 30_000,
            },
        ],
    })

    const courses = coursesQuery.data ?? []
    const notifications = notificationsQuery.data ?? []

    const data = {
        stats: {
            totalCourses: courses.length,
            totalStudents: teacher
                ? courses.reduce((sum, c) => sum + (c.memberCount ?? 0), 0)
                : undefined,
            upcomingEvents: 0,
            pendingAssignments: 0,
            averageAttendance: 0,
            pendingJoinRequests: 0,
        },
        courses,
        recentActivity: notifications.map(mapNotificationToActivity),
    }

    return {
        data,
        isLoading: coursesQuery.isLoading || notificationsQuery.isLoading,
        isError: coursesQuery.isError || notificationsQuery.isError,
    }
}
