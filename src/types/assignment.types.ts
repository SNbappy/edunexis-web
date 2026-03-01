export type AssignmentStatus = 'Draft' | 'Published' | 'Closed'
export type SubmissionStatus = 'Submitted' | 'Late' | 'Graded' | 'Returned'

export interface AssignmentDto {
    id: string
    courseId: string
    title: string
    description?: string
    instructions?: string
    dueDate: string
    totalMarks: number
    status: AssignmentStatus
    allowLateSubmission: boolean
    attachmentUrl?: string
    attachmentName?: string
    createdAt: string
    submissionCount?: number
    mySubmission?: SubmissionSummaryDto | null
}

export interface SubmissionSummaryDto {
    id: string
    submittedAt: string
    status: SubmissionStatus
    obtainedMarks?: number | null
    feedback?: string | null
    fileUrl?: string
    fileName?: string
    textContent?: string
}

export interface SubmissionDto extends SubmissionSummaryDto {
    assignmentId: string
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string
    studentId2?: string
}

export interface CreateAssignmentRequest {
    courseId: string
    title: string
    description?: string
    instructions?: string
    dueDate: string
    totalMarks: number
    allowLateSubmission: boolean
    status: AssignmentStatus
}

export interface SubmitAssignmentRequest {
    assignmentId: string
    courseId: string
    textContent?: string
    file?: File
}

export interface GradeSubmissionRequest {
    obtainedMarks: number
    feedback?: string
}
