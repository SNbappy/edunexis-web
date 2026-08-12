import { useQuery } from "@tanstack/react-query"
import { courseService } from "../services/courseService"
import { useAuthStore } from "@/store/authStore"

/** Teacher's soft-deleted courses (Recently Deleted list). */
export function useDeletedCourses() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ["courses", "deleted", user?.id],
    queryFn: async () => {
      const res = await courseService.getDeletedCourses()
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!user,
    staleTime: 30_000,
  })
}