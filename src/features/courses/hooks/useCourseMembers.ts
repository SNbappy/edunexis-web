import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { courseService } from '../services/courseService'
import toast from 'react-hot-toast'

export function useCourseMembers(courseId: string) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const qc = useQueryClient()

    const membersQuery = useQuery({
        queryKey: ['course-members', courseId],
        queryFn: async () => {
            const res = await courseService.getMembers(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!courseId,
    })

    const joinRequestsQuery = useQuery({
        queryKey: ['join-requests', courseId],
        queryFn: async () => {
            const res = await courseService.getJoinRequests(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!courseId && teacher,
    })

    const reviewMutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: 'Approved' | 'Rejected' }) =>
            courseService.reviewJoinRequest(courseId, requestId, status === 'Approved'),
        onSuccess: (res, { status }) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['join-requests', courseId] })
                qc.invalidateQueries({ queryKey: ['course-members', courseId] })
                toast.success(status === 'Approved' ? 'Student approved!' : 'Request rejected.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to review request.'),
    })

    const removeMemberMutation = useMutation({
        mutationFn: (studentId: string) => courseService.removeMember(courseId, studentId),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['course-members', courseId] })
                toast.success('Student removed from course.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to remove student.'),
    })

    return {
        members: membersQuery.data ?? [],
        joinRequests: joinRequestsQuery.data ?? [],
        isMembersLoading: membersQuery.isLoading,
        isRequestsLoading: joinRequestsQuery.isLoading,
        reviewRequest: reviewMutation.mutate,
        isReviewing: reviewMutation.isPending,
        removeMember: removeMemberMutation.mutate,
        isRemoving: removeMemberMutation.isPending,
    }
}

