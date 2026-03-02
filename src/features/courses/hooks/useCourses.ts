import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../services/courseService'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CreateCourseRequest } from '@/types/course.types'
import toast from 'react-hot-toast'

export function useCourses() {
    const { user } = useAuthStore()
    const qc = useQueryClient()
    const teacher = isTeacher(user?.role ?? 'Student')
    const role = teacher ? 'Teacher' : 'Student'

    const myCoursesQuery = useQuery({
        queryKey: ['courses', 'mine', user?.id],
        queryFn: async () => {
            const res = await courseService.getMyCourses(role, user!.id)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!user,
        staleTime: 60_000,
    })

    const allCoursesQuery = useQuery({
        queryKey: ['courses', 'all'],
        queryFn: async () => {
            const res = await courseService.getAll()
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!user,
        staleTime: 60_000,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateCourseRequest) => courseService.createCourse(data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Course created successfully!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create course.'),
    })

    const joinMutation = useMutation({
        mutationFn: ({ courseId, code }: { courseId: string; code: string }) =>
            courseService.requestJoin(courseId, code),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Join request sent! Waiting for teacher approval.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to send join request.'),
    })

    const archiveMutation = useMutation({
        mutationFn: (id: string) => courseService.archiveCourse(id),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Course archived.')
            } else toast.error(res.message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => courseService.deleteCourse(id),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Course deleted.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to delete course.'),
    })

    return {
        courses: myCoursesQuery.data ?? [],
        allCourses: allCoursesQuery.data ?? [],
        isLoading: myCoursesQuery.isLoading,
        isLoadingAll: allCoursesQuery.isLoading,
        isError: myCoursesQuery.isError,
        createCourse: createMutation.mutate,
        isCreating: createMutation.isPending,
        requestJoin: joinMutation.mutate,
        isJoining: joinMutation.isPending,
        archiveCourse: archiveMutation.mutate,
        deleteCourse: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    }
}
