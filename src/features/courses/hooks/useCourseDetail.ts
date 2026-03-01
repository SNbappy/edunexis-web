import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../services/courseService'
import type { UpdateCourseRequest } from '@/types/course.types'
import toast from 'react-hot-toast'

export function useCourseDetail(courseId: string) {
    const qc = useQueryClient()

    const query = useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const res = await courseService.getCourseById(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const updateMutation = useMutation({
        mutationFn: (data: UpdateCourseRequest) => courseService.updateCourse(courseId, data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['course', courseId] })
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Course updated!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to update course.'),
    })

    return {
        course: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        updateCourse: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    }
}
