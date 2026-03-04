import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { GradingFormulaDto, GradingFormulaRequest, FinalMarkDto } from '@/types/marks.types'

const base = (courseId: string) => `/courses/${courseId}`

export const marksService = {
    getFormula: (courseId: string) =>
        api.get<ApiResponse<GradingFormulaDto | null>>(`${base(courseId)}/grading-formula`).then(r => r.data),

    saveFormula: (courseId: string, data: GradingFormulaRequest) =>
        api.post<ApiResponse>(`${base(courseId)}/grading-formula`, data).then(r => r.data),

    calculate: (courseId: string) =>
        api.post<ApiResponse>(`${base(courseId)}/grading-formula/calculate`).then(r => r.data),

    publish: (courseId: string) =>
        api.post<ApiResponse>(`${base(courseId)}/grading-formula/publish`).then(r => r.data),

    getMarks: (courseId: string) =>
        api.get<ApiResponse<FinalMarkDto[]>>(`${base(courseId)}/marks`).then(r => r.data),
}

