import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, ChevronDown, ChevronUp, MoreVertical, Pin, PinOff, Trash2, Paperclip } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import type { AnnouncementDto } from '@/types/announcement.types'

interface Props {
  announcement: AnnouncementDto
  index?: number
  canPin?: boolean
  canDelete?: boolean
  onPin?: (id: string) => void
  onDelete?: (id: string) => void
}

function getFileNameFromUrl(url: string) {
  try { return decodeURIComponent(url.split('/').pop() ?? 'Attachment') }
  catch { return 'Attachment' }
}

export default function AnnouncementCard({ announcement, index = 0, canPin = false, canDelete = false, onPin, onDelete }: Props) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isLong = announcement.content.length > 280
  const showMenu = canPin || canDelete

  const photoUrl = announcement.authorId === user?.id
    ? (user?.profile?.profilePhotoUrl ?? undefined)
    : undefined

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const isPinned = announcement.isPinned

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: isPinned
          ? 'linear-gradient(135deg,rgba(79,70,229,0.14) 0%,rgba(10,22,40,0.85) 100%)'
          : 'linear-gradient(135deg,rgba(10,22,40,0.85) 0%,rgba(6,13,31,0.9) 100%)',
        border: isPinned ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: isPinned
          ? '0 4px 28px rgba(79,70,229,0.18), 0 1px 0 rgba(129,140,248,0.1) inset'
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}>

      {/* Pinned glow line */}
      {isPinned && (
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.6),rgba(6,182,212,0.4),transparent)' }} />
      )}

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(99,102,241,0.04) 50%,transparent 70%)' }} />

      <div className="relative p-5 space-y-4">
        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(99,102,241,0.3)', width: 36, height: 36 }}>
              <Avatar src={photoUrl} name={announcement.authorName} size="sm" className="w-full h-full rounded-none" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{announcement.authorName}</p>
            <p className="text-xs" style={{ color: '#475569' }}>{formatRelative(announcement.createdAt)}</p>
          </div>

          {isPinned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Pin className="w-2.5 h-2.5" style={{ color: '#818cf8' }} />
              <span className="text-[10px] font-bold" style={{ color: '#818cf8' }}>Pinned</span>
            </motion.div>
          )}

          {showMenu && (
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: menuOpen ? '#818cf8' : '#475569', background: menuOpen ? 'rgba(99,102,241,0.12)' : 'transparent' }}>
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    className="absolute right-0 top-9 z-30 w-44 rounded-xl overflow-hidden"
                    style={{ background: 'rgba(8,18,42,0.97)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
                    {canPin && (
                      <button onClick={() => { onPin?.(announcement.id); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        {isPinned ? <PinOff className="w-4 h-4" style={{ color: '#818cf8' }} /> : <Pin className="w-4 h-4" style={{ color: '#818cf8' }} />}
                        {isPinned ? 'Unpin' : 'Pin to top'}
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => { onDelete?.(announcement.id); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* â”€â”€ Content â”€â”€ */}
        <div className="pl-11 space-y-3">
          <div>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-4' : ''}`}
              style={{ color: '#94a3b8' }}>
              {announcement.content}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 mt-1.5 text-xs font-semibold transition-colors"
                style={{ color: '#818cf8' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#a5b4fc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}>
                {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
              </button>
            )}
          </div>

          {/* Attachment */}
          {announcement.attachmentUrl && (
            <motion.a whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.4)' }}
              href={announcement.attachmentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all group/att"
              style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <FileText className="w-4 h-4" style={{ color: '#818cf8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate transition-colors"
                  style={{ color: '#e2e8f0' }}>
                  {getFileNameFromUrl(announcement.attachmentUrl)}
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>Click to open</p>
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                <Download className="w-3.5 h-3.5" />
              </div>
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
