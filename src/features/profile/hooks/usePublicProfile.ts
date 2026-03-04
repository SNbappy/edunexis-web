import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/profileService'

export function usePublicProfile(userId: string | undefined) {
    return useQuery({
        queryKey: ['public-profile', userId],
        queryFn: async () => {
            const res = await profileService.getPublicProfile(userId!)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!userId,
    })
}
