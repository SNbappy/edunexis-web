import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/courseService'
import { useAuthStore } from '@/store/authStore'

type AccessStatus = 'loading' | 'granted' | 'not-enrolled' | 'not-found' | 'error'

export function useCourseAccess(courseId: string) {
    const user = useAuthStore((s) => s.user)

    const courseQuery = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const res = await courseService.getById(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && !!user,
        retry: false,
    })

    const course = courseQuery.data
    const isTeacherOrAdmin =
        !!user && !!course &&
        (course.teacherId === user.id || user.role === 'Admin' || user.role === 'SuperAdmin')

    const membersQuery = useQuery({
        queryKey: ['course-members', courseId],
        queryFn: async () => {
            const res = await courseService.getMembers(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!course && !!user && !isTeacherOrAdmin,
        retry: false,
    })

    if (!user || courseQuery.isLoading) return { status: 'loading' as AccessStatus, course: null }

    if (courseQuery.isError) {
        const code = (courseQuery.error as any)?.response?.status
        return { status: (code === 404 ? 'not-found' : 'error') as AccessStatus, course: null }
    }

    if (!course) return { status: 'not-found' as AccessStatus, course: null }

    if (isTeacherOrAdmin) return { status: 'granted' as AccessStatus, course }

    if (membersQuery.isLoading) return { status: 'loading' as AccessStatus, course: null }

    const isMember = membersQuery.data?.some((m) => m.userId === user.id) ?? false
    return { status: (isMember ? 'granted' : 'not-enrolled') as AccessStatus, course }
}
