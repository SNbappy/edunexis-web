export type NotificationType =
    | 'announcement'
    | 'assignment_created'
    | 'assignment_graded'
    | 'ct_scheduled'
    | 'ct_result'
    | 'presentation_scheduled'
    | 'presentation_result'
    | 'join_request'
    | 'join_approved'
    | 'join_rejected'
    | 'attendance_taken'
    | 'material_uploaded'
    | 'general'

export interface NotificationDto {
    id: string
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    createdAt: string
    link?: string
    courseId?: string
    courseName?: string
    actorName?: string
    actorPhoto?: string
}
