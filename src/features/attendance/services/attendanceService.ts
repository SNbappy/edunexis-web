import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    AttendanceSessionDto, AttendanceRecordDto,
    TakeAttendanceRequest, AttendanceStatsDto, MyAttendanceDto,
} from '@/types/attendance.types'

export const attendanceService = {
    getSessions: (courseId: string) =>
        api.get<ApiResponse<AttendanceSessionDto[]>>(`/courses/${courseId}/attendance`).then((r) => r.data),

    getSession: (courseId: string, sessionId: string) =>
        api.get<ApiResponse<AttendanceRecordDto[]>>(`/courses/${courseId}/attendance/${sessionId}`).then((r) => r.data),

    takeAttendance: (data: TakeAttendanceRequest) =>
        api.post<ApiResponse<AttendanceSessionDto>>(`/courses/${data.courseId}/attendance`, data).then((r) => r.data),

    updateAttendance: (courseId: string, sessionId: string, data: TakeAttendanceRequest) =>
        api.put<ApiResponse<AttendanceSessionDto>>(`/courses/${courseId}/attendance/${sessionId}`, data).then((r) => r.data),

    deleteSession: (courseId: string, sessionId: string) =>
        api.delete<ApiResponse>(`/courses/${courseId}/attendance/${sessionId}`).then((r) => r.data),

    getStats: (courseId: string) =>
        api.get<ApiResponse<AttendanceStatsDto>>(`/courses/${courseId}/attendance/stats`).then((r) => r.data),

    getMyAttendance: (courseId: string) =>
        api.get<ApiResponse<MyAttendanceDto[]>>(`/courses/${courseId}/attendance/me`).then((r) => r.data),

    getMembers: (courseId: string) =>
        api.get<ApiResponse<{ userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }[]>>(
            `/courses/${courseId}/members`
        ).then((r) => r.data),
}
