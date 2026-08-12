import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface PlatformSettingsDto {
  courseQuotaEnforced: boolean
}

export interface TeacherAdminDto {
  id: string
  email: string
  fullName: string | null
  activeCourseCount: number
  totalQuota: number | null
  usedQuota: number | null
  remainingQuota: number | null
  hasActiveQuota: boolean
}

export const adminService = {
  getSettings: () =>
    api.get<ApiResponse<PlatformSettingsDto>>('/Admin/settings').then(r => r.data),

  updateSettings: (courseQuotaEnforced: boolean) =>
    api.put<ApiResponse>('/Admin/settings', { courseQuotaEnforced }).then(r => r.data),

  getTeachers: () =>
    api.get<ApiResponse<TeacherAdminDto[]>>('/Admin/teachers').then(r => r.data),

  grantQuota: (teacherId: string, totalQuota: number, accessDurationDays: number) =>
    api.post<ApiResponse>(`/Admin/teachers/${teacherId}/quota`, {
      totalQuota, accessDurationDays,
    }).then(r => r.data),
}