import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../services/courseService'
import { useAuthStore } from '@/store/authStore'
import type { CreateCourseRequest } from '@/types/course.types'
import toast from 'react-hot-toast'

export function useCourses() {
    const { user } = useAuthStore()
    const qc = useQueryClient()

    const query = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await courseService.getMyCourses()
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!user,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateCourseRequest) => courseService.createCourse(data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Course created successfully!')
            } else {
                toast.error(res.message)
            }
        },
        onError: () => toast.error('Failed to create course.'),
    })

    const joinMutation = useMutation({
        mutationFn: ({ courseId, joiningCode }: { courseId: string; joiningCode: string }) =>
            courseService.joinCourse(courseId, joiningCode),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Join request sent! Wait for teacher approval.')
            } else {
                toast.error(res.message)
            }
        },
        onError: () => toast.error('Failed to join course.'),
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
        courses: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        createCourse: createMutation.mutate,
        isCreating: createMutation.isPending,
        joinCourse: joinMutation.mutate,
        isJoining: joinMutation.isPending,
        archiveCourse: archiveMutation.mutate,
        deleteCourse: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    }
}
