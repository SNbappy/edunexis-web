import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, CheckCheck, Loader2,
  ClipboardList, Megaphone, Users, BookOpen,
  GraduationCap, Info, AlertCircle, Sparkles, Clock, Check, X, Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../hooks/useNotifications'
import { useNavigate } from 'react-router-dom'

interface Props { isOpen: boolean; onClose: () => void }

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  Assignment:       { icon: ClipboardList, color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',   label: 'Assignment'   },
  Announcement:     { icon: Megaphone,     color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)',   label: 'Announcement' },
  CourseEnrollment: { icon: GraduationCap, color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',   label: 'Enrollment'   },
  CourseMaterial:   { icon: BookOpen,      color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',    label: 'Material'     },
  JoinRequest:      { icon: Users,         color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)',   label: 'Join Request' },
  Grade:            { icon: Sparkles,      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',   label: 'Grade'        },
  General:          { icon: Info,          color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.2)',  label: 'General'      },
  Alert:            { icon: AlertCircle,   color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)',  label: 'Alert'        },
}
const getConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.General

export default function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } = useNotifications()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen || unreadCount === 0) return
    const t = setTimeout(() => markAllRead(), 3000)
    return () => clearTimeout(t)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[78vh] z-50 flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(6,13,31,0.98)',
              border: '1px solid rgba(99,102,241,0.18)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 shrink-0"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }}>
                  <Bell className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[14px] font-extrabold" style={{ color: '#e2e8f0' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg,#ef4444,#ec4899)', boxShadow: '0 2px 8px rgba(239,68,68,0.35)' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => markAllRead()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                    <CheckCheck className="w-3 h-3" /> All read
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#475569' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}>
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-14">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#4f46e5' }} />
                    <span className="text-[11px]" style={{ color: '#475569' }}>Loading…</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <BellOff className="w-5 h-5" style={{ color: '#4f46e5' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold" style={{ color: '#94a3b8' }}>All caught up!</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>No new notifications</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((n: any, i: number) => {
                    const cfg    = getConfig(n.type)
                    const Icon   = cfg.icon
                    const isUnread = !n.isRead
                    const timeAgo  = n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                      : ''
                    return (
                      <motion.div key={n.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30, scale: 0.95 }}
                        transition={{ duration: 0.18, delay: i * 0.02 }}
                        className="group relative rounded-xl cursor-pointer overflow-hidden transition-all"
                        style={{
                          background: isUnread ? 'rgba(13,20,45,0.9)' : 'rgba(10,16,34,0.4)',
                          border: isUnread ? `1px solid ${cfg.border}` : '1px solid rgba(99,102,241,0.08)',
                        }}
                        onClick={() => {
                          if (isUnread) markRead?.(n.id)
                          if (n.redirectUrl) { navigate(n.redirectUrl); onClose() }
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = cfg.border}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = isUnread ? cfg.border : 'rgba(99,102,241,0.08)'}>

                        {/* Unread bar */}
                        {isUnread && (
                          <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
                            style={{ background: `linear-gradient(180deg,${cfg.color},${cfg.color}55)` }} />
                        )}

                        <div className="flex items-start gap-3 px-3 py-3 pl-4">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[12px] font-bold leading-snug line-clamp-1"
                                style={{ color: isUnread ? '#e2e8f0' : '#64748b' }}>
                                {n.title ?? n.message ?? 'Notification'}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {isUnread && (
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                                )}
                              </div>
                            </div>

                            {n.body && (
                              <p className="text-[11px] leading-relaxed line-clamp-2 mt-0.5"
                                style={{ color: isUnread ? '#475569' : '#334155' }}>
                                {n.body}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] flex items-center gap-1 font-medium"
                                style={{ color: '#334155' }}>
                                <Clock className="w-2.5 h-2.5" />{timeAgo}
                              </span>

                              {/* Hover actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                {isUnread && (
                                  <button onClick={e => { e.stopPropagation(); markRead?.(n.id) }}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    <Check className="w-2.5 h-2.5" /> Read
                                  </button>
                                )}
                                <button onClick={e => { e.stopPropagation(); deleteNotification?.(n.id) }}
                                  className="w-6 h-6 rounded-md flex items-center justify-center"
                                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                                  <Trash2 className="w-3 h-3" style={{ color: '#f87171' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="shrink-0 px-4 py-2.5" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                <button onClick={() => { navigate('/notifications'); onClose() }}
                  className="w-full text-[12px] font-bold py-1.5 rounded-xl transition-all"
                  style={{ color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}>
                  View all notifications →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
