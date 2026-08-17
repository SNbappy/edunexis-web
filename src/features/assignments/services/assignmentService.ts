import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { CommentDto } from '@/types/announcement.types'
import type {
    AssignmentDto, CreateAssignmentRequest, UpdateAssignmentRequest,
    SubmitAssignmentRequest, GradeSubmissionRequest, SubmissionDto
} from '@/types/assignment.types'

const courseBase = (courseId: string) => `/Assignments/courses/${courseId}/assignments`

export const assignmentService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AssignmentDto[]>>(courseBase(courseId)).then((r) => r.data),

    getById: async (courseId: string, assignmentId: string) => {
        const res = await api.get<ApiResponse<AssignmentDto[]>>(courseBase(courseId)).then((r) => r.data)
        if (!res.success || !res.data) return { ...res, data: null }
        const found = res.data.find((a) => a.id === assignmentId) ?? null
        return { ...res, data: found }
    },

    create: (courseId: string, data: CreateAssignmentRequest) => {
        const form = new FormData()
        form.append('title', data.title)
        form.append('deadline', data.deadline)
        form.append('allowLateSubmission', String(data.allowLateSubmission))
        form.append('maxMarks', String(data.maxMarks))
        if (data.instructions) form.append('instructions', data.instructions)
        if (data.rubricNotes) form.append('rubricNotes', data.rubricNotes)
        if (data.referenceFile) form.append('referenceFile', data.referenceFile)
        return api
            .post<ApiResponse<AssignmentDto>>(courseBase(courseId), form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data)
    },

    update: (courseId: string, assignmentId: string, data: UpdateAssignmentRequest) => {
        const form = new FormData()
        form.append('title', data.title)
        form.append('deadline', data.deadline)
        form.append('allowLateSubmission', String(data.allowLateSubmission))
        form.append('maxMarks', String(data.maxMarks))
        if (data.instructions) form.append('instructions', data.instructions)
        if (data.rubricNotes) form.append('rubricNotes', data.rubricNotes)
        return api
            .put<ApiResponse<AssignmentDto>>(
                courseBase(courseId) + '/' + assignmentId, form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((r) => r.data)
    },

    delete: (courseId: string, assignmentId: string) =>
        api
            .delete<ApiResponse<null>>(courseBase(courseId) + '/' + assignmentId)
            .then((r) => r.data),

    submit: (assignmentId: string, data: SubmitAssignmentRequest) => {
        const form = new FormData()
        form.append('submissionType', data.submissionType)
        if (data.textContent) form.append('textContent', data.textContent)
        // Repeated fields — the API binds these as collections.
        for (const f of data.files ?? []) form.append('files', f)
        for (const l of data.linkUrls ?? []) form.append('linkUrls', l)
        return api
            .post<ApiResponse<SubmissionDto>>(
                '/Assignments/assignments/' + assignmentId + '/submit', form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((r) => r.data)
    },

    getSubmissions: (assignmentId: string) =>
        api
            .get<ApiResponse<SubmissionDto[]>>('/Assignments/assignments/' + assignmentId + '/submissions')
            .then((r) => r.data),

    getMySubmission: async (assignmentId: string) => {
        try {
            const r = await api.get<ApiResponse<SubmissionDto>>('/Assignments/assignments/' + assignmentId + '/my-submission')
            return r.data
        } catch {
            return { success: false, message: '', data: null }
        }
    },

    grade: (submissionId: string, data: GradeSubmissionRequest) =>
        api
            .post<ApiResponse<null>>('/Assignments/submissions/' + submissionId + '/grade', data)
            .then((r) => r.data),

    /* Class comments on an assignment. Same shape as announcement comments so
       the UI can share one component. */
    getComments: (courseId: string, assignmentId: string) =>
        api.get<ApiResponse<CommentDto[]>>(
            `/Assignments/courses/${courseId}/assignments/${assignmentId}/comments`
        ).then(r => r.data),

    addComment: (courseId: string, assignmentId: string, content: string) =>
        api.post<ApiResponse<CommentDto>>(
            `/Assignments/courses/${courseId}/assignments/${assignmentId}/comments`,
            { content }
        ).then(r => r.data),

    editComment: (courseId: string, commentId: string, content: string) =>
        api.put<ApiResponse<CommentDto>>(
            `/Assignments/courses/${courseId}/comments/${commentId}`, { content }
        ).then(r => r.data),

    deleteComment: (courseId: string, commentId: string) =>
        api.delete<ApiResponse>(
            `/Assignments/courses/${courseId}/comments/${commentId}`
        ).then(r => r.data),
}
