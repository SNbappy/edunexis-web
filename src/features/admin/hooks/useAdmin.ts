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
    mutationFn: ({ teacherId, totalQuota, accessDurationDays }: {
      teacherId: string; totalQuota: number; accessDurationDays: number
    }) => adminService.grantQuota(teacherId, totalQuota, accessDurationDays),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['admin', 'teachers'] })
        toast.success(res.message)
      } else toast.error(res.message)
    },
    onError: () => toast.error('Failed to update quota.'),
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
  }
}