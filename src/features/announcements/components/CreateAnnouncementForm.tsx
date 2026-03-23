import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, X, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import type { CreateAnnouncementRequest } from '@/types/announcement.types'

interface Props {
  courseId: string
  onSubmit: (data: CreateAnnouncementRequest) => void
  isLoading?: boolean
}

export default function CreateAnnouncementForm({ courseId, onSubmit, isLoading }: Props) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [focused, setFocused] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const charLimit = 2000

  const handleSubmit = () => {
    if (!content.trim() || isLoading) return
    onSubmit({ courseId, content, attachment })
    setContent('')
    setAttachment(null)
    setExpanded(false)
    setFocused(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,rgba(6,13,31,0.95) 100%)',
        border: focused || expanded ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.15)',
        boxShadow: focused || expanded ? '0 0 0 3px rgba(99,102,241,0.07), 0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.3),rgba(6,182,212,0.2),transparent)' }} />

      {/* Posting overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 rounded-2xl"
            style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#818cf8' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Posting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4 cursor-text" onClick={() => { setExpanded(true); setFocused(true) }}>
        <div className="rounded-xl overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(99,102,241,0.3)', width: 36, height: 36 }}>
          <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" className="w-full h-full rounded-none" />
        </div>
        <span className="flex-1 text-sm select-none" style={{ color: '#334155' }}>
          Share something with your class...
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles className="w-3 h-3" style={{ color: '#818cf8' }} />
            <span className="text-[10px] font-bold" style={{ color: '#818cf8' }}>Announce</span>
          </div>
          <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); setFocused(!expanded) }}
            className="p-1 rounded-lg transition-colors" style={{ color: '#475569' }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded composer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3"
              style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="pt-3">
                <textarea
                  autoFocus
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleKey}
                  placeholder="Write your announcement... (Ctrl+Enter to post)"
                  rows={4}
                  maxLength={charLimit}
                  className="w-full rounded-xl text-sm px-4 py-3 resize-none transition-all focus:outline-none"
                  style={{
                    background: 'rgba(6,13,31,0.6)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#e2e8f0',
                    caretColor: '#818cf8',
                  }}
                  onFocusCapture={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.45)'}
                  onBlurCapture={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.2)'}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px]" style={{ color: content.length > charLimit * 0.9 ? '#f59e0b' : '#334155' }}>
                    {content.length}/{charLimit}
                  </span>
                </div>
              </div>

              {/* Attachment preview */}
              <AnimatePresence>
                {attachment && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Paperclip className="w-3.5 h-3.5 shrink-0" style={{ color: '#818cf8' }} />
                    <span className="flex-1 text-xs truncate" style={{ color: '#94a3b8' }}>{attachment.name}</span>
                    <button onClick={() => setAttachment(null)}
                      className="p-0.5 rounded transition-colors" style={{ color: '#475569' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  <Paperclip className="w-3.5 h-3.5" /> Attach file
                </motion.button>
                <input ref={fileRef} type="file" className="hidden"
                  onChange={e => setAttachment(e.target.files?.[0] ?? null)} />

                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setExpanded(false); setFocused(false) }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ color: '#475569', border: '1px solid rgba(99,102,241,0.12)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.12)'}>
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={content.trim() ? { scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' } : {}}
                    whileTap={content.trim() ? { scale: 0.97 } : {}}
                    onClick={handleSubmit}
                    disabled={!content.trim() || !!isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: content.trim() ? 'linear-gradient(135deg,#4f46e5,#06b6d4)' : 'rgba(99,102,241,0.1)',
                      color: content.trim() ? '#fff' : '#334155',
                      border: content.trim() ? 'none' : '1px solid rgba(99,102,241,0.15)',
                      cursor: content.trim() ? 'pointer' : 'not-allowed',
                    }}>
                    {isLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />
                    }
                    Post
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
