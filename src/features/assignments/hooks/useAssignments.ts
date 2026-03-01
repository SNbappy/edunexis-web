import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService } from '../services/assignmentService'
import type { CreateAssignmentRequest } from '@/types/assignment.types'
import toast from 'react-hot-toast'

export function useAssignments(courseId: string) {
    const qc = useQueryClient()
    const key = ['assignments', courseId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await assignmentService.getAll(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const invalidate = () => qc.invalidateQueries({ queryKey: key })

    const createMutation = useMutation({
        mutationFn: (data: CreateAssignmentRequest) => assignmentService.create(data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment created!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create assignment.'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ assignmentId, data }: { assignmentId: string; data: Partial<CreateAssignmentRequest> }) =>
            assignmentService.update(courseId, assignmentId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment updated!') }
            else toast.error(res.message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (assignmentId: string) => assignmentService.delete(courseId, assignmentId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment deleted.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to delete.'),
    })

    const publishMutation = useMutation({
        mutationFn: (assignmentId: string) => assignmentService.publish(courseId, assignmentId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment published!') }
            else toast.error(res.message)
        },
    })

    const closeMutation = useMutation({
        mutationFn: (assignmentId: string) => assignmentService.close(courseId, assignmentId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment closed.') }
            else toast.error(res.message)
        },
    })

    return {
        assignments: query.data ?? [],
        isLoading: query.isLoading,
        createAssignment: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateAssignment: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteAssignment: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        publishAssignment: publishMutation.mutate,
        closeAssignment: closeMutation.mutate,
    }
}
