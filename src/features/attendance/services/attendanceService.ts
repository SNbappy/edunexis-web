import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { AttendanceSessionDto, AttendanceSummaryDto, TakeAttendanceRequest } from '@/types/attendance.types'
import type { CourseMemberDto } from '@/types/course.types'

export const attendanceService = {
    getSessions: (courseId: string) =>
        api.get<ApiResponse<AttendanceSessionDto[]>>(
            `/Attendance/courses/${courseId}/sessions`
        ).then((r) => r.data),

    getMembers: (courseId: string) =>
        api.get<ApiResponse<CourseMemberDto[]>>(
            `/Courses/${courseId}/members`
        ).then((r) => r.data),

    takeAttendance: (data: TakeAttendanceRequest) =>
        api.post<ApiResponse<AttendanceSessionDto>>(
            `/Attendance/courses/${data.courseId}/sessions`,
            {
                date: data.date,
                topic: data.topic,
                entries: data.records.map((r) => ({
                    studentId: r.studentId,
                    status: r.status,
                })),
            }
        ).then((r) => r.data),

    updateSession: (courseId: string, sessionId: string, data: {
        topic?: string
        entries: { studentId: string; status: string }[]
    }) =>
        api.put<ApiResponse<AttendanceSessionDto>>(
            `/Attendance/courses/${courseId}/sessions/${sessionId}`,
            data
        ).then((r) => r.data),

    deleteSession: (courseId: string, sessionId: string) =>
        api.delete<ApiResponse>(
            `/Attendance/courses/${courseId}/sessions/${sessionId}`
        ).then((r) => r.data),

    getSummary: (courseId: string, studentId?: string) =>
        api.get<ApiResponse<AttendanceSummaryDto[]>>(
            `/Attendance/courses/${courseId}/summary`,
            { params: studentId ? { studentId } : {} }
        ).then((r) => r.data),
}