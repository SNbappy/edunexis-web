import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ctService } from '../services/ctService'
import type { CreateCTEventRequest, SaveCTMarksRequest } from '@/types/ct.types'
import toast from 'react-hot-toast'

export function useCTEvents(courseId: string) {
    const qc = useQueryClient()
    const key = ['ct-events', courseId]
    const invalidate = () => qc.invalidateQueries({ queryKey: key })

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await ctService.getAll(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateCTEventRequest) => ctService.create(data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT event created!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create CT event.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (ctId: string) => ctService.delete(courseId, ctId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT event deleted.') }
            else toast.error(res.message)
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ ctId, status }: { ctId: string; status: string }) =>
            ctService.updateStatus(courseId, ctId, status),
        onSuccess: () => invalidate(),
    })

    return {
        ctEvents: query.data ?? [],
        isLoading: query.isLoading,
        createCTEvent: createMutation.mutate,
        isCreating: createMutation.isPending,
        deleteCTEvent: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        updateStatus: updateStatusMutation.mutate,
    }
}

export function useCTResults(courseId: string, ctId: string) {
    const qc = useQueryClient()
    const key = ['ct-results', courseId, ctId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await ctService.getResults(courseId, ctId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && !!ctId,
    })

    const saveMarksMutation = useMutation({
        mutationFn: (data: SaveCTMarksRequest) => ctService.saveMarks(courseId, ctId, data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['ct-events', courseId] })
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
