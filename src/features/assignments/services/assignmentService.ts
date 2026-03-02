import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { AssignmentDto, CreateAssignmentRequest, SubmissionDto, GradeSubmissionRequest } from '@/types/assignment.types'

export const assignmentService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AssignmentDto[]>>(`/Assignments/courses/${courseId}/assignments`).then((r) => r.data),

    create: (courseId: string, data: CreateAssignmentRequest) =>
        api.post<ApiResponse<AssignmentDto>>(`/Assignments/courses/${courseId}/assignments`, data).then((r) => r.data),

    submit: (assignmentId: string, formData: FormData) =>
        api.post<ApiResponse<SubmissionDto>>(`/Assignments/assignments/${assignmentId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data),

    grade: (submissionId: string, data: GradeSubmissionRequest) =>
        api.post<ApiResponse>(`/Assignments/submissions/${submissionId}/grade`, data).then((r) => r.data),
}
