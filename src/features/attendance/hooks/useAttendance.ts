import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '../services/attendanceService'
import type { TakeAttendanceRequest } from '@/types/attendance.types'
import toast from 'react-hot-toast'

export function useAttendance(courseId: string) {
    const qc = useQueryClient()
    const key = ['attendance', courseId]

    const sessionsQuery = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await attendanceService.getSessions(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
        refetchInterval: 8_000,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const membersQuery = useQuery({
        queryKey: ['course-members-attendance', courseId],
        queryFn: async () => {
            const res = await attendanceService.getMembers(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
        refetchInterval: 8_000,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const takeMutation = useMutation({
        mutationFn: (data: TakeAttendanceRequest) => attendanceService.takeAttendance(data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['attendance-stats', courseId] })
                qc.invalidateQueries({ queryKey: ['attendance-stats-computed', courseId] })
                toast.success('Attendance saved successfully!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to save attendance.'),
    })

    const editMutation = useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: { topic?: string; entries: { studentId: string; status: string }[] } }) =>
            attendanceService.updateSession(courseId, sessionId, data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                qc.invalidateQueries({ queryKey: ['attendance-stats-computed', courseId] })
                toast.success('Attendance updated!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to update attendance.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (sessionId: string) => attendanceService.deleteSession(courseId, sessionId),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                toast.success('Session deleted.')
            } else toast.error(res.message)
        },
    })

    return {
        sessions: sessionsQuery.data ?? [],
        members: membersQuery.data ?? [],
        isSessionsLoading: sessionsQuery.isLoading,
        isMembersLoading: membersQuery.isLoading,
        takeAttendance: takeMutation.mutate,
        isTaking: takeMutation.isPending,
        editAttendance: editMutation.mutate,
        isEditing: editMutation.isPending,
        deleteSession: deleteMutation.mutate,
    }
}





