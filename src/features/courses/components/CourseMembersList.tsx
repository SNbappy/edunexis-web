import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserMinus, AlertTriangle, UserCheck, UserX, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useCourseMembers } from '../hooks/useCourseMembers'
import { usePublicProfile } from '@/features/profile/hooks/usePublicProfile'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CourseMemberDto, CourseDto } from '@/types/course.types'

interface Props { courseId: string; course?: CourseDto }

type FilterTab = 'all' | 'students' | 'requests'
const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',      label: 'All'      },
    { key: 'students', label: 'Students' },
    { key: 'requests', label: 'Requests' },
]

export default function CourseMembersList({ courseId, course }: Props) {
    const { user } = useAuthStore()
    const teacher  = isTeacher(user?.role ?? 'Student')
    const navigate = useNavigate()
    const { members, joinRequests, isMembersLoading, isRequestsLoading,
            removeMember, isRemoving, reviewRequest, isReviewing } = useCourseMembers(courseId)
    const { data: teacherProfile } = usePublicProfile(course?.teacherId)

    const [confirmTarget, setConfirmTarget] = useState<CourseMemberDto | null>(null)
    const [filter, setFilter] = useState<FilterTab>('all')

    const handleVisitProfile = (userId: string, memberData: object) =>
        navigate(`/users/${userId}`, { state: { member: memberData } })

    const pendingCount = joinRequests.filter(r => r.status === 'Pending').length

    const counts: Record<FilterTab, number | undefined> = {
        all:      members.length || undefined,
        students: members.length || undefined,
        requests: teacher ? (pendingCount || undefined) : undefined,
    }

    if (isMembersLoading) return (
        <div className="space-y-4 max-w-3xl mx-auto">
            <div className="h-16 rounded-2xl animate-pulse"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl animate-pulse"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
            ))}
        </div>
    )

    return (
        <>
            <div className="space-y-4 max-w-3xl mx-auto">

                {/* ── Premium Toolbar ── */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
                    style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <Users className="w-4 h-4" style={{ color: '#818cf8' }} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Members</h2>
                            <p className="text-[11px]" style={{ color: '#475569' }}>
                                {members.length > 0
                                    ? <span style={{ color: '#34d399' }}>{members.length} student{members.length !== 1 ? 's' : ''} enrolled</span>
                                    : <span>No students yet</span>
                                }
                                {teacher && pendingCount > 0 && (
                                    <span style={{ color: '#fbbf24' }}> · {pendingCount} pending</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Filter toggle — only show Requests tab for teachers */}
                    <div className="flex items-center gap-1 p-1 rounded-xl"
                        style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {FILTER_TABS.filter(t => t.key !== 'requests' || teacher).map(tab => (
                            <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                                onClick={() => setFilter(tab.key)}
                                className="relative px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                                style={{
                                    background: filter === tab.key ? 'rgba(99,102,241,0.25)' : 'transparent',
                                    color:      filter === tab.key ? '#818cf8' : '#475569',
                                    border:     filter === tab.key ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                                }}>
                                {tab.label}
                                {counts[tab.key] !== undefined && (
                                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold"
                                        style={{
                                            background: filter === tab.key ? 'rgba(129,140,248,0.2)' : tab.key === 'requests' ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.08)',
                                            color:      filter === tab.key ? '#818cf8' : tab.key === 'requests' ? '#fbbf24' : '#334155',
                                        }}>
                                        {counts[tab.key]}
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Join Requests (teacher only) ── */}
                {teacher && (filter === 'all' || filter === 'requests') && (
                    <AnimatePresence>
                        {isRequestsLoading ? (
                            <div className="h-16 rounded-2xl animate-pulse"
                                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
                        ) : joinRequests.filter(r => r.status === 'Pending').length > 0 ? (
                            <motion.div key="requests"
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                <div className="flex items-center gap-2 px-4 py-3 border-b"
                                    style={{ borderColor: 'rgba(251,191,36,0.15)' }}>
                                    <Clock className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
                                    <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>
                                        Join Requests
                                    </span>
                                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold"
                                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                                        {joinRequests.filter(r => r.status === 'Pending').length}
                                    </span>
                                </div>
                                <div className="p-3 space-y-2">
                                    {joinRequests.filter(r => r.status === 'Pending').map((req, i) => (
                                        <motion.div key={req.id}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="flex items-center gap-3 p-3 rounded-xl"
                                            style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
                                            <div className="rounded-xl overflow-hidden shrink-0"
                                                style={{ border: '1.5px solid rgba(251,191,36,0.3)', width: 36, height: 36 }}>
                                                <Avatar src={req.profilePhotoUrl} name={req.fullName} size="sm" className="w-full h-full rounded-none" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{req.fullName}</p>
                                                <p className="text-xs truncate" style={{ color: '#475569' }}>{req.email}</p>
                                            </div>
                                            {req.studentId && (
                                                <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: '#475569' }}>{req.studentId}</span>
                                            )}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <motion.button whileTap={{ scale: 0.95 }}
                                                    onClick={() => reviewRequest({ requestId: req.id, status: 'Approved' })}
                                                    disabled={isReviewing}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                                    style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                                                    <UserCheck className="w-3.5 h-3.5" /> Approve
                                                </motion.button>
                                                <motion.button whileTap={{ scale: 0.95 }}
                                                    onClick={() => reviewRequest({ requestId: req.id, status: 'Rejected' })}
                                                    disabled={isReviewing}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                                                    <UserX className="w-3.5 h-3.5" /> Reject
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : filter === 'requests' ? (
                            <motion.div key="no-requests"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-10 rounded-2xl"
                                style={{ background: 'rgba(10,22,40,0.4)', border: '1px dashed rgba(99,102,241,0.15)' }}>
                                <Clock className="w-8 h-8 mb-2" style={{ color: 'rgba(99,102,241,0.2)' }} strokeWidth={1} />
                                <p className="text-sm font-bold" style={{ color: '#334155' }}>No pending requests</p>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                )}

                {/* ── Instructor ── */}
                {course && (filter === 'all' || filter === 'students') && (
                    <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-1"
                            style={{ color: 'rgba(129,140,248,0.5)' }}>Instructor</p>
                        <motion.div
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleVisitProfile(course.teacherId, {
                                userId: course.teacherId, fullName: course.teacherName, role: 'Teacher',
                            })}
                            whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.4)' }}
                            className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.12) 0%,rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                            <div className="relative shrink-0">
                                <div className="rounded-xl overflow-hidden" style={{ border: '2px solid rgba(99,102,241,0.4)', width: 40, height: 40 }}>
                                    <Avatar
                                        src={teacherProfile?.profilePhotoUrl ?? course.teacherProfilePhotoUrl}
                                        name={teacherProfile?.fullName ?? course.teacherName ?? 'Instructor'}
                                        size="md" className="w-full h-full rounded-none" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                                    style={{ background: '#818cf8', border: '2px solid #060d1f' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: '#e2e8f0' }}>
                                    {teacherProfile?.fullName ?? course.teacherName ?? 'Course Instructor'}
                                </p>
                                <p className="text-xs" style={{ color: '#475569' }}>Course Teacher</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                                Teacher
                            </span>
                        </motion.div>
                    </div>
                )}

                {/* ── Students ── */}
                {(filter === 'all' || filter === 'students') && (
                    members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 rounded-2xl"
                            style={{ background: 'rgba(10,22,40,0.4)', border: '1px dashed rgba(99,102,241,0.15)' }}>
                            <Users className="w-10 h-10 mb-3" style={{ color: 'rgba(99,102,241,0.2)' }} strokeWidth={1} />
                            <p className="text-[15px] font-bold" style={{ color: '#334155' }}>No students yet</p>
                            <p className="text-[13px] mt-1" style={{ color: '#475569' }}>Approve join requests to add students</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-1"
                                style={{ color: 'rgba(129,140,248,0.5)' }}>Students ({members.length})</p>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {members.map((m, i) => (
                                        <motion.div key={m.userId}
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                                            onClick={() => handleVisitProfile(m.userId, m)}
                                            whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.3)' }}
                                            className="group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                                            style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                                            <div className="rounded-xl overflow-hidden shrink-0"
                                                style={{ border: '1.5px solid rgba(99,102,241,0.25)', width: 36, height: 36 }}>
                                                <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" className="w-full h-full rounded-none" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{m.fullName}</p>
                                                <p className="text-xs truncate" style={{ color: '#475569' }}>{m.email}</p>
                                            </div>
                                            {m.studentId && (
                                                <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: '#475569' }}>{m.studentId}</span>
                                            )}
                                            {m.isCR
                                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>CR</span>
                                                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>Student</span>
                                            }
                                            {teacher && user?.id !== m.userId && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setConfirmTarget(m) }}
                                                    className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                                                    title="Remove student">
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* ── Remove Confirm Modal ── */}
            <Modal isOpen={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Remove Student" size="sm">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: '#ef4444' }} />
                        <p className="text-sm" style={{ color: '#e2e8f0' }}>
                            Remove <span className="font-bold">{confirmTarget?.fullName}</span> from this course?
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setConfirmTarget(null)}>Cancel</Button>
                        <Button variant="destructive" className="flex-1" loading={isRemoving}
                            onClick={() => { if (confirmTarget) removeMember(confirmTarget.userId, { onSuccess: () => setConfirmTarget(null) }) }}>
                            <UserMinus className="w-4 h-4" /> Remove
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

