import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCheck, UserX, Clock, UserMinus, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { usePublicProfile } from "@/features/profile/hooks/usePublicProfile"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CourseMemberDto, CourseDto } from "@/types/course.types"

interface Props { courseId: string; course?: CourseDto }
type FilterTab = "all" | "students" | "requests"

export default function CourseMembersList({ courseId, course }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const navigate  = useNavigate()

  const { members, joinRequests, isMembersLoading, isRequestsLoading,
          removeMember, isRemoving, reviewRequest, isReviewing } = useCourseMembers(courseId)
  const { data: teacherProfile } = usePublicProfile(course?.teacherId)

  const [confirmTarget, setConfirmTarget] = useState<CourseMemberDto | null>(null)
  const [filter, setFilter] = useState<FilterTab>("all")

  const handleVisitProfile = (userId: string, memberData: object) =>
    navigate(`/users/${userId}`, { state: { member: memberData } })

  const pendingCount = joinRequests.filter((r: any) => r.status === "Pending").length

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider  = dark ? "rgba(99,102,241,0.1)"  : "#f3f4f6"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const hoverBg  = dark ? "rgba(99,102,241,0.06)" : "#f9fafb"
  const inputBg  = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"
  const labelCol = dark ? "rgba(99,102,241,0.5)" : "#9ca3af"
  const skelBg   = dark ? "rgba(99,102,241,0.06)" : "#f3f4f6"

  const FILTERS = [
    { key: "all" as FilterTab,      label: "All",      count: members.length || undefined },
    { key: "students" as FilterTab, label: "Students", count: members.length || undefined },
    ...(teacher ? [{ key: "requests" as FilterTab, label: "Requests", count: pendingCount || undefined }] : []),
  ]

  if (isMembersLoading) return (
    <div className="space-y-3 max-w-3xl mx-auto">
      <div className="h-16 rounded-2xl animate-pulse" style={{ background: skelBg }} />
      {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: skelBg }} />)}
    </div>
  )

  return (
    <>
      <div className="space-y-4 max-w-3xl mx-auto">

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
          style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5", border: dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0" }}>
              <Users style={{ width: 16, height: 16, color: "#059669" }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Members</h2>
              <p className="text-[11px]" style={{ color: textSub }}>
                {members.length > 0
                  ? <span style={{ color: "#059669" }}>{members.length} student{members.length !== 1 ? "s" : ""} enrolled</span>
                  : <span>No students yet</span>
                }
                {teacher && pendingCount > 0 && (
                  <span style={{ color: "#d97706" }}> - {pendingCount} pending</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: inputBg, border: `1px solid ${border}` }}>
            {FILTERS.map(tab => (
              <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: filter === tab.key ? (dark ? "rgba(5,150,105,0.15)" : "#ecfdf5") : "transparent",
                  color:      filter === tab.key ? "#059669" : textSub,
                  border:     filter === tab.key ? (dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0") : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: filter === tab.key ? (dark ? "rgba(5,150,105,0.2)" : "#a7f3d0") : (tab.key === "requests" ? (dark ? "rgba(217,119,6,0.15)" : "#fffbeb") : (dark ? "rgba(255,255,255,0.07)" : "#f3f4f6")),
                      color: filter === tab.key ? "#059669" : (tab.key === "requests" ? "#d97706" : textSub),
                    }}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Join Requests */}
        {teacher && (filter === "all" || filter === "requests") && (
          <AnimatePresence>
            {isRequestsLoading ? (
              <div className="h-16 rounded-2xl animate-pulse" style={{ background: skelBg }} />
            ) : joinRequests.filter((r: any) => r.status === "Pending").length > 0 ? (
              <motion.div key="requests"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: dark ? "1px solid rgba(217,119,6,0.2)" : "1px solid #fde68a" }}>
                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: `1px solid ${dark ? "rgba(217,119,6,0.15)" : "#fef3c7"}` }}>
                  <Clock style={{ width: 13, height: 13, color: "#d97706" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "#d97706" }}>
                    Join Requests
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1"
                    style={{ background: dark ? "rgba(217,119,6,0.15)" : "#fffbeb", color: "#d97706" }}>
                    {joinRequests.filter((r: any) => r.status === "Pending").length}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {joinRequests.filter((r: any) => r.status === "Pending").map((req: any, i: number) => (
                    <motion.div key={req.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: dark ? "rgba(217,119,6,0.06)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.12)" : "1px solid #fde68a" }}>
                      <div className="rounded-xl overflow-hidden shrink-0"
                        style={{ border: dark ? "1.5px solid rgba(217,119,6,0.3)" : "1.5px solid #fde68a", width: 36, height: 36 }}>
                        <Avatar src={req.profilePhotoUrl} name={req.fullName} size="sm" className="w-full h-full rounded-none" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: textMain }}>{req.fullName}</p>
                        <p className="text-[11px] truncate" style={{ color: textMuted }}>{req.email}</p>
                      </div>
                      {req.studentId && (
                        <span className="text-[11px] font-mono shrink-0 hidden sm:block" style={{ color: textMuted }}>{req.studentId}</span>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => reviewRequest({ requestId: req.id, status: "Approved" })}
                          disabled={isReviewing}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                          style={{ background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5", border: dark ? "1px solid rgba(5,150,105,0.3)" : "1px solid #a7f3d0", color: "#059669" }}>
                          <UserCheck style={{ width: 13, height: 13 }} /> Approve
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => reviewRequest({ requestId: req.id, status: "Rejected" })}
                          disabled={isReviewing}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                          style={{ background: dark ? "rgba(239,68,68,0.1)" : "#fef2f2", border: dark ? "1px solid rgba(239,68,68,0.25)" : "1px solid #fecaca", color: "#ef4444" }}>
                          <UserX style={{ width: 13, height: 13 }} /> Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : filter === "requests" ? (
              <motion.div key="no-requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 rounded-2xl"
                style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${border}` }}>
                <Clock style={{ width: 28, height: 28, color: textMuted }} className="mb-2" strokeWidth={1} />
                <p className="text-[13px] font-bold" style={{ color: textSub }}>No pending requests</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Instructor */}
        {course && (filter === "all" || filter === "students") && (
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-1" style={{ color: labelCol }}>Instructor</p>
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => handleVisitProfile(course.teacherId, { userId: course.teacherId, fullName: course.teacherName, role: "Teacher" })}
              whileHover={{ y: -2, boxShadow: dark ? "0 8px 24px rgba(99,102,241,0.15)" : "0 4px 16px rgba(99,102,241,0.1)" }}
              className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
              style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #c7d2fe" }}>
              <div className="relative shrink-0">
                <div className="rounded-xl overflow-hidden" style={{ border: dark ? "2px solid rgba(99,102,241,0.4)" : "2px solid #a5b4fc", width: 40, height: 40 }}>
                  <Avatar src={teacherProfile?.profilePhotoUrl ?? course.teacherProfilePhotoUrl}
                    name={teacherProfile?.fullName ?? course.teacherName ?? "Instructor"}
                    size="md" className="w-full h-full rounded-none" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{ background: "#6366f1", border: `2px solid ${dark ? "rgb(16,24,44)" : "white"}` }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: textMain }}>
                  {teacherProfile?.fullName ?? course.teacherName ?? "Course Instructor"}
                </p>
                <p className="text-[11px]" style={{ color: textSub }}>Course Teacher</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe", color: "#6366f1" }}>
                Teacher
              </span>
            </motion.div>
          </div>
        )}

        {/* Students */}
        {(filter === "all" || filter === "students") && (
          members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 rounded-2xl"
              style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${border}` }}>
              <Users style={{ width: 36, height: 36, color: textMuted }} className="mb-3" strokeWidth={1} />
              <p className="text-[15px] font-bold mb-1" style={{ color: textMain }}>No students yet</p>
              <p className="text-[13px]" style={{ color: textSub }}>Approve join requests to add students</p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-1" style={{ color: labelCol }}>
                Students ({members.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {members.map((m: any, i: number) => (
                    <motion.div key={m.userId}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}
                      onClick={() => handleVisitProfile(m.userId, m)}
                      whileHover={{ y: -1 }}
                      className="group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = dark ? "rgba(99,102,241,0.3)" : "#c7d2fe")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = border)}>
                      <div className="rounded-xl overflow-hidden shrink-0"
                        style={{ border: dark ? "1.5px solid rgba(99,102,241,0.25)" : "1.5px solid #c7d2fe", width: 36, height: 36 }}>
                        <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" className="w-full h-full rounded-none" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: textMain }}>{m.fullName}</p>
                        <p className="text-[11px] truncate" style={{ color: textMuted }}>{m.email}</p>
                      </div>
                      {m.studentId && (
                        <span className="text-[11px] font-mono shrink-0 hidden sm:block" style={{ color: textMuted }}>{m.studentId}</span>
                      )}
                      {teacher && (
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); setConfirmTarget(m) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "#ef4444" }}
                          onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.12)" : "#fef2f2")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <UserMinus style={{ width: 14, height: 14 }} />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        )}
      </div>

      {/* Confirm remove modal */}
      <Modal isOpen={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Remove Student" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: dark ? "rgba(239,68,68,0.08)" : "#fef2f2", border: dark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #fecaca" }}>
            <AlertTriangle style={{ width: 18, height: 18, color: "#ef4444", flexShrink: 0 }} />
            <p className="text-[13px]" style={{ color: dark ? "#fca5a5" : "#b91c1c" }}>
              Remove <strong>{confirmTarget?.fullName}</strong> from this course?
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={isRemoving}
              onClick={() => confirmTarget && removeMember(confirmTarget.userId, { onSuccess: () => setConfirmTarget(null) })}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
