import type { NotificationDto } from "@/types/notification.types"

/**
 * Dashboard-specific view of a notification, flattened for the activity feed.
 * Kept separate from NotificationDto so the dashboard can evolve its own
 * presentation without changing the underlying notification type.
 */
export interface RecentActivityDto {
  id:          string
  type:        string
  title:       string
  description: string
  courseName:  string
  courseId:    string
  createdAt:   string
  link?:       string
}

const notificationTypeMap: Record<string, string> = {
  NewAnnouncement:            "announcement",
  NewAssignment:              "assignment",
  AssignmentDeadlineReminder: "assignment",
  MarksPublished:             "course",
  JoinRequestReceived:        "member",
  CourseJoinApproved:         "member",
  CourseJoinRejected:         "member",
  NewMaterial:                "material",
  GradeComplaint:             "course",
  General:                    "course",
}

export function mapNotificationToActivity(n: NotificationDto): RecentActivityDto {
  return {
    id:          n.id,
    type:        notificationTypeMap[n.type] ?? "course",
    title:       n.title,
    description: n.body,
    courseName:  "",
    courseId:    "",
    createdAt:   n.createdAt,
    link:        n.redirectUrl ?? undefined,
  }
}
