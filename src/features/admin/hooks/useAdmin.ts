import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../services/adminService'
import toast from 'react-hot-toast'

export function useAdmin() {
  const qc = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await adminService.getSettings()
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
    staleTime: 10_000,
  })

  const teachersQuery = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: async () => {
      const res = await adminService.getTeachers()
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    staleTime: 10_000,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (courseQuotaEnforced: boolean) => adminService.updateSettings(courseQuotaEnforced),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
        toast.success(res.message)
      } else toast.error(res.message)
    },
    onError: () => toast.error('Failed to update settings.'),
  })

  const grantQuotaMutation = useMutation({
    mutationFn: ({ teacherId, courses, accessDurationDays, note }: {
      teacherId: string; courses: number; accessDurationDays: number; note?: string
    }) => adminService.grantQuota(teacherId, courses, accessDurationDays, note),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['admin', 'teachers'] })
        qc.invalidateQueries({ queryKey: ['admin', 'grants', vars.teacherId] })
        toast.success(res.message)
      } else toast.error(res.message)
    },
    onError: () => toast.error('Failed to grant quota.'),
  })

  const revokeGrantMutation = useMutation({
    mutationFn: ({ grantId }: { grantId: string; teacherId: string }) =>
      adminService.revokeGrant(grantId),
    onSuccess: (res, vars) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['admin', 'teachers'] })
        qc.invalidateQueries({ queryKey: ['admin', 'grants', vars.teacherId] })
        toast.success(res.message)
      } else toast.error(res.message)
    },
    onError: () => toast.error('Failed to revoke grant.'),
  })

  return {
    settings: settingsQuery.data,
    isSettingsLoading: settingsQuery.isLoading,
    teachers: teachersQuery.data ?? [],
    isTeachersLoading: teachersQuery.isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdatingSettings: updateSettingsMutation.isPending,
    grantQuota: grantQuotaMutation.mutate,
    isGrantingQuota: grantQuotaMutation.isPending,
    revokeGrant: revokeGrantMutation.mutate,
    isRevokingGrant: revokeGrantMutation.isPending,
  }
}

/** Grant history for one teacher. Only fetched while the drawer is open. */
export function useTeacherGrants(teacherId: string | null) {
  return useQuery({
    queryKey: ['admin', 'grants', teacherId],
    queryFn: async () => {
      const res = await adminService.getTeacherGrants(teacherId!)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!teacherId,
    staleTime: 5_000,
  })
}
