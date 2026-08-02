import { useQuery } from "@tanstack/react-query"
import { courseService } from "../services/courseService"
import { useAuthStore } from "@/store/authStore"

/**
 * Returns the current teacher's course-creation quota status.
 * If no explicit grant exists yet, backend returns the implicit starter
 * quota (1 course, 100 year validity) which will be auto-provisioned on
 * first successful create.
 */
export function useMyQuota() {
  const { user } = useAuthStore()
  const isTeacher = user?.role === "Teacher" || user?.role === "SuperAdmin" || user?.role === "DepartmentAdmin"

  return useQuery({
    queryKey: ["quota", "mine", user?.id],
    queryFn: async () => {
      const res = await courseService.getMyQuota()
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
    enabled: !!user && isTeacher,
    staleTime: 30_000,
  })
}