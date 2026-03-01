import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '../services/attendanceService'

export function useAttendanceStats(courseId: string) {
    return useQuery({
        queryKey: ['attendance-stats', courseId],
        queryFn: async () => {
            const res = await attendanceService.getStats(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })
}

export function useMyAttendance(courseId: string) {
    return useQuery({
        queryKey: ['my-attendance', courseId],
        queryFn: async () => {
            const res = await attendanceService.getMyAttendance(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })
}
