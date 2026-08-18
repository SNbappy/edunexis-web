export type AssignmentMyStatus = 'NotSubmitted' | 'Submitted' | 'Graded'

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
    gradedCount?: number
    myStatus?: AssignmentMyStatus | null
    myMarks?: number | null
    mySubmittedAt?: string | null
    myIsLate?: boolean | null
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
    attachments?: SubmissionAttachmentDto[] | null
    /** False while the student is still assembling a draft only they can see. */
    isTurnedIn: boolean
    turnedInAt?: string | null
    /** A 0 recorded automatically because nothing was turned in before close. */
    isAutoZero?: boolean
    /** Shown instead of initials wherever the student appears. */
    studentPhotoUrl?: string | null
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
    /** Every attached file. A task is often a report plus code plus a demo. */
    files?: File[]
    /** Every attached link. */
    linkUrls?: string[]
    /**
     * Ids of already-submitted attachments to keep when updating a submission.
     * Only honoured alongside `manageAttachments`; the server keeps the previous
     * set untouched otherwise.
     */
    keepAttachmentIds?: string[]
    /**
     * Marks this client as one that shows existing attachments and lets the
     * student remove them, so the server may act on `keepAttachmentIds` —
     * including removing all of them.
     */
    manageAttachments?: boolean
}

export interface TurnInState {
    /** False while the student is still assembling a draft only they can see. */
    isTurnedIn: boolean
    turnedInAt?: string | null
    /** A 0 recorded automatically because nothing was turned in before close. */
    isAutoZero?: boolean
}

export interface SubmissionAttachmentDto {
    id: string
    kind: 'File' | 'Link'
    url: string
    fileName?: string | null
    fileSizeBytes?: number | null
}

export interface GradeSubmissionRequest {
    /**
     * Must be `marks` — the API binds this body onto GradeSubmissionCommand,
     * whose field is `Marks`. It was sent as `obtainedMarks`, which matched
     * nothing, so the decimal defaulted to 0 and passed the `>= 0` validator:
     * every graded assignment was silently stored as zero while the feedback
     * (whose name did match) saved fine, so the grade looked like it worked.
     *
     * Note this differs from the *response* DTOs, which do use `obtainedMarks`.
     */
    marks: number
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
    /**
     * The three measures behind `similarity`. The checker has always computed
     * these but the type never declared them, so they were dropped on the
     * floor. They are worth keeping, because they say *how* two submissions
     * match — a high LCS means long verbatim runs, whereas a high Jaccard with
     * low LCS is the same vocabulary reordered. That distinction matters before
     * putting an accusation to a student.
     */
    breakdown?: {
        /** Cosine similarity over term-frequency vectors. */
        cosine: number
        /** Jaccard overlap of the two word sets. */
        jaccard: number
        /** Longest-common-subsequence ratio — catches verbatim copying. */
        lcs: number
    }
}

export interface PlagiarismReport {
    checkedAt: string
    totalCompared: number
    allPairs: PlagiarismPair[]
    flaggedPairs: PlagiarismPair[]
    cannotCheck: string[]
}

