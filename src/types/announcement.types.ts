export interface AnnouncementDto {
    id: string
    courseId: string
    authorId: string
    authorName: string
    authorPhotoUrl?: string
    authorRole: string
    title?: string
    content: string
    attachments?: AttachmentDto[]
    isPinned: boolean
    createdAt: string
    updatedAt?: string
}

export interface AttachmentDto {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSizeBytes: number
}

export interface CreateAnnouncementRequest {
    courseId: string
    title?: string
    content: string
    isPinned?: boolean
}
