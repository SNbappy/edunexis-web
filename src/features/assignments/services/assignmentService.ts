import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    AssignmentDto, SubmissionDto,
    CreateAssignmentRequest, SubmitAssignmentRequest,
    GradeSubmissionRequest,
} from '@/types/assignment.types'

export const assignmentService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AssignmentDto[]>>(`/courses/${courseId}/assignments`).then((r) => r.data),

    getById: (courseId: string, assignmentId: string) =>
        api.get<ApiResponse<AssignmentDto>>(`/courses/${courseId}/assignments/${assignmentId}`).then((r) => r.data),

    create: (data: CreateAssignmentRequest) =>
        api.post<ApiResponse<AssignmentDto>>(`/courses/${data.courseId}/assignments`, data).then((r) => r.data),

    update: (courseId: string, assignmentId: string, data: Partial<CreateAssignmentRequest>) =>
        api.put<ApiResponse<AssignmentDto>>(`/courses/${courseId}/assignments/${assignmentId}`, data).then((r) => r.data),

    delete: (courseId: string, assignmentId: string) =>
        api.delete<ApiResponse>(`/courses/${courseId}/assignments/${assignmentId}`).then((r) => r.data),

    publish: (courseId: string, assignmentId: string) =>
        api.patch<ApiResponse>(`/courses/${courseId}/assignments/${assignmentId}/publish`).then((r) => r.data),

    close: (courseId: string, assignmentId: string) =>
        api.patch<ApiResponse>(`/courses/${courseId}/assignments/${assignmentId}/close`).then((r) => r.data),

    getSubmissions: (courseId: string, assignmentId: string) =>
        api.get<ApiResponse<SubmissionDto[]>>(`/courses/${courseId}/assignments/${assignmentId}/submissions`).then((r) => r.data),

    submit: (data: SubmitAssignmentRequest) => {
        const form = new FormData()
        if (data.textContent) form.append('textContent', data.textContent)
        if (data.file) form.append('file', data.file)
        return api
            .post<ApiResponse<SubmissionDto>>(
                `/courses/${data.courseId}/assignments/${data.assignmentId}/submit`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((r) => r.data)
    },

    grade: (courseId: string, assignmentId: string, submissionId: string, data: GradeSubmissionRequest) =>
        api
            .post<ApiResponse<SubmissionDto>>(
                `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
                data
            )
            .then((r) => r.data),
}
