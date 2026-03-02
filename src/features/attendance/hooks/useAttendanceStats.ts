import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '../services/attendanceService'
import { useAuthStore } from '@/store/authStore'

export function useAttendanceStats(courseId: string) {
    return useQuery({
        queryKey: ['attendance-stats-computed', courseId],
        queryFn: async () => {
            const res = await attendanceService.getSessions(courseId)
            if (!res.success) throw new Error(res.message)
            const sessions = res.data ?? []

            const totalSessions = sessions.length
            const lastSessionDate = sessions[0]?.date ?? null

            const studentMap = new Map<string, {
                name: string; present: number; absent: number; unmarked: number
            }>()

            sessions.forEach((session) => {
                session.records.forEach((record) => {
                    if (!studentMap.has(record.studentId)) {
                        studentMap.set(record.studentId, {
                            name: record.studentName, present: 0, absent: 0, unmarked: 0,
                        })
                    }
                    const s = studentMap.get(record.studentId)!
                    if (record.status === 'Present') s.present++
                    else if (record.status === 'Absent') s.absent++
                    else s.unmarked++
                })
            })

            const studentSummaries = Array.from(studentMap.entries()).map(([id, data]) => ({
                studentId: id,
                studentName: data.name,
                totalSessions,
                presentCount: data.present,
                absentCount: data.absent,
                unmarkedCount: data.unmarked,
                attendancePercent: totalSessions > 0
                    ? Math.round((data.present / totalSessions) * 100) : 0,
            }))

            const avgAttendance = studentSummaries.length > 0
                ? Math.round(
                    studentSummaries.reduce((acc, s) => acc + s.attendancePercent, 0)
                    / studentSummaries.length * 10) / 10
                : 0

            return {
                totalSessions,
                averageAttendance: avgAttendance,
                totalStudents: studentSummaries.length,
                lastSessionDate,
                studentSummaries,
                sessions,
            }
        },
        enabled: !!courseId,
    })
}

export function useMyAttendance(courseId: string) {
    const { user } = useAuthStore()
    return useQuery({
        queryKey: ['my-attendance', courseId, user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('Not authenticated')
            const res = await attendanceService.getSummary(courseId, user.id)
            if (!res.success) throw new Error(res.message)
            return res.data?.[0] ?? null
        },
        enabled: !!courseId && !!user?.id,
    })
}

