import { useState } from "react"
import { Plus, LayoutList, Calendar as CalendarIcon } from "lucide-react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { ICON, ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import AttendanceRecordsList from "@/features/attendance/components/AttendanceRecordsList"
import AttendanceCalendar from "@/features/attendance/components/AttendanceCalendar"
import AttendanceStatsCard from "@/features/attendance/components/AttendanceStatsCard"
import TakeAttendanceSheet from "@/features/attendance/components/TakeAttendanceSheet"
import AttendanceExportButton from "@/features/attendance/components/AttendanceExportButton"
import StudentAttendanceView from "@/features/attendance/components/StudentAttendanceView"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAttendanceStats } from "@/features/attendance/hooks/useAttendanceStats"
import { cn } from "@/utils/cn"

interface Props { courseId: string; courseName?: string; courseCode?: string; semester?: string; department?: string }

export default function AttendanceTab({ courseId, courseName, courseCode, semester, department }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const [takeOpen, setTakeOpen]       = useState(false)
  const [editSession, setEditSession] = useState<any>(null)
  const [view, setView]               = useState<"list" | "calendar">("list")

  const {
    sessions, members,
    isSessionsLoading,
    takeAttendance, isTaking,
    editAttendance, isEditing,
    deleteSession,
  } = useAttendance(courseId)

  const { data: stats } = useAttendanceStats(courseId)

  if (!teacher) return <StudentAttendanceView courseId={courseId} />

  return (
    <div className="space-y-4">
      {/* Toolbar.
          No "Attendance" heading here — the course tab bar directly above
          already says which section you are in, and repeating it cost a full
          card of vertical space before any data. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="mr-auto inline-flex items-center gap-0.5 rounded-xl border border-border bg-muted p-0.5">
          {([
            { id: "list",     label: "List",     icon: LayoutList   },
            { id: "calendar", label: "Calendar", icon: CalendarIcon },
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              aria-pressed={view === opt.id}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-semibold transition-colors duration-120",
                FOCUS,
                view === opt.id
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <opt.icon className={ICON.sm} strokeWidth={ICON_STROKE} />
              {opt.label}
            </button>
          ))}
        </div>

        <AttendanceExportButton courseId={courseId} courseName={courseName ?? "Course"} courseCode={courseCode} semester={semester} department={department} members={members} />

        <Button size="md" onClick={() => setTakeOpen(true)} leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
          Take attendance
        </Button>
      </div>

      {/* Stats — only once there is something to summarise. With no sessions
          the card rendered its own "No attendance taken yet" panel directly
          above the list's "No attendance records yet" panel, so an empty tab
          said the same thing twice in two different visual styles. */}
      {stats && stats.totalSessions > 0 && (
        <AttendanceStatsCard
          totalSessions={stats.totalSessions}
          averageAttendance={stats.averageAttendance}
          totalStudents={stats.studentSummaries?.length}
          lastSessionDate={stats.lastSessionDate}
          sessions={sessions}
        />
      )}

      {/* Content */}
      {isSessionsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" rounded="xl" />
          ))}
        </div>
      ) : view === "list" ? (
        <AttendanceRecordsList
          sessions={sessions}
          totalStudents={stats?.studentSummaries?.length}
          onEdit={(id) => setEditSession(sessions.find((s: any) => s.id === id) ?? null)}
          onDelete={deleteSession}
        />
      ) : (
        <AttendanceCalendar sessions={sessions} />
      )}

      {/* Edit sheet */}
      {editSession && (
        <TakeAttendanceSheet
          isOpen={!!editSession}
          onClose={() => setEditSession(null)}
          members={members}
          courseId={courseId}
          initialDate={editSession.date}
          initialTopic={editSession.topic}
          initialStatuses={Object.fromEntries(
            editSession.records.map((r: any) => [r.studentId, r.status]),
          )}
          onSubmit={(data: any) => {
            editAttendance({
              sessionId: editSession.id,
              data: {
                topic: data.topic,
                entries: data.records.map((r: any) => ({ studentId: r.studentId, status: r.status })),
              },
            })
            setEditSession(null)
          }}
          isLoading={isEditing}
        />
      )}

      {/* Take sheet */}
      <TakeAttendanceSheet
        isOpen={takeOpen}
        onClose={() => setTakeOpen(false)}
        members={members}
        courseId={courseId}
        onSubmit={(data: any) =>
          takeAttendance(data, { onSuccess: () => setTakeOpen(false) })
        }
        isLoading={isTaking}
      />
    </div>
  )
}
