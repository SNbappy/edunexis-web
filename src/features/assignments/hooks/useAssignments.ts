import { isTeacher } from '@/utils/roleGuard'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { assignmentService } from '../services/assignmentService'
import type {
    CreateAssignmentRequest, UpdateAssignmentRequest,
    SubmitAssignmentRequest, GradeSubmissionRequest
} from '@/types/assignment.types'
import toast from 'react-hot-toast'

export function useAssignments(courseId: string) {
    const qc = useQueryClient()
    const key = ['assignments', courseId]
    const invalidate = () => qc.invalidateQueries({ queryKey: key })

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await assignmentService.getAll(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!courseId,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateAssignmentRequest) =>
            assignmentService.create(courseId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment created!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create assignment.'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateAssignmentRequest }) =>
            assignmentService.update(courseId, assignmentId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment updated!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to update assignment.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (assignmentId: string) =>
            assignmentService.delete(courseId, assignmentId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment deleted.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to delete.'),
    })

    const submitMutation = useMutation({
        mutationFn: ({ assignmentId, data }: { assignmentId: string; data: SubmitAssignmentRequest }) =>
            assignmentService.submit(assignmentId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Assignment submitted!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Submission failed.'),
    })

    const gradeMutation = useMutation({
        mutationFn: ({ submissionId, data }: { submissionId: string; data: GradeSubmissionRequest }) =>
            assignmentService.grade(submissionId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Marks saved!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Grading failed.'),
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
        submitAssignment: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
        gradeSubmission: gradeMutation.mutate,
        isGrading: gradeMutation.isPending,
    }
}

export function useAssignment(courseId: string, assignmentId: string) {
    const qc = useQueryClient()
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const key = ['assignment', courseId, assignmentId]
    const mySubKey = ['my-submission', assignmentId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await assignmentService.getById(courseId, assignmentId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? null
        },
        enabled: !!courseId && !!assignmentId,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const mySubQuery = useQuery({
        queryKey: mySubKey,
        queryFn: async () => {
            const res = await assignmentService.getMySubmission(assignmentId)
            if (res.success && res.data) return res.data
            return null
        },
        enabled: !!assignmentId && !!user && !teacher,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
        retry: false,
        staleTime: 0,
    })

    const submitMutation = useMutation({
        mutationFn: (data: SubmitAssignmentRequest) =>
            assignmentService.submit(assignmentId, data),
        onSuccess: (res) => {
            if (res.success) {
                if (res.data) qc.setQueryData(mySubKey, res.data)
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['assignments', courseId] })
                toast.success('Assignment submitted!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Submission failed.'),
    })

    return {
        assignment: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        mySubmission: mySubQuery.data ?? null,
        submitAssignment: submitMutation.mutate,
        isSubmitting: submitMutation.isPending,
    }
}

