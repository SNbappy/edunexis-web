export type SubmissionType = 'Text' | 'File' | 'Link'

export interface AssignmentDto {
    id: string
    courseId: string
    title: string
    instructions: string | null
    deadline: string
    allowLateSubmission: boolean
    maxMarks: number
    rubricNotes: string | null
    referenceFileUrl: string | null
    isOpen: boolean
    submissionCount: number
    createdAt: string
}

export interface SubmissionDto {
    id: string
    assignmentId: string
    studentId: string
    studentName: string
    submissionType: SubmissionType
    textContent: string | null
    fileUrl: string | null
    linkUrl: string | null
    submittedAt: string
    isLate: boolean
    marks: number | null
    feedback: string | null
    isGraded: boolean
}
