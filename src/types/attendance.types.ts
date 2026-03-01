export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused'

export interface AttendanceSessionDto {
    id: string
    courseId: string
    date: string
    topic?: string
    totalStudents: number
    presentCount: number
    absentCount: number
    lateCount: number
    attendancePercent: number
    takenBy: string
    createdAt: string
}

export interface AttendanceRecordDto {
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string
    rollNumber?: string
    status: AttendanceStatus
    remarks?: string
}

export interface TakeAttendanceRequest {
    courseId: string
    date: string
    topic?: string
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
}

export interface StudentAttendanceSummaryDto {
    studentId: string
    studentName: string
    totalClasses: number
    presentCount: number
    absentCount: number
    lateCount: number
    attendancePercent: number
    lastPresent?: string
}

export interface AttendanceStatsDto {
    totalSessions: number
    averageAttendance: number
    lastSessionDate?: string
    studentSummaries: StudentAttendanceSummaryDto[]
}

export interface MyAttendanceDto {
    sessionId: string
    date: string
    topic?: string
    status: AttendanceStatus
    courseId: string
}
