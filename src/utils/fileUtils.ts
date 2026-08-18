export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function getFileName(url: string): string {
    try {
        const clean = url.split('?')[0].split('#')[0]
        const raw = clean.split('/').pop() ?? 'File'
        return decodeURIComponent(raw)
    } catch {
        return 'File'
    }
}

export function parseReferenceFileUrls(url: string | null | undefined): string[] {
    if (!url) return []
    try {
        const parsed = JSON.parse(url)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {}
    if (url.includes(';')) return url.split(';').map(s => s.trim()).filter(Boolean)
    return [url]
}

export function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export type FileCategory = 'pdf' | 'doc' | 'ppt' | 'sheet' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'text' | 'unknown'

export function getFileCategory(fileName: string): FileCategory {
    const ext = getFileExtension(fileName)
    const map: Record<string, FileCategory> = {
        pdf: 'pdf',
        doc: 'doc', docx: 'doc',
        ppt: 'ppt', pptx: 'ppt',
        xls: 'sheet', xlsx: 'sheet', csv: 'sheet',
        jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
        mp4: 'video', mkv: 'video', avi: 'video', mov: 'video', webm: 'video',
        mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio',
        zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
        js: 'code', ts: 'code', jsx: 'code', tsx: 'code', py: 'code',
        java: 'code', cpp: 'code', c: 'code', cs: 'code', html: 'code', css: 'code',
        txt: 'text', md: 'text', rtf: 'text',
    }
    return map[ext] ?? 'unknown'
}

export function getMimeTypes(category?: string): string {
    const all: Record<string, string> = {
        pdf: '.pdf',
        doc: '.doc,.docx',
        ppt: '.ppt,.pptx',
        sheet: '.xls,.xlsx,.csv',
        image: '.jpg,.jpeg,.png,.gif,.webp,.svg',
        video: '.mp4,.mkv,.avi,.mov,.webm',
        audio: '.mp3,.wav,.ogg,.m4a',
        archive: '.zip,.rar,.7z,.tar,.gz',
        code: '.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.html,.css',
        text: '.txt,.md,.rtf',
    }
    return category ? (all[category] ?? '*') : Object.values(all).join(',')
}

export const ACCEPTED_MATERIAL_TYPES = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx',
    '.xls', '.xlsx', '.csv',
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.mp4', '.mkv', '.avi', '.mov',
    '.zip', '.rar', '.7z',
    '.txt', '.md',
    '.py', '.java', '.cpp', '.c', '.cs', '.js', '.ts',
].join(',')
