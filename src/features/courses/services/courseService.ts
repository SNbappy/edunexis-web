import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    CourseDto, CourseSummaryDto, CourseMemberDto,
    CreateCourseRequest, UpdateCourseRequest, JoinRequest,
} from '@/types/course.types'

export const courseService = {
    getMyCourses: () =>
        api.get<ApiResponse<CourseSummaryDto[]>>('/courses').then((r) => r.data),

    getCourseById: (id: string) =>
        api.get<ApiResponse<CourseDto>>(`/courses/${id}`).then((r) => r.data),

    createCourse: (data: CreateCourseRequest) =>
        api.post<ApiResponse<CourseDto>>('/courses', data).then((r) => r.data),

    updateCourse: (id: string, data: UpdateCourseRequest) =>
        api.put<ApiResponse<CourseDto>>(`/courses/${id}`, data).then((r) => r.data),

    deleteCourse: (id: string) =>
        api.delete<ApiResponse>(`/courses/${id}`).then((r) => r.data),

    archiveCourse: (id: string) =>
        api.patch<ApiResponse>(`/courses/${id}/archive`).then((r) => r.data),

    getMembers: (id: string) =>
        api.get<ApiResponse<CourseMemberDto[]>>(`/courses/${id}/members`).then((r) => r.data),

    getJoinRequests: (id: string) =>
        api.get<ApiResponse<JoinRequest[]>>(`/courses/${id}/join-requests`).then((r) => r.data),

    reviewJoinRequest: (courseId: string, requestId: string, status: 'Approved' | 'Rejected') =>
        api.post<ApiResponse>(`/courses/${courseId}/join-requests/${requestId}/review`, { status }).then((r) => r.data),

    joinCourse: (courseId: string, joiningCode: string) =>
        api.post<ApiResponse>(`/courses/${courseId}/join`, { joiningCode }).then((r) => r.data),

    leaveCourse: (courseId: string) =>
        api.post<ApiResponse>(`/courses/${courseId}/leave`).then((r) => r.data),
}
