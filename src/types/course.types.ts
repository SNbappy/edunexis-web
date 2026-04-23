export type CourseType = "Theory" | "Lab"

/**
 * Viewer's relationship to a course.
 * - Owner: the teacher who created/owns the course
 * - Member: student enrolled or admin viewing
 * - None:   no relationship (backend should not return this; guarded server-side)
 */
export type CourseViewerRole = "Owner" | "Member" | "None"

/**
 * Full course details returned by /Courses/{id}.
 * `joiningCode` is null unless viewer is the course owner.
 */
export interface CourseDto {
  id:                      string
  title:                   string
  courseCode:              string
  creditHours:             number
  department:              string
  academicSession:         string
  semester:                string
  section:                 string | null
  courseType:              CourseType
  description:             string | null
  coverImageUrl:           string
  joiningCode:             string | null
  teacherId:               string
  teacherName:             string
  teacherProfilePhotoUrl:  string | null
  isArchived:              boolean
  memberCount:             number
  createdAt:               string
  viewerRole:              CourseViewerRole
}

/**
 * Compact course shape returned from /my-courses (enrolled array).
 */
export interface CourseSummaryDto {
  id:                      string
  title:                   string
  courseCode:              string
  department:              string
  academicSession:         string
  semester:                string
  courseType:              CourseType
  coverImageUrl:           string
  teacherName:             string
  teacherProfilePhotoUrl:  string | null
  isArchived:              boolean
  memberCount:             number
  createdAt:               string
}

/**
 * Pending join request from the student's perspective.
 */
export interface PendingCourseDto {
  id:                      string
  title:                   string
  courseCode:              string
  department:              string
  semester:                string
  courseType:              CourseType
  teacherName:             string
  teacherProfilePhotoUrl:  string | null
  requestId:               string
  requestedAt:             string
}

/**
 * Rejected join request — stays on student's list until dismissed.
 */
export interface RejectedCourseDto {
  id:                      string
  title:                   string
  courseCode:              string
  department:              string
  semester:                string
  courseType:              CourseType
  teacherName:             string
  teacherProfilePhotoUrl:  string | null
  requestId:               string
  requestedAt:             string
  reviewedAt:              string | null
}

/**
 * Combined shape returned by /Courses/my-courses.
 * Teachers never have pending/rejected populated.
 */
export interface MyCoursesDto {
  enrolled: CourseSummaryDto[]
  pending:  PendingCourseDto[]
  rejected: RejectedCourseDto[]
}

/**
 * Preview returned by /Courses/by-code/{code} for the Join flow.
 * Lightweight — just enough to show "You're about to request to join X".
 */
export interface CourseByCodeDto {
  id:                     string
  title:                  string
  courseCode:             string
  department:             string
  semester:               string
  courseType:             string
  teacherName:            string
  teacherProfilePhotoUrl: string | null
  memberCount:            number
}

export interface CourseMemberDto {
  userId:           string
  fullName:         string
  email:            string
  studentId:        string | null
  profilePhotoUrl:  string | null
  joinedAt:         string
  isCR:             boolean
  role?:            string
}

export interface CreateCourseRequest {
  title:           string
  courseCode:      string
  creditHours:     number
  department:      string
  academicSession: string
  year:            string
  semester:        string
  section?:        string
  courseType:      CourseType
  description?:    string
  coverImageUrl:   string
  teacherId:       string
}

export interface UpdateCourseRequest {
  title:           string
  courseCode:      string
  creditHours:     number
  department:      string
  academicSession: string
  year:            string
  semester:        string
  section?:        string
  courseType:      CourseType
  description?:    string
}

export interface JoinRequest {
  id:               string
  studentId:        string
  studentName:      string
  studentEmail:     string
  profilePhotoUrl:  string | null
  requestedAt:      string
  status:           "Pending" | "Approved" | "Rejected"
}
