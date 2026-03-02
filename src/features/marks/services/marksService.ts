import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { MarksDto, GradingFormulaRequest } from '@/types/marks.types'

export const marksService = {
    saveFormula: (courseId: string, data: GradingFormulaRequest) =>
        api.post<ApiResponse>(`/courses/${courseId}/grading-formula`, data).then((r) => r.data),

    calculate: (courseId: string) =>
        api.post<ApiResponse>(`/courses/${courseId}/grading-formula/calculate`).then((r) => r.data),

    publish: (courseId: string) =>
        api.post<ApiResponse>(`/courses/${courseId}/grading-formula/publish`).then((r) => r.data),

    getMarks: (courseId: string) =>
        api.get<ApiResponse<MarksDto>>(`/courses/${courseId}/marks`).then((r) => r.data),
}
