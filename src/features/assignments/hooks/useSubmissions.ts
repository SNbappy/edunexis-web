import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService } from '../services/assignmentService'
import type { SubmitAssignmentRequest, GradeSubmissionRequest } from '@/types/assignment.types'
import toast from 'react-hot-toast'

export function useSubmissions(courseId: string, assignmentId: string) {
    const qc = useQueryClient()
    const key = ['submissions', courseId, assignmentId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await assignmentService.getSubmissions(courseId, assignmentId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && !!assignmentId,
    })

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: key })
        qc.invalidateQueries({ queryKey: ['assignments', courseId] })
    }

    const submitMutation = useMutation({
        mutationFn: (data: SubmitAssignmentRequest) => assignmentService.submit(data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment submitted!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Submission failed.'),
    })

    const gradeMutation = useMutation({
        mutationFn: ({ submissionId, data }: { submissionId: string; data: GradeSubmissionRequest }) =>
            assignmentService.grade(courseId, assignmentId, submissionId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Graded successfully!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Grading failed.'),
    })

    return {
        submissions: query.data ?? [],
        isLoading: query.isLoading,
        submitAssignment: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
        gradeSubmission: gradeMutation.mutate,
        isGrading: gradeMutation.isPending,
    }
}
