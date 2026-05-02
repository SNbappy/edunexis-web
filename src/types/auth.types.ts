export type UserRole = "SuperAdmin" | "Admin" | "Teacher" | "Student"

export type ProfileViewerRelation = "Self" | "CourseMate" | "Stranger"

export type PublicationType =
  | "Journal"
  | "Conference"
  | "Thesis"
  | "Workshop"
  | "BookChapter"
  | "Other"

export interface UserProfileDto {
  id: string
  fullName: string
  department: string | null
  designation: string | null
  studentId: string | null
  bio: string | null
  headline: string | null
  profilePhotoUrl: string | null
  coverPhotoUrl: string | null
  phoneNumber: string | null
  officeLocation: string | null
  officeHours: string | null
  researchInterestsCsv: string | null
  fieldsOfWorkCsv: string | null
  linkedInUrl: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  gitHubUrl: string | null
  websiteUrl: string | null
  profileCompletionPercent: number
}

export interface UserEducationDto {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: number
  endYear: number | null
  description: string | null
}

export interface UserPublicationDto {
  id: string
  title: string
  authors: string
  venue: string | null
  year: number
  url: string | null
  type: PublicationType
  orderIndex: number
}

export interface PublicCourseDto {
  id: string
  title: string
  courseCode: string
  department: string
  semester: string
  courseType: string
  isArchived: boolean
}

export interface UserCoursesDto {
  running: PublicCourseDto[]
  archived: PublicCourseDto[]
}

/**
 * Profile viewed by another user.
 *
 * Contact fields (email, phoneNumber, studentId) are ONLY present when
 * viewerRelation is "Self" or "CourseMate". They are null for "Stranger".
 *
 * Teacher-only fields (officeLocation, officeHours, researchInterestsCsv,
 * fieldsOfWorkCsv) are null for student profiles.
 *
 * `courses` is a preview list (max 6). For the full split list, call
 * `getUserCourses(userId)` which returns running + archived.
 */
export interface PublicProfileDto {
  userId: string
  fullName: string
  department: string | null
  designation: string | null
  studentId: string | null
  bio: string | null
  headline: string | null
  profilePhotoUrl: string | null
  coverPhotoUrl: string | null
  phoneNumber: string | null
  officeLocation: string | null
  officeHours: string | null
  researchInterestsCsv: string | null
  fieldsOfWorkCsv: string | null
  linkedInUrl: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  gitHubUrl: string | null
  websiteUrl: string | null
  email: string | null
  role: UserRole
  education: UserEducationDto[]
  publications: UserPublicationDto[]
  courses: PublicCourseDto[]
  runningCoursesCount: number
  archivedCoursesCount: number
  viewerRelation: ProfileViewerRelation
}

export interface UserDto {
  id: string
  email: string
  role: UserRole
  isProfileComplete: boolean
  profile: UserProfileDto | null
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserDto
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface SyncUserRequest {
  email: string
  fullName: string
}
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword:     string
}
export interface VerifyEmailOtpRequest {
  email: string
  otp:   string
}

export interface ResendOtpRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token:       string
  newPassword: string
}
