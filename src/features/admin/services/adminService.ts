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
  /** Summed across every active grant, not a single row. */
  totalQuota: number | null
  usedQuota: number | null
  remainingQuota: number | null
  hasActiveQuota: boolean
  /** When the soonest-expiring active grant lapses. */
  nextExpiryDate: string | null
  expiresInDays: number | null
  activeGrantCount: number
}

export type GrantStatus = 'active' | 'used-up' | 'expired' | 'revoked'

/** One course-creation grant. Teachers can hold several at once. */
export interface GrantDto {
  id: string
  courses: number
  used: number
  remaining: number
  startsAt: string
  expiresAt: string
  expiresInDays: number
  isActive: boolean
  isRevoked: boolean
  isStarterGrant: boolean
  note: string | null
  grantedByEmail: string | null
  grantedAt: string
  status: GrantStatus
}

export const adminService = {
  getSettings: () =>
    api.get<ApiResponse<PlatformSettingsDto>>('/Admin/settings').then(r => r.data),

  updateSettings: (courseQuotaEnforced: boolean) =>
    api.put<ApiResponse>('/Admin/settings', { courseQuotaEnforced }).then(r => r.data),

  getTeachers: () =>
    api.get<ApiResponse<TeacherAdminDto[]>>('/Admin/teachers').then(r => r.data),

  getTeacherGrants: (teacherId: string) =>
    api.get<ApiResponse<GrantDto[]>>(`/Admin/teachers/${teacherId}/quota`).then(r => r.data),

  /** `courses` is additive — how many to ADD, not a new total. */
  grantQuota: (teacherId: string, courses: number, accessDurationDays: number, note?: string) =>
    api.post<ApiResponse>(`/Admin/teachers/${teacherId}/quota`, {
      courses, accessDurationDays, note: note?.trim() || null,
    }).then(r => r.data),

  revokeGrant: (grantId: string) =>
    api.delete<ApiResponse>(`/Admin/quota/${grantId}`).then(r => r.data),
}
