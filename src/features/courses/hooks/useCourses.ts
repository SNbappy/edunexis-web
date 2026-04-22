import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { courseService } from "../services/courseService"
import { useAuthStore } from "@/store/authStore"
import type { CreateCourseRequest } from "@/types/course.types"
import toast from "react-hot-toast"

export function useCourses() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const myCoursesQuery = useQuery({
    queryKey: ["courses", "mine", user?.id],
    queryFn: async () => {
      const res = await courseService.getMyCourses()
      if (!res.success) throw new Error(res.message)
      return res.data ?? { enrolled: [], pending: [], rejected: [] }
    },
    enabled: !!user,
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCourseRequest) => courseService.create(data),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        toast.success("Course created successfully.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Failed to create course."),
  })

  const joinMutation = useMutation({
    mutationFn: ({ courseId, code }: { courseId: string; code: string }) =>
      courseService.requestJoin(courseId, code),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        toast.success("Join request sent. Waiting for teacher approval.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Failed to send join request."),
  })

  const dismissRequestMutation = useMutation({
    mutationFn: (requestId: string) => courseService.dismissJoinRequest(requestId),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
      } else toast.error(res.message)
    },
    onError: () => toast.error("Failed to dismiss."),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => courseService.archiveCourse(id),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        toast.success("Course archived.")
      } else toast.error(res.message)
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => courseService.unarchiveCourse(id),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        toast.success("Course restored.")
      } else toast.error(res.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        toast.success("Course deleted.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Failed to delete course."),
  })

  const data = myCoursesQuery.data ?? { enrolled: [], pending: [], rejected: [] }

  return {
    // data
    enrolled:  data.enrolled,
    pending:   data.pending,
    rejected:  data.rejected,
    /** @deprecated use `enrolled` instead — kept during migration */
    courses:   data.enrolled,

    // states
    isLoading: myCoursesQuery.isLoading,
    isError:   myCoursesQuery.isError,

    // mutations
    createCourse:   createMutation.mutate,
    isCreating:     createMutation.isPending,
    requestJoin:    joinMutation.mutate,
    isJoining:      joinMutation.isPending,
    dismissRequest: dismissRequestMutation.mutate,
    isDismissing:   dismissRequestMutation.isPending,
    archiveCourse:  archiveMutation.mutate,
    isArchiving:    archiveMutation.isPending,
    unarchiveCourse: unarchiveMutation.mutate,
    isUnarchiving:   unarchiveMutation.isPending,
    deleteCourse:    deleteMutation.mutate,
    isDeleting:      deleteMutation.isPending,
  }
}
