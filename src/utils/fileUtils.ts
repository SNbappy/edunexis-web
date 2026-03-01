import { MAX_FILE_SIZE_BYTES } from '@/config/constants'

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
export function validateFileSize(file: File): boolean { return file.size <= MAX_FILE_SIZE_BYTES }
export function getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const icons: Record<string, string> = {
        pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊',
        xls: '📈', xlsx: '📈', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
        gif: '🖼️', zip: '🗜️', rar: '🗜️', mp4: '🎬', mp3: '🎵',
    }
    return icons[ext ?? ''] ?? '📎'
}
export function isYouTubeUrl(url: string): boolean {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)
}
export function isGoogleDriveUrl(url: string): boolean {
    return /drive\.google\.com/.test(url)
}
export function getYouTubeEmbedUrl(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
}
export function getYouTubeThumbnail(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : ''
}
export function getGoogleDriveEmbedUrl(url: string): string {
    const match = url.match(/\/file\/d\/([^/]+)/)
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url
}
