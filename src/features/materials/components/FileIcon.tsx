import { getFileCategory } from '@/utils/fileUtils'
import { cn } from '@/utils/cn'
import {
    FileText, FileImage, FileVideo, FileAudio,
    FileArchive, FileCode, FileSpreadsheet,
    Presentation, File, Link as LinkIcon, Folder,
} from 'lucide-react'

interface Props {
    fileName?: string
    type?: 'File' | 'Folder' | 'Link'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }
const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }

const categoryConfig = {
    pdf: { icon: FileText, bg: 'bg-rose-500/10', color: 'text-rose-500' },
    doc: { icon: FileText, bg: 'bg-blue-500/10', color: 'text-blue-500' },
    ppt: { icon: Presentation, bg: 'bg-orange-500/10', color: 'text-orange-500' },
    sheet: { icon: FileSpreadsheet, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
    image: { icon: FileImage, bg: 'bg-violet-500/10', color: 'text-violet-500' },
    video: { icon: FileVideo, bg: 'bg-indigo-500/10', color: 'text-indigo-500' },
    audio: { icon: FileAudio, bg: 'bg-cyan-500/10', color: 'text-cyan-500' },
    archive: { icon: FileArchive, bg: 'bg-amber-500/10', color: 'text-amber-500' },
    code: { icon: FileCode, bg: 'bg-teal-500/10', color: 'text-teal-500' },
    text: { icon: FileText, bg: 'bg-slate-500/10', color: 'text-slate-500' },
    unknown: { icon: File, bg: 'bg-muted', color: 'text-muted-foreground' },
}

export default function FileIcon({ fileName, type, size = 'md', className }: Props) {
    if (type === 'Folder') {
        return (
            <div className={cn('flex items-center justify-center rounded-xl bg-amber-500/10', sizes[size], className)}>
                <Folder className={cn('text-amber-500', iconSizes[size])} />
            </div>
        )
    }
    if (type === 'Link') {
        return (
            <div className={cn('flex items-center justify-center rounded-xl bg-primary/10', sizes[size], className)}>
                <LinkIcon className={cn('text-primary', iconSizes[size])} />
            </div>
        )
    }
    const category = getFileCategory(fileName ?? '')
    const config = categoryConfig[category]
    const Icon = config.icon
    return (
        <div className={cn('flex items-center justify-center rounded-xl', config.bg, sizes[size], className)}>
            <Icon className={cn(config.color, iconSizes[size])} />
        </div>
    )
}
