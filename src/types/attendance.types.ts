export type AttendanceStatus = 'Present' | 'Absent' | 'Unmarked'

export interface AttendanceRecordDto {
    studentId: string
    studentName: string
    status: string
}

export interface AttendanceSessionDto {
    id: string
    courseId: string
    date: string
    topic?: string
    records: AttendanceRecordDto[]
}

export interface AttendanceSummaryDto {
    studentId: string
    studentName: string
    totalSessions: number
    presentCount: number
    absentCount: number
    unmarkedCount: number
    attendancePercent: number
}

export interface TakeAttendanceRequest {
    courseId: string
    date: string
    topic?: string
    records: { studentId: string; status: AttendanceStatus }[]
}

export interface CreateAttendanceSessionRequest {
    date: string
    topic?: string
    entries: { studentId: string; status: AttendanceStatus }[]
}
