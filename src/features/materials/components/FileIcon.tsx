import { getFileCategory } from '@/utils/fileUtils'
import {
  FileText, FileImage, FileVideo, FileAudio,
  FileArchive, FileCode, FileSpreadsheet,
  Presentation, File, Link as LinkIcon, Folder,
  Youtube, HardDrive,
} from 'lucide-react'

interface Props {
  fileName?: string
  type?: 'File' | 'Folder' | 'Link' | 'YouTube' | 'GoogleDrive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes    = { sm: 32,  md: 40,  lg: 56  }
const iconSizes = { sm: 14, md: 18, lg: 26 }

const CATEGORY_CFG = {
  pdf:     { icon: FileText,        color: '#f87171', glow: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.2)'  },
  doc:     { icon: FileText,        color: '#60a5fa', glow: 'rgba(96,165,250,0.25)',  bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.2)'   },
  ppt:     { icon: Presentation,    color: '#fb923c', glow: 'rgba(251,146,60,0.25)',  bg: 'rgba(251,146,60,0.1)',   border: 'rgba(251,146,60,0.2)'   },
  sheet:   { icon: FileSpreadsheet, color: '#34d399', glow: 'rgba(52,211,153,0.25)',  bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.2)'   },
  image:   { icon: FileImage,       color: '#c084fc', glow: 'rgba(192,132,252,0.25)', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.2)'  },
  video:   { icon: FileVideo,       color: '#818cf8', glow: 'rgba(129,140,248,0.25)', bg: 'rgba(129,140,248,0.1)',  border: 'rgba(129,140,248,0.2)'  },
  audio:   { icon: FileAudio,       color: '#38bdf8', glow: 'rgba(56,189,248,0.25)',  bg: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.2)'   },
  archive: { icon: FileArchive,     color: '#fbbf24', glow: 'rgba(251,191,36,0.25)',  bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.2)'   },
  code:    { icon: FileCode,        color: '#2dd4bf', glow: 'rgba(45,212,191,0.25)',  bg: 'rgba(45,212,191,0.1)',   border: 'rgba(45,212,191,0.2)'   },
  text:    { icon: FileText,        color: '#94a3b8', glow: 'rgba(148,163,184,0.2)',  bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
  unknown: { icon: File,            color: '#64748b', glow: 'rgba(100,116,139,0.15)', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.12)' },
}

export default function FileIcon({ fileName, type, size = 'md', className }: Props) {
  const px = sizes[size]
  const ic = iconSizes[size]
  const radius = size === 'lg' ? 14 : 10

  if (type === 'Folder') {
    return (
      <div className={className} style={{
        width: px, height: px, borderRadius: radius, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
        boxShadow: '0 2px 12px rgba(251,191,36,0.2)',
      }}>
        <Folder style={{ width: ic, height: ic, color: '#fbbf24' }} />
      </div>
    )
  }
  if (type === 'YouTube') {
    return (
      <div className={className} style={{
        width: px, height: px, borderRadius: radius, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
        boxShadow: '0 2px 12px rgba(239,68,68,0.2)',
      }}>
        <Youtube style={{ width: ic, height: ic, color: '#ef4444' }} />
      </div>
    )
  }
  if (type === 'GoogleDrive') {
    return (
      <div className={className} style={{
        width: px, height: px, borderRadius: radius, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
        boxShadow: '0 2px 12px rgba(52,211,153,0.2)',
      }}>
        <HardDrive style={{ width: ic, height: ic, color: '#34d399' }} />
      </div>
    )
  }
  if (type === 'Link') {
    return (
      <div className={className} style={{
        width: px, height: px, borderRadius: radius, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
        boxShadow: '0 2px 12px rgba(129,140,248,0.2)',
      }}>
        <LinkIcon style={{ width: ic, height: ic, color: '#818cf8' }} />
      </div>
    )
  }

  const cat = getFileCategory(fileName ?? '') as keyof typeof CATEGORY_CFG
  const cfg = CATEGORY_CFG[cat] ?? CATEGORY_CFG.unknown
  const Icon = cfg.icon

  return (
    <div className={className} style={{
      width: px, height: px, borderRadius: radius, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      boxShadow: `0 2px 12px ${cfg.glow}`,
    }}>
      <Icon style={{ width: ic, height: ic, color: cfg.color }} />
    </div>
  )
}