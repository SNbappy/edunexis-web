import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface DashboardStatsDto {
    totalCourses: number
    totalStudents?: number
    pendingAssignments?: number
    pendingJoinRequests?: number
    averageAttendance?: number
    upcomingEvents: number
}

export interface UpcomingEventDto {
    id: string
    type: 'assignment' | 'ct' | 'presentation'
    title: string
    courseName: string
    courseId: string
    dueDate: string
    totalMarks?: number
}

export interface RecentActivityDto {
    id: string
    type: string
    title: string
    description: string
    courseName: string
    courseId: string
    createdAt: string
    link?: string
}

export interface DashboardDto {
    stats: DashboardStatsDto
    upcomingEvents: UpcomingEventDto[]
    recentActivity: RecentActivityDto[]
}

export const dashboardService = {
    getDashboard: () =>
        api.get<ApiResponse<DashboardDto>>('/dashboard').then((r) => r.data),
}
