import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { CourseDto } from '@/types/course.types'
import type { NotificationDto } from '@/types/notification.types'

export interface DashboardStatsDto {
    totalCourses: number
    totalStudents?: number
    upcomingEvents: number
    pendingAssignments?: number
    averageAttendance?: number
    pendingJoinRequests?: number
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

const notificationTypeMap: Record<string, string> = {
    NewAnnouncement:            'announcement',
    NewAssignment:              'assignment',
    AssignmentDeadlineReminder: 'assignment',
    MarksPublished:             'course',
    JoinRequestReceived:        'member',
    CourseJoinApproved:         'member',
    CourseJoinRejected:         'member',
    NewMaterial:                'material',
    GradeComplaint:             'course',
    General:                    'course',
}

export function mapNotificationToActivity(n: NotificationDto): RecentActivityDto {
    return {
        id: n.id,
        type: notificationTypeMap[n.type] ?? 'course',
        title: n.title,
        description: n.body,
        courseName: '',
        courseId: '',
        createdAt: n.createdAt,
        link: n.redirectUrl ?? undefined,
    }
}

export const dashboardService = {
    getCourses: (role: 'Teacher' | 'Student', userId: string) => {
        const param = role === 'Teacher' ? `teacherId=${userId}` : `studentId=${userId}`
        return api.get<ApiResponse<CourseDto[]>>(`/Courses?${param}`).then((r) => r.data)
    },

    getNotifications: () =>
        api.get<ApiResponse<NotificationDto[]>>('/Notifications').then((r) => r.data),
}
