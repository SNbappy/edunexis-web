export type NotificationType =
    | 'JoinRequestReceived'
    | 'CourseJoinApproved'
    | 'CourseJoinRejected'
    | 'NewMaterial'
    | 'NewAssignment'
    | 'AssignmentDeadlineReminder'
    | 'MarksPublished'
    | 'GradeComplaint'
    | 'NewAnnouncement'
    | 'General'

export interface NotificationDto {
    id: string
    title: string
    body: string
    type: NotificationType
    isRead: boolean
    redirectUrl: string | null
    createdAt: string
}
