import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { presentationService } from '../services/presentationService'
import type { CreatePresentationRequest, SavePresentationMarksRequest } from '@/types/presentation.types'
import toast from 'react-hot-toast'

export function usePresentations(courseId: string) {
    const qc = useQueryClient()
    const key = ['presentations', courseId]
    const invalidate = () => qc.invalidateQueries({ queryKey: key })

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await presentationService.getAll(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreatePresentationRequest) => presentationService.create(data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Presentation scheduled!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create presentation.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => presentationService.delete(courseId, id),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Deleted.') }
            else toast.error(res.message)
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            presentationService.updateStatus(courseId, id, status),
        onSuccess: () => invalidate(),
    })

    return {
        presentations: query.data ?? [],
        isLoading: query.isLoading,
        createPresentation: createMutation.mutate,
        isCreating: createMutation.isPending,
        deletePresentation: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        updateStatus: updateStatusMutation.mutate,
    }
}

export function usePresentationResults(courseId: string, presentationId: string) {
    const qc = useQueryClient()
    const key = ['presentation-results', courseId, presentationId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await presentationService.getResults(courseId, presentationId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && !!presentationId,
    })

    const saveMarksMutation = useMutation({
        mutationFn: (data: SavePresentationMarksRequest) =>
            presentationService.saveMarks(courseId, presentationId, data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['presentations', courseId] })
                toast.success('Marks saved!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to save marks.'),
    })

    return {
        results: query.data ?? [],
        isLoading: query.isLoading,
        saveMarks: saveMarksMutation.mutate,
        isSaving: saveMarksMutation.isPending,
    }
}
