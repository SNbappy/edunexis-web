export interface CTEventDto {
    id: string
    courseId: string
    title: string
    maxMarks: number
    createdAt: string
}

export interface CreateCTEventRequest {
    title: string
    maxMarks: number
}

export interface GradeCTRequest {
    studentId: string
    marks: number
}
