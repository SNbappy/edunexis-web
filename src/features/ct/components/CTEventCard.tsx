import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, Upload, CheckCircle2, MoreVertical, Eye, Edit2, Send, EyeOff, Trash2, ClipboardList } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto } from '@/types/ct.types'

interface Props {
  ct: CTEventDto
  index?: number
  onView: (ct: CTEventDto) => void
  onDelete?: (ct: CTEventDto) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onEnterMarks?: (ct: CTEventDto) => void
}

export default function CTEventCard({ ct, index = 0, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks }: Props) {
  const { user } = useAuthStore()
  const teacher    = isTeacher(user?.role ?? 'Student')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  const isPublished = ct.status === 'Published'
  const isDraft     = ct.status === 'Draft'

  const stripeColor  = isPublished ? '#34d399' : '#fbbf24'
  const statusColor  = isPublished ? '#34d399' : '#fbbf24'
  const statusBg     = isPublished ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)'
  const statusBorder = isPublished ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'

  const hasMenu = teacher && (onUploadKhata || onEnterMarks || onPublish || onUnpublish || onDelete)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      onClick={() => onView(ct)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      className="relative rounded-2xl cursor-pointer"
      style={{
        background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,rgba(6,13,31,0.97) 100%)',
        border: hovered ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Status stripe */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: `linear-gradient(180deg,${stripeColor},${stripeColor}50)` }} />

      <div className="flex items-start gap-4 px-5 py-4">
        {/* CT Number badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', boxShadow: '0 2px 12px rgba(99,102,241,0.15)' }}>
          <span className="text-sm font-extrabold" style={{ color: '#818cf8' }}>CT{ct.ctNumber}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[13.5px] leading-snug line-clamp-1 transition-colors"
              style={{ color: hovered ? '#818cf8' : '#e2e8f0' }}>
              {ct.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              {/* Status pill */}
              <span className="text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                {isPublished ? <><CheckCircle2 className="w-3 h-3" /> Published</> : <><Edit2 className="w-3 h-3" /> Draft</>}
              </span>
              {/* Menu */}
              {hasMenu && (
                <div className="relative">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                    onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: menuOpen ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      color: '#818cf8',
                      opacity: hovered || menuOpen ? 1 : 0,
                    }}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </motion.button>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 z-[100] w-48 rounded-xl overflow-hidden"
                      style={{ background: 'rgba(7,14,33,0.98)', border: '1px solid rgba(99,102,241,0.22)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.4),transparent)' }} />
                      <div className="p-1">
                        <MenuBtn icon={Eye} label="View Details" color="#818cf8" onClick={() => { onView(ct); setMenuOpen(false) }} />
                        {onUploadKhata && (
                          <MenuBtn icon={Upload} label={ct.khataUploaded ? 'Re-upload Khata' : 'Upload Khata'} color="#818cf8" onClick={() => { onUploadKhata(ct); setMenuOpen(false) }} />
                        )}
                        {ct.khataUploaded && onEnterMarks && (
                          <MenuBtn icon={ClipboardList} label={isPublished ? 'View / Edit Marks' : 'Enter Marks'} color="#fbbf24" onClick={() => { onEnterMarks(ct); setMenuOpen(false) }} />
                        )}
                        {isDraft && ct.khataUploaded && onPublish && (
                          <MenuBtn icon={Send} label="Publish Results" color="#34d399" onClick={() => { onPublish(ct.id); setMenuOpen(false) }} />
                        )}
                        {isPublished && onUnpublish && (
                          <MenuBtn icon={EyeOff} label="Unpublish" color="#fbbf24" onClick={() => { onUnpublish(ct.id); setMenuOpen(false) }} />
                        )}
                        {onDelete && (
                          <>
                            <div className="h-[1px] mx-2 my-1" style={{ background: 'rgba(99,102,241,0.1)' }} />
                            <MenuBtn icon={Trash2} label="Delete" color="#f87171" onClick={() => { onDelete(ct); setMenuOpen(false) }} />
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {ct.heldOn ? (
              <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: '#475569' }}>
                <Calendar className="w-3.5 h-3.5" /> {formatDate(ct.heldOn, 'dd MMM yyyy')}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: '#f59e0b' }}>
                <Calendar className="w-3.5 h-3.5" /> Date not set
              </span>
            )}
            <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8' }}>
              {ct.maxMarks} marks
            </span>
            {teacher && (
              ct.khataUploaded
                ? <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#34d399' }}>
                    <CheckCircle2 className="w-3 h-3" /> Khata uploaded
                  </span>
                : <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#f59e0b' }}>
                    <Upload className="w-3 h-3" /> Khata pending
                  </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MenuBtn({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
      style={{ color }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${color}18`}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  )
}