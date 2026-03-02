export interface AnnouncementDto {
    id: string
    courseId: string
    authorId: string
    authorName: string
    content: string
    attachmentUrl?: string
    isPinned: boolean
    createdAt: string
}

export interface CreateAnnouncementRequest {
    courseId: string
    content: string
    attachment?: File | null
}
