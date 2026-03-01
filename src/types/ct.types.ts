export type CTStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled'

export interface CTEventDto {
    id: string
    courseId: string
    title: string
    description?: string
    scheduledDate: string
    durationMinutes: number
    totalMarks: number
    syllabus?: string
    venue?: string
    status: CTStatus
    createdAt: string
    myResult?: CTResultDto | null
    submittedCount?: number
}

export interface CTResultDto {
    id: string
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string
    rollNumber?: string
    obtainedMarks: number | null
    isAbsent: boolean
    remarks?: string
    gradedAt?: string
}

export interface CreateCTEventRequest {
    courseId: string
    title: string
    description?: string
    scheduledDate: string
    durationMinutes: number
    totalMarks: number
    syllabus?: string
    venue?: string
}

export interface CTMarkEntry {
    studentId: string
    obtainedMarks: number | null
    isAbsent: boolean
    remarks?: string
}

export interface SaveCTMarksRequest {
    entries: CTMarkEntry[]
}
