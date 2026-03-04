export type PresentationStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled'
export type PresentationFormat = 'Individual' | 'Group'

export interface PresentationDto {
    id: string
    courseId: string
    title: string
    description?: string
    scheduledDate?: string | null
    totalMarks: number
    format: PresentationFormat
    durationPerGroupMinutes?: number | null
    venue?: string | null
    status: PresentationStatus
    topicsAllowed: boolean
    createdAt: string
    myResult?: PresentationResultDto | null
    submittedCount?: number
}

export interface PresentationResultDto {
    id: string
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string | null
    rollNumber?: string | null
    topic?: string | null
    obtainedMarks: number | null
    isAbsent: boolean
    feedback?: string | null
    gradedAt?: string | null
}

export interface CreatePresentationRequest {
    courseId: string
    title: string
    description?: string
    scheduledDate?: string | null
    totalMarks: number
    format: PresentationFormat
    durationPerGroupMinutes?: number | null
    venue?: string | null
    topicsAllowed: boolean
}

export interface PresentationMarkEntry {
    studentId: string
    obtainedMarks: number | null
    isAbsent: boolean
    topic?: string
    feedback?: string
}

export interface SavePresentationMarksRequest {
    entries: PresentationMarkEntry[]
}

export interface GradePresentationRequest {
    studentId: string
    marks: number
    feedback?: string
}

export interface UpdatePresentationStatusRequest {
    status: PresentationStatus
}
