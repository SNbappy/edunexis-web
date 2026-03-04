export type CTStatus = 'Draft' | 'Published'

export interface CTEventDto {
    id: string
    courseId: string
    ctNumber: number
    title: string
    maxMarks: number
    heldOn: string | null
    status: CTStatus
    khataUploaded: boolean
    bestScriptUrl: string | null
    bestStudentId: string | null
    worstScriptUrl: string | null
    worstStudentId: string | null
    averageScriptUrl: string | null
    averageStudentId: string | null
    createdAt: string
}

export interface CTMarksResultDto {
    ctEventId: string
    ctNumber: number
    title: string
    maxMarks: number
    status: CTStatus
    bestScriptUrl: string | null
    worstScriptUrl: string | null
    averageScriptUrl: string | null
    marks: CTMarkDto[]
    classAverage: number | null
    highest: number | null
    lowest: number | null
}

export interface CTMarkDto {
    studentId: string
    studentEmail: string
    obtainedMarks: number | null
    isAbsent: boolean
    remarks: string | null
    markedAt: string | null
}

export interface CreateCTEventRequest {
    title: string
    maxMarks: number
    heldOn?: string | null
}

export interface UpdateCTEventRequest {
    title: string
    maxMarks: number
    heldOn?: string | null
}

export interface CTMarkEntry {
    studentId: string
    obtainedMarks: number | null
    isAbsent: boolean
    remarks?: string
}

export interface GradeCTRequest {
    marks: CTMarkEntry[]
}

