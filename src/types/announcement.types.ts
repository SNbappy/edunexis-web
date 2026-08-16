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

/** A class comment under an announcement. */
export interface CommentDto {
    id: string
    announcementId: string
    authorId: string
    authorName: string
    authorPhotoUrl?: string | null
    content: string
    createdAt: string
    /** Whether the signed-in user may delete it (own comment, or teacher). */
    canDelete: boolean
}
