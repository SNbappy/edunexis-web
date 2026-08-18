import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { assignmentService } from "../services/assignmentService"
import type { CommentDto } from "@/types/announcement.types"

/** Class comments for one assignment. */
export function useAssignmentComments(courseId: string, assignmentId: string) {
  const qc = useQueryClient()
  const key = ["assignment-comments", courseId, assignmentId]

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => assignmentService.getComments(courseId, assignmentId),
    enabled: !!courseId && !!assignmentId,
    select: res => res.data ?? [],
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: key })

  const { mutate: addComment, isPending: isAdding } = useMutation({
    mutationFn: ({ content, parentCommentId }: {
      announcementId: string; content: string; parentCommentId?: string
    }) =>
      assignmentService.addComment(courseId, assignmentId, content, parentCommentId),
    onSuccess: res => {
      if (res.success) invalidate()
      else toast.error(res.message ?? "Could not post the comment.")
    },
    onError: () => toast.error("Could not post the comment."),
  })

  const { mutate: editComment } = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      assignmentService.editComment(courseId, commentId, content),
    onSuccess: res => {
      if (res.success) invalidate()
      else toast.error(res.message ?? "Could not update the comment.")
    },
    onError: () => toast.error("Could not update the comment."),
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => assignmentService.deleteComment(courseId, commentId),
    onSuccess: res => {
      if (res.success) invalidate()
      else toast.error(res.message ?? "Could not delete the comment.")
    },
    onError: () => toast.error("Could not delete the comment."),
  })

  return {
    comments: (data ?? []) as CommentDto[],
    isLoading,
    addComment, isAdding,
    editComment,
    deleteComment,
  }
}
