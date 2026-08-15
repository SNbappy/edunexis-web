import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCheck, UserX, Clock, UserMinus, AlertTriangle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Skeleton from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import { ICON_STROKE, FOCUS, SURFACE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { usePublicProfile } from "@/features/profile/hooks/usePublicProfile"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CourseMemberDto, CourseDto } from "@/types/course.types"

interface CourseMembersListProps {
  courseId: string
  course?: CourseDto
}

type FilterTab = "all" | "students" | "requests"

export default function CourseMembersList({ courseId, course }: CourseMembersListProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const navigate = useNavigate()

  const {
    members, joinRequests, isMembersLoading, isRequestsLoading,
    removeMember, isRemoving, reviewRequest, isReviewing,
  } = useCourseMembers(courseId)
  const { data: teacherProfile } = usePublicProfile(course?.teacherId)

  const [confirmTarget, setConfirmTarget] = useState<CourseMemberDto | null>(null)
  const [searchParams] = useSearchParams()
  const initialFilter = (searchParams.get("view") === "requests" ? "requests" : "all") as FilterTab
  const [filter, setFilter] = useState<FilterTab>(initialFilter)

  const handleVisitProfile = (userId: string, memberData: object) =>
    navigate("/users/" + userId, { state: { member: memberData } })

  const pendingRequests = joinRequests.filter((r: any) => r.status === "Pending")
  const pendingCount = pendingRequests.length

  /**
   * Roster order.
   *
   * The API returns members in insertion order, which is effectively random to
   * a reader — the same class looked shuffled every time you opened it.
   *
   * Role does the grouping (the instructor sits in their own block above), and
   * within the student body everyone sorts by student ID. Class reps are not
   * floated to the top: they are ordinary students on a roll sheet, and pinning
   * them would break the roll order that attendance and marks depend on. The
   * CR badge still marks them in place. `numeric: true` keeps 200109 before
   * 200115 rather than sorting them as text.
   */
  const sortedMembers = useMemo(
    () =>
      [...members].sort((a: any, b: any) =>
        (a.studentId ?? "").localeCompare(b.studentId ?? "", undefined, { numeric: true }) ||
        (a.fullName ?? "").localeCompare(b.fullName ?? ""),
      ),
    [members],
  )

  const FILTERS: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: members.length || undefined },
    { key: "students", label: "Students", count: members.length || undefined },
    ...(teacher
      ? [{ key: "requests" as FilterTab, label: "Requests", count: pendingCount || undefined }]
      : []),
  ]

  if (isMembersLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" rounded="2xl" />)}
      </div>
    )
  }

  return (
    <>
      {/* Left-aligned, not centred: the course header above spans the full
          width, and a centred column made the left edge jump between them. */}
      <div className="space-y-4">
        {/* Toolbar — count and filters, no repeated "Members" heading. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground">
            {members.length > 0
              ? `${members.length} student${members.length !== 1 ? "s" : ""} enrolled`
              : "No students yet"}
            {teacher && pendingCount > 0 && (
              <span className="font-semibold text-warning"> · {pendingCount} pending</span>
            )}
          </p>

          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted p-0.5">
            {FILTERS.map(tab => {
              const active = filter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-semibold transition-colors duration-120",
                    FOCUS,
                    active
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      // Pending requests are the one count worth flagging —
                      // they are work waiting on the teacher.
                      tab.key === "requests" && tab.count > 0
                        ? "bg-warning-soft text-warning"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Join Requests */}
        {teacher && (filter === "all" || filter === "requests") && (
          <AnimatePresence>
            {isRequestsLoading ? (
              <Skeleton className="h-16" rounded="2xl" />
            ) : pendingCount > 0 ? (
              /* Requests keep a warning tint — unlike the decorative colour
                 elsewhere, this one means "these are waiting on you". */
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-warning/30 bg-card"
              >
                <div className="flex items-center gap-2 border-b border-warning/30 bg-warning-soft px-4 py-2.5">
                  <Clock className="h-3.5 w-3.5 text-warning" strokeWidth={ICON_STROKE} />
                  <span className={cn(TEXT.eyebrow, "text-warning")}>Join requests</span>
                  <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-warning">
                    {pendingCount}
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {pendingRequests.map((req: any) => (
                    <li key={req.id} className="flex items-center gap-3 px-3 py-2.5">
                      <Avatar src={req.profilePhotoUrl} name={req.studentName} size="sm" className="h-9 w-9 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {req.studentName}
                        </p>
                        <p className="truncate text-[11.5px] text-muted-foreground">
                          {req.studentEmail}
                        </p>
                      </div>
                      {req.studentIdNumber && (
                        <span className="hidden shrink-0 font-mono text-[12px] font-bold text-muted-foreground sm:block">
                          {req.studentIdNumber}
                        </span>
                      )}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => reviewRequest({ requestId: req.id, status: "Approved" })}
                          disabled={isReviewing}
                          leftIcon={<UserCheck strokeWidth={ICON_STROKE} />}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => reviewRequest({ requestId: req.id, status: "Rejected" })}
                          disabled={isReviewing}
                          leftIcon={<UserX strokeWidth={ICON_STROKE} />}
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : filter === "requests" ? (
              <EmptyState
                variant="panel"
                icon={<Clock strokeWidth={ICON_STROKE} />}
                title="No pending requests"
                description="Students who ask to join this course will appear here for approval."
                className="py-10"
              />
            ) : null}
          </AnimatePresence>
        )}

        {/* Instructor */}
        {course && (filter === "all" || filter === "students") && (
          <div>
            <p className={cn(TEXT.eyebrow, "mb-2 px-1")}>Instructor</p>
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleVisitProfile(course.teacherId, {
                userId: course.teacherId,
                fullName: course.teacherName,
                role: "Teacher",
              })}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleVisitProfile(course.teacherId, {
                    userId: course.teacherId,
                    fullName: course.teacherName,
                    role: "Teacher",
                  })
                }
              }}
              className={cn(SURFACE.cardInteractive, FOCUS, "flex cursor-pointer items-center gap-3 p-3.5")}
            >
              <Avatar
                src={teacherProfile?.profilePhotoUrl ?? course.teacherProfilePhotoUrl}
                name={teacherProfile?.fullName ?? course.teacherName ?? "Instructor"}
                size="md"
                className="h-10 w-10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-foreground">
                  {teacherProfile?.fullName ?? course.teacherName ?? "Course Instructor"}
                </p>
                <p className="text-[11.5px] text-muted-foreground">Course teacher</p>
              </div>
              <Badge variant="primary" size="sm">Teacher</Badge>
            </div>
          </div>
        )}

        {/* Students */}
        {(filter === "all" || filter === "students") && (
          members.length === 0 ? (
            <EmptyState
              variant="panel"
              icon={<Users strokeWidth={ICON_STROKE} />}
              title="No students yet"
              description="Approve join requests to add students to this course."
            />
          ) : (
            <div>
              <p className={cn(TEXT.eyebrow, "mb-2 px-1")}>
                Students ({members.length})
              </p>
              {/* A divided list rather than a stack of cards: a roster is read
                  as a column of names, and 18 separately-shadowed cards make
                  that column harder to scan, not easier. */}
              <div className={cn(SURFACE.card, "overflow-hidden")}>
                <ul className="divide-y divide-border">
                  {sortedMembers.map((m: any) => (
                    <li
                      key={m.userId}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleVisitProfile(m.userId, m)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleVisitProfile(m.userId, m)
                        }
                      }}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors duration-120 hover:bg-muted/50",
                        FOCUS,
                      )}
                    >
                      <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" className="h-9 w-9 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-[13px] font-semibold text-foreground">
                          {m.fullName}
                          {m.isCR && <Badge variant="primary" size="xs">CR</Badge>}
                        </p>
                        <p className="truncate text-[11.5px] text-muted-foreground">
                          {m.email}
                        </p>
                      </div>
                      {m.studentId && (
                        <span className="hidden shrink-0 font-mono text-[12px] font-bold text-muted-foreground sm:block">
                          {m.studentId}
                        </span>
                      )}
                      {teacher && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setConfirmTarget(m) }}
                          aria-label={"Remove " + m.fullName}
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all duration-120 hover:bg-destructive-soft hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100",
                            FOCUS,
                          )}
                        >
                          <UserMinus className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>

      {/* Confirm remove modal */}
      <Modal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Remove student"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/40">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-[13px] text-red-900 dark:text-red-200">
              Remove <strong className="font-bold">{confirmTarget?.fullName}</strong> from this course?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={isRemoving}
              onClick={() =>
                confirmTarget &&
                removeMember(confirmTarget.userId, {
                  onSuccess: () => setConfirmTarget(null),
                })
              }
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}