export type PresentationStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled'
export type PresentationFormat = 'Individual' | 'Group'

export interface PresentationDto {
    id: string
    courseId: string
    title: string
    description?: string
    scheduledDate: string
    totalMarks: number
    format: PresentationFormat
    durationPerGroupMinutes?: number
    venue?: string
    status: PresentationStatus
    topicsAllowed?: boolean
    createdAt: string
    myResult?: PresentationResultDto | null
    submittedCount?: number
}

export interface PresentationResultDto {
    id: string
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string
    rollNumber?: string
    topic?: string
    obtainedMarks: number | null
    isAbsent: boolean
    feedback?: string
    gradedAt?: string
}

export interface CreatePresentationRequest {
    courseId: string
    title: string
    description?: string
    scheduledDate: string
    totalMarks: number
    format: PresentationFormat
    durationPerGroupMinutes?: number
    venue?: string
    topicsAllowed?: boolean
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
