import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import AnnouncementCard from './AnnouncementCard'
import CreateAnnouncementForm from './CreateAnnouncementForm'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

interface Props { courseId: string }

export default function AnnouncementFeed({ courseId }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? 'Student')
  const { announcements, isLoading, create, isCreating, deleteAnnouncement, togglePin } = useAnnouncements(courseId)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading || !listRef.current) return
    const cards = listRef.current.querySelectorAll('.announcement-card')
    if (!cards.length) return
    gsap.fromTo(cards,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], stagger: 0.07 }
    )
  }, [isLoading, announcements.length])

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.1)', height: i === 1 ? 100 : 140 }}>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'rgba(99,102,241,0.12)' }} />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 rounded-full w-1/3" style={{ background: 'rgba(99,102,241,0.1)' }} />
                <div className="h-2.5 rounded-full w-1/4" style={{ background: 'rgba(99,102,241,0.07)' }} />
              </div>
            </div>
            <div className="space-y-2 pl-12">
              <div className="h-2.5 rounded-full w-full" style={{ background: 'rgba(99,102,241,0.07)' }} />
              <div className="h-2.5 rounded-full w-4/5" style={{ background: 'rgba(99,102,241,0.07)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {teacher && (
        <CreateAnnouncementForm courseId={courseId} onSubmit={create} isLoading={isCreating} />
      )}

      {announcements.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
          style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.6) 0%,rgba(6,13,31,0.8) 100%)', border: '1px dashed rgba(99,102,241,0.15)' }}>
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Megaphone className="w-8 h-8" style={{ color: '#818cf8' }} strokeWidth={1.5} />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <Sparkles className="w-2.5 h-2.5" style={{ color: '#fbbf24' }} />
            </motion.div>
          </div>
          <p className="text-base font-bold mb-1" style={{ color: '#e2e8f0' }}>No announcements yet</p>
          <p className="text-sm max-w-xs" style={{ color: '#475569' }}>
            {teacher
              ? 'Post your first announcement to keep students informed'
              : 'Your teacher has not posted any announcements yet'
            }
          </p>
        </motion.div>
      ) : (
        <div ref={listRef} className="space-y-4">
          {announcements.map((a, i) => (
            <div key={a.id} className="announcement-card">
              <AnnouncementCard announcement={a} index={i}
                canPin={teacher} canDelete={teacher || a.authorId === user?.id}
                onPin={togglePin} onDelete={deleteAnnouncement} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
