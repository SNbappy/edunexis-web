import axios from "axios"
import type { ApiResponse } from "@/types/api.types"
import type {
  PublicFacultyCardDto,
  PublicFacultyProfileDto,
  PublicStatsDto,
} from "@/types/auth.types"

/**
 * Dedicated axios instance with NO auth header. Public endpoints don't need
 * tokens, and sending one would unnecessarily leak it to non-auth routes.
 */
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

export const publicService = {
  getFaculty: (department?: string, page = 1, pageSize = 24) => {
    const params = new URLSearchParams()
    if (department) params.set("department", department)
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    return publicApi
      .get<ApiResponse<PublicFacultyCardDto[]>>(`/public/faculty?${params.toString()}`)
      .then(r => r.data)
  },

  getFacultyBySlug: (slug: string) =>
    publicApi
      .get<ApiResponse<PublicFacultyProfileDto>>(`/public/faculty/${slug}`)
      .then(r => r.data),

  getDepartments: () =>
    publicApi
      .get<ApiResponse<string[]>>("/public/departments")
      .then(r => r.data),

  getStats: () =>
    publicApi
      .get<ApiResponse<PublicStatsDto>>("/public/stats")
      .then(r => r.data),
}