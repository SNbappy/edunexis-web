export interface PresentationEventDto {
    id: string
    courseId: string
    title: string
    maxMarks: number
    createdAt: string
}

export interface CreatePresentationRequest {
    title: string
    maxMarks: number
}

export interface GradePresentationRequest {
    studentId: string
    marks: number
    feedback?: string
}
