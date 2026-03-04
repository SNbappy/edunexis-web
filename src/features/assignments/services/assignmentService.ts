import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    AssignmentDto, CreateAssignmentRequest, UpdateAssignmentRequest,
    SubmitAssignmentRequest, GradeSubmissionRequest, SubmissionDto
} from '@/types/assignment.types'

const courseBase = (courseId: string) => `/Assignments/courses/${courseId}/assignments`

export const assignmentService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AssignmentDto[]>>(courseBase(courseId)).then((r) => r.data),

    getById: (courseId: string, assignmentId: string) =>
        api.get<ApiResponse<AssignmentDto>>(courseBase(courseId) + '/' + assignmentId).then((r) => r.data),

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
        if (data.file) form.append('file', data.file)
        if (data.linkUrl) form.append('linkUrl', data.linkUrl)
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

    grade: (submissionId: string, data: GradeSubmissionRequest) =>
        api
            .post<ApiResponse<null>>('/Assignments/submissions/' + submissionId + '/grade', data)
            .then((r) => r.data),
}
