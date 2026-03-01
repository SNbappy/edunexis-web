import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { useAuthStore } from '@/store/authStore'

export function useDashboard() {
    const { user } = useAuthStore()

    return useQuery({
        queryKey: ['dashboard', user?.id],
        queryFn: async () => {
            const res = await dashboardService.getDashboard()
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!user,
        staleTime: 60_000,
        refetchInterval: 120_000,
    })
}
