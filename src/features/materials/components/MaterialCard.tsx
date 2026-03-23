import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Download, Trash2, ExternalLink, ChevronRight, Loader2 } from 'lucide-react'
import FileIcon from './FileIcon'
import { formatRelative } from '@/utils/dateUtils'
import { formatFileSize } from '@/utils/fileUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { MaterialDto } from '@/types/material.types'

interface Props {
  material: MaterialDto
  index?: number
  courseId: string
  onDelete?: (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
}

const TYPE_STRIPE: Record<string, string> = {
  Folder:      'linear-gradient(180deg,#fbbf24,#fbbf2460)',
  YouTube:     'linear-gradient(180deg,#ef4444,#ef444460)',
  GoogleDrive: 'linear-gradient(180deg,#34d399,#34d39960)',
  Link:        'linear-gradient(180deg,#818cf8,#818cf860)',
}

export default function MaterialCard({ material, index = 0, courseId, onDelete, onOpenFolder }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [hovered,     setHovered]     = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isFolder = material.type === 'Folder'
  const isLink   = ['Link', 'YouTube', 'GoogleDrive'].includes(material.type)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleDownload = async () => {
    if (!material.fileUrl) return
    setDownloading(true)
    try {
      const res  = await fetch(material.fileUrl)
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = material.fileName ?? material.title
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); window.URL.revokeObjectURL(url)
    } catch { window.open(material.fileUrl, '_blank') }
    finally { setDownloading(false) }
  }

  const handlePrimaryAction = () => {
    if (isFolder) onOpenFolder?.(material.id, material.title)
    else if (isLink) { if (material.embedUrl) window.open(material.embedUrl, '_blank') }
    else handleDownload()
  }

  const stripe = TYPE_STRIPE[material.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      onClick={isFolder ? handlePrimaryAction : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(10,22,40,0.88) 0%, rgba(6,13,31,0.95) 100%)',
        border: hovered ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 20px rgba(0,0,0,0.3)',
        cursor: isFolder ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        // NO overflow:hidden here — that was clipping the dropdown
      }}
    >
      {/* Accent stripe — rendered as absolute, no overflow needed on parent */}
      {stripe && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
          style={{ background: stripe }} />
      )}

      <div className="flex items-center gap-4 px-4 py-3.5 pl-5">
        <FileIcon fileName={material.fileName} type={material.type} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[13.5px] font-bold truncate max-w-sm transition-colors"
              style={{ color: '#e2e8f0', cursor: !isFolder ? 'pointer' : 'default' }}
              onClick={!isFolder ? handlePrimaryAction : undefined}
              onMouseEnter={e => { if (!isFolder) (e.target as HTMLElement).style.color = '#818cf8' }}
              onMouseLeave={e => { if (!isFolder) (e.target as HTMLElement).style.color = '#e2e8f0' }}
            >
              {material.title}
            </span>
            {isFolder && (material.childCount ?? 0) > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                {material.childCount} items
              </span>
            )}
          </div>
          {material.description && (
            <p className="text-[11.5px] mb-1 line-clamp-1" style={{ color: '#475569' }}>{material.description}</p>
          )}
          <div className="flex items-center gap-2 text-[11px] flex-wrap" style={{ color: '#334155' }}>
            <span style={{ color: '#475569' }}>{material.uploadedByName}</span>
            <span style={{ color: '#1e293b' }}>·</span>
            <span>{formatRelative(material.uploadedAt)}</span>
            {material.fileSizeBytes ? (
              <><span style={{ color: '#1e293b' }}>·</span><span>{formatFileSize(material.fileSizeBytes)}</span></>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 shrink-0 transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
          onClick={e => e.stopPropagation()}
        >
          {!isFolder && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              onClick={handlePrimaryAction} disabled={downloading}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
              title={isLink ? 'Open link' : 'Download'}>
              {downloading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : isLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />
              }
            </motion.button>
          )}
          {isFolder && <ChevronRight className="w-4 h-4" style={{ color: '#818cf8' }} />}

          {teacher && onDelete && (
            <div className="relative" ref={menuRef}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(o => !o)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: menuOpen ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8',
                }}>
                <MoreVertical className="w-3.5 h-3.5" />
              </motion.button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  // ↓ fixed: right-0, top-full, z-[100] ensures it renders ABOVE everything
                  className="absolute right-0 top-full mt-2 z-[100] w-44 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(7,14,33,0.98)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(129,140,248,0.05) inset',
                  }}>
                  <div className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.4),transparent)' }} />
                  <div className="p-1">
                    <button
                      onClick={() => { onDelete(material.id); setMenuOpen(false) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
                      style={{ color: '#f87171' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}