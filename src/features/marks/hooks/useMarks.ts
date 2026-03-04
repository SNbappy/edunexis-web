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
    })

    const marksQuery = useQuery({
        queryKey: marksKey,
        queryFn: async () => {
            const res = await marksService.getMarks(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        enabled: !!courseId,
    })

    const saveFormulaMutation = useMutation({
        mutationFn: (data: GradingFormulaRequest) => marksService.saveFormula(courseId, data),
        onSuccess: (res) => {
            if (res.success) { qc.invalidateQueries({ queryKey: formulaKey }); toast.success('Formula saved!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to save formula.'),
    })

    const calculateMutation = useMutation({
        mutationFn: () => marksService.calculate(courseId),
        onSuccess: (res) => {
            if (res.success) { qc.invalidateQueries({ queryKey: marksKey }); toast.success('Marks calculated!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to calculate marks.'),
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
    }
}
