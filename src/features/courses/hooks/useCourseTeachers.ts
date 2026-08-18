import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { courseService } from "../services/courseService"

/**
 * Teachers on one course, and the invitations still outstanding.
 *
 * A course has exactly one owner and any number of invited colleagues. Only the
 * owner can archive, delete or restore it; a co-teacher can do everything else,
 * including inviting further colleagues.
 */
export function useCourseTeachers(courseId: string, enabled = true) {
  const qc = useQueryClient()

  const teachersQuery = useQuery({
    queryKey: ["course-teachers", courseId],
    queryFn: async () => {
      const res = await courseService.getTeachers(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!courseId && enabled,
    staleTime: 30_000,
  })

  const invitationsQuery = useQuery({
    queryKey: ["course-invitations", courseId],
    queryFn: async () => {
      const res = await courseService.getCourseInvitations(courseId)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!courseId && enabled,
    staleTime: 15_000,
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["course-teachers", courseId] })
    qc.invalidateQueries({ queryKey: ["course-invitations", courseId] })
  }

  const inviteMutation = useMutation({
    mutationFn: ({ email, message }: { email: string; message?: string }) =>
      courseService.inviteTeacher(courseId, email, message),
    onSuccess: res => {
      if (res.success) { refresh(); toast.success(res.message ?? "Invitation sent.") }
      else toast.error(res.message)
    },
    onError: () => toast.error("Could not send the invitation."),
  })

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => courseService.revokeInvitation(courseId, invitationId),
    onSuccess: res => {
      if (res.success) { refresh(); toast.success("Invitation withdrawn.") }
      else toast.error(res.message)
    },
    onError: () => toast.error("Could not withdraw the invitation."),
  })

  const removeMutation = useMutation({
    mutationFn: (teacherId: string) => courseService.removeCoTeacher(courseId, teacherId),
    onSuccess: res => {
      if (res.success) {
        refresh()
        qc.invalidateQueries({ queryKey: ["courses", "mine"] })
        toast.success(res.message ?? "Teacher removed.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Could not remove that teacher."),
  })

  return {
    teachers:      teachersQuery.data ?? [],
    invitations:   invitationsQuery.data ?? [],
    isLoading:     teachersQuery.isLoading,
    invite:        inviteMutation.mutate,
    isInviting:    inviteMutation.isPending,
    revoke:        revokeMutation.mutate,
    removeTeacher: removeMutation.mutate,
  }
}

/** Co-teaching invitations addressed to the signed-in teacher. */
export function useMyCourseInvitations(enabled = true) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["my-course-invitations"],
    queryFn: async () => {
      const res = await courseService.getMyInvitations()
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  const respondMutation = useMutation({
    mutationFn: ({ invitationId, accept }: { invitationId: string; accept: boolean }) =>
      courseService.respondToInvitation(invitationId, accept),
    onSuccess: res => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["my-course-invitations"] })
        // Accepting adds a course, so the course list has to be refetched too.
        qc.invalidateQueries({ queryKey: ["courses", "mine"] })
        toast.success(res.message ?? "Done.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Could not answer the invitation."),
  })

  return {
    invitations:  query.data ?? [],
    isLoading:    query.isLoading,
    respond:      respondMutation.mutate,
    isResponding: respondMutation.isPending,
  }
}
