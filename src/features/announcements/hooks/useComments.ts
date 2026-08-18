import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { announcementService } from "../services/announcementService"
import type { CommentDto } from "@/types/announcement.types"

/**
 * Class comments for every announcement in a course.
 *
 * Loaded once per course and grouped client-side, so a stream with thirty
 * announcements makes one request instead of thirty. Each card then reads its
 * own thread out of the map.
 */
export function useComments(courseId: string) {
  const qc = useQueryClient()
  const key = ["course-comments", courseId]

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => announcementService.getComments(courseId),
    enabled: !!courseId,
    select: res => res.data ?? [],
  })

  const comments = (data ?? []) as CommentDto[]

  const byAnnouncement = comments.reduce<Record<string, CommentDto[]>>((acc, c) => {
    (acc[c.announcementId] ??= []).push(c)
    return acc
  }, {})

  const { mutate: addComment, isPending: isAdding } = useMutation({
    mutationFn: ({ announcementId, content, parentCommentId }: {
      announcementId: string; content: string; parentCommentId?: string
    }) =>
      announcementService.addComment(courseId, announcementId, content, parentCommentId),
    onSuccess: res => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: key })
      } else {
        toast.error(res.message ?? "Could not post the comment.")
      }
    },
    onError: () => toast.error("Could not post the comment."),
  })

  const { mutate: editComment } = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      announcementService.editComment(courseId, commentId, content),
    onSuccess: res => {
      if (res.success) qc.invalidateQueries({ queryKey: key })
      else toast.error(res.message ?? "Could not update the comment.")
    },
    onError: () => toast.error("Could not update the comment."),
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => announcementService.deleteComment(courseId, commentId),
    onSuccess: res => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: key })
      } else {
        toast.error(res.message ?? "Could not delete the comment.")
      }
    },
    onError: () => toast.error("Could not delete the comment."),
  })

  return { byAnnouncement, isLoading, addComment, isAdding, editComment, deleteComment }
}
