export interface AssignmentDto {
    id: string
    courseId: string
    title: string
    instructions?: string
    deadline: string
    allowLateSubmission: boolean
    maxMarks: number
    rubricNotes?: string
    referenceFileUrl?: string
    isOpen: boolean
    submissionCount: number
    createdAt: string
}

export interface SubmissionDto {
    id: string
    assignmentId: string
    studentId: string
    studentName: string
    submissionType: string
    textContent?: string
    fileUrl?: string
    linkUrl?: string
    submittedAt: string
    isLate: boolean
    marks?: number | null
    feedback?: string | null
    isGraded: boolean
}

export interface CreateAssignmentRequest {
    title: string
    instructions?: string
    deadline: string
    allowLateSubmission: boolean
    maxMarks: number
    rubricNotes?: string
    referenceFile?: File
}

export interface UpdateAssignmentRequest {
    title: string
    instructions?: string
    deadline: string
    allowLateSubmission: boolean
    maxMarks: number
    rubricNotes?: string
}

export interface SubmitAssignmentRequest {
    submissionType: 'Text' | 'File' | 'Link'
    textContent?: string
    file?: File
    linkUrl?: string
}

export interface GradeSubmissionRequest {
    obtainedMarks: number
    feedback?: string
}

export interface PlagiarismPair {
    studentA: string
    studentB: string
    submissionAId: string
    submissionBId: string
    textA: string
    textB: string
    similarity: number
    level: 'low' | 'medium' | 'high'
    commonPhrases: string[]
}

export interface PlagiarismReport {
    checkedAt: string
    totalCompared: number
    allPairs: PlagiarismPair[]
    flaggedPairs: PlagiarismPair[]
    cannotCheck: string[]
}
