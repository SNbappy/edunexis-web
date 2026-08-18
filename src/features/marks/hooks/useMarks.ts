import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marksService } from '../services/marksService'
import type { GradingFormulaRequest } from '@/types/marks.types'
import toast from 'react-hot-toast'

export function useMarks(courseId: string) {
    const qc         = useQueryClient()
    const formulaKey = ['grading-formula', courseId]
    const marksKey   = ['final-marks', courseId]

    const formulaQuery = useQuery({
        queryKey: formulaKey,
        queryFn: async () => {
            const res = await marksService.getFormula(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? null
        },
        enabled: !!courseId,
        refetchInterval: 8_000,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const marksQuery = useQuery({
        queryKey: marksKey,
        queryFn: async () => {
            const res = await marksService.getMarks(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!courseId,
        refetchInterval: 8_000,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const calculateMutation = useMutation({
        mutationFn: () => marksService.calculate(courseId),
        onSuccess: (res) => {
            if (res.success) { qc.invalidateQueries({ queryKey: marksKey }); toast.success('Marks calculated!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to calculate marks.'),
    })

    /**
     * Saving a formula recalculates immediately.
     *
     * Previously these were two separate buttons and nothing connected them, so
     * changing a weight and saving left the old totals on screen looking
     * current. A teacher could then export or publish figures produced by a
     * formula that no longer existed. Recalculating is cheap and is what saving
     * a formula means, so it is no longer something you can forget to do.
     */
    const saveFormulaMutation = useMutation({
        mutationFn: async (data: GradingFormulaRequest) => {
            const saved = await marksService.saveFormula(courseId, data)
            if (!saved.success) return saved
            const recalculated = await marksService.calculate(courseId)
            return { ...saved, recalculated: recalculated.success }
        },
        onSuccess: (res: any) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: formulaKey })
                qc.invalidateQueries({ queryKey: marksKey })
                toast.success(
                    res.recalculated
                        ? 'Formula saved and results recalculated.'
                        : 'Formula saved, but the results could not be recalculated.',
                )
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to save formula.'),
    })

    const publishMutation = useMutation({
        mutationFn: () => marksService.publish(courseId),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: formulaKey })
                qc.invalidateQueries({ queryKey: marksKey })
                toast.success('Marks published! Students can now view their results.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to publish marks.'),
    })

    const unpublishMutation = useMutation({
        mutationFn: () => marksService.unpublish(courseId),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: formulaKey })
                qc.invalidateQueries({ queryKey: marksKey })
                toast.success('Marks unpublished. Results hidden from students.')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to unpublish marks.'),
    })

    return {
        formula:          formulaQuery.data ?? null,
        isFormulaLoading: formulaQuery.isLoading,
        marks:            marksQuery.data ?? [],
        isMarksLoading:   marksQuery.isLoading,
        saveFormula:      saveFormulaMutation.mutate,
        isSaving:         saveFormulaMutation.isPending,
        calculate:        calculateMutation.mutate,
        isCalculating:    calculateMutation.isPending,
        publish:          publishMutation.mutate,
        isPublishing:     publishMutation.isPending,
        unpublish:        unpublishMutation.mutate,
        isUnpublishing:   unpublishMutation.isPending,
    }
}

