export type MaterialType = 'File' | 'Folder' | 'Link' | 'YouTube' | 'GoogleDrive'

export interface MaterialDto {
    id: string
    courseId: string
    parentFolderId?: string | null
    title: string
    description?: string
    type: MaterialType
    fileUrl?: string
    fileName?: string
    fileSizeBytes?: number
    mimeType?: string
    embedUrl?: string
    uploadedById: string
    uploadedByName: string
    uploadedAt: string
    downloadCount: number
    isVisible: boolean
    childCount?: number
}

export interface CreateMaterialRequest {
    courseId: string
    parentFolderId?: string | null
    title: string
    description?: string
    type: MaterialType
    embedUrl?: string
}

export interface UploadMaterialRequest {
    courseId: string
    parentFolderId?: string | null
    title?: string
    description?: string
    file: File
}

export interface BreadcrumbItem {
    id: string | null
    label: string
}
