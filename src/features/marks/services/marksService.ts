import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { GradebookDto, MyGradeDto } from '@/types/marks.types'

export const marksService = {
    getGradebook: (courseId: string) =>
        api.get<ApiResponse<GradebookDto>>(`/courses/${courseId}/gradebook`).then((r) => r.data),

    getMyGrades: (courseId: string) =>
        api.get<ApiResponse<MyGradeDto>>(`/courses/${courseId}/gradebook/me`).then((r) => r.data),

    exportGradebook: (courseId: string) =>
        api.get(`/courses/${courseId}/gradebook/export`, { responseType: 'blob' }).then((r) => r.data),
}
