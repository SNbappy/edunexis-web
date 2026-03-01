export type MaterialType = 'File' | 'YouTube' | 'GoogleDrive'

export interface MaterialDto {
    id: string
    courseId: string
    title: string
    type: MaterialType
    fileUrl: string | null
    embedUrl: string | null
    thumbnailUrl: string | null
    description: string | null
    category: string | null
    isPinned: boolean
    downloadCount: number
    uploadedById: string
    createdAt: string
}
