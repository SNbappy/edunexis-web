import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type {
  CourseDto, CourseMemberDto, MyCoursesDto, CourseByCodeDto,
  CreateCourseRequest, UpdateCourseRequest,
} from "@/types/course.types"

export const courseService = {
  /** Returns caller's enrolled + pending + rejected courses. */
  getMyCourses: () =>
    api.get<ApiResponse<MyCoursesDto>>("/Courses/my-courses").then(r => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<CourseDto>>(`/Courses/${id}`).then(r => r.data),

  /** Look up a course by its 8-char joining code for the Join preview. */
  getByCode: (code: string) =>
    api.get<ApiResponse<CourseByCodeDto>>(`/Courses/by-code/${encodeURIComponent(code)}`).then(r => r.data),

  create: (data: CreateCourseRequest) =>
    api.post<ApiResponse<CourseDto>>("/Courses", data).then(r => r.data),

  updateCourse: (id: string, data: UpdateCourseRequest) =>
    api.put<ApiResponse<CourseDto>>(`/Courses/${id}`, data).then(r => r.data),

  uploadCover: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return api
      .post<ApiResponse<string>>("/Courses/upload-cover", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => r.data)
  },

  deleteCourse: (id: string) =>
    api.delete<ApiResponse>(`/Courses/${id}`).then(r => r.data),

  archiveCourse: (id: string) =>
    api.patch<ApiResponse>(`/Courses/${id}/archive`).then(r => r.data),

  unarchiveCourse: (id: string) =>
    api.patch<ApiResponse>(`/Courses/${id}/unarchive`).then(r => r.data),

  getMembers: (id: string) =>
    api.get<ApiResponse<CourseMemberDto[]>>(`/Courses/${id}/members`).then(r => r.data),

  removeMember: (courseId: string, studentId: string) =>
    api.delete<ApiResponse>(`/Courses/${courseId}/members/${studentId}`).then(r => r.data),

  getJoinRequests: (id: string) =>
    api.get<ApiResponse<any[]>>(`/Courses/${id}/join-requests`).then(r => r.data),

  /** Student requests to join a course they know the ID + code of. */
  requestJoin: (id: string, joiningCode: string) =>
    api.post<ApiResponse>(`/Courses/${id}/join`, { joiningCode }).then(r => r.data),

  /** Student dismisses a rejected join request. */
  dismissJoinRequest: (requestId: string) =>
    api.post<ApiResponse>(`/Courses/join-requests/${requestId}/dismiss`).then(r => r.data),

  leave: (id: string) =>
    api.post<ApiResponse>(`/Courses/${id}/leave`).then(r => r.data),

  reviewJoinRequest: (courseId: string, requestId: string, approve: boolean) =>
    api
      .post<ApiResponse>(
        `/Courses/${courseId}/join-requests/${requestId}/review`,
        { approve },
      )
      .then(r => r.data),
}
