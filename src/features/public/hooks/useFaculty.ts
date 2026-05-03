import { useQuery } from "@tanstack/react-query"
import { publicService } from "../services/publicService"

export function useFacultyList(department?: string) {
  return useQuery({
    queryKey: ["public-faculty", department ?? "all"],
    queryFn: async () => {
      const res = await publicService.getFaculty(department, 1, 60)
      return res.data ?? []
    },
    staleTime: 60_000,
  })
}

export function useFacultyDepartments() {
  return useQuery({
    queryKey: ["public-departments"],
    queryFn: async () => {
      const res = await publicService.getDepartments()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })
}

export function useFacultyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-faculty-detail", slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await publicService.getFacultyBySlug(slug)
      return res.success ? res.data : null
    },
    enabled: !!slug,
    staleTime: 60_000,
  })
}