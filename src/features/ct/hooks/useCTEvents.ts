import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ctService } from '../services/ctService'
import type { CreateCTEventRequest, UpdateCTEventRequest, GradeCTRequest } from '@/types/ct.types'
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
        mutationFn: (data: CreateCTEventRequest) => ctService.create(courseId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT created!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create CT.'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ ctEventId, data }: { ctEventId: string; data: UpdateCTEventRequest }) =>
            ctService.update(ctEventId, data),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT updated!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to update CT.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (ctEventId: string) => ctService.delete(ctEventId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT deleted.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to delete CT.'),
    })

    const publishMutation = useMutation({
        mutationFn: (ctEventId: string) => ctService.publish(ctEventId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT published! Students can now view marks.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to publish CT.'),
    })

    const unpublishMutation = useMutation({
        mutationFn: (ctEventId: string) => ctService.unpublish(ctEventId),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('CT unpublished. Back to draft.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to unpublish CT.'),
    })

    return {
        ctEvents: query.data ?? [],
        isLoading: query.isLoading,
        createCT: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateCT: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteCT: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        publishCT: publishMutation.mutate,
        isPublishing: publishMutation.isPending,
        unpublishCT: unpublishMutation.mutate,
        isUnpublishing: unpublishMutation.isPending,
    }
}

export function useCTMarks(ctEventId: string) {
    const qc = useQueryClient()
    const key = ['ct-marks', ctEventId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await ctService.getMarks(ctEventId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!ctEventId,
    })

    const gradeMutation = useMutation({
        mutationFn: (data: GradeCTRequest) => ctService.grade(ctEventId, data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                toast.success('Marks saved!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to save marks.'),
    })

    const uploadKhataMutation = useMutation({
        mutationFn: (formData: FormData) => ctService.uploadKhata(ctEventId, formData),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['ct-events'], exact: false })
                toast.success('Khata uploaded successfully!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to upload khata.'),
    })

    return {
        marksData: query.data ?? null,
        isLoading: query.isLoading,
        gradeStudents: gradeMutation.mutate,
        isSaving: gradeMutation.isPending,
        uploadKhata: uploadKhataMutation.mutate,
        isUploading: uploadKhataMutation.isPending,
    }
}






