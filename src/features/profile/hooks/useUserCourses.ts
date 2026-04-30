import { useQuery } from "@tanstack/react-query"
import { profileService } from "../services/profileService"

export function useUserCourses(
    userId: string | undefined,
    status?: "running" | "archived",
) {
    return useQuery({
        queryKey: ["user-courses", userId, status ?? "all"],
        queryFn: async () => {
            const res = await profileService.getUserCourses(userId!, status)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!userId,
        staleTime: 30_000,
    })
}