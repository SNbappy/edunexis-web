export type AttendanceStatus = 'Present' | 'Absent' | 'Late'

export interface AttendanceEntry {
    studentId: string
    status: AttendanceStatus
}

export interface AttendanceRecordDto {
    studentId: string
    studentName: string
    status: AttendanceStatus
}

export interface AttendanceSessionDto {
    id: string
    courseId: string
    date: string
    topic: string | null
    records: AttendanceRecordDto[]
}

export interface AttendanceSummaryDto {
    studentId: string
    studentName: string
    totalSessions: number
    presentCount: number
    absentCount: number
    lateCount: number
    attendancePercent: number
}
