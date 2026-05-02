// ----------------- API -----------------
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

// ----------------- App Info -----------------
export const APP_NAME        = "EduNexis"
export const APP_TAGLINE     = "Smart Academic Management"
export const APP_SUBTITLE    = "Academic Management Platform"
export const APP_UNIVERSITY  = "Jashore University of Science and Technology"
export const APP_VERSION     = "1.0.0"
export const APP_DESCRIPTION = "Streamline classroom management and automate academic workflows."

// ----------------- Auth -----------------
export const STUDENT_EMAIL_DOMAIN = "@student.just.edu.bd"
export const TEACHER_EMAIL_DOMAIN = "@just.edu.bd"
export const PASSWORD_MIN_LENGTH  = 8
export const OTP_LENGTH           = 6

// ----------------- Routes -----------------
export const ROUTES = {
  HOME:              "/",
  LOGIN:             "/login",
  REGISTER:          "/register",
  VERIFY_EMAIL:      "/verify-email",
  DASHBOARD:         "/dashboard",
  COURSES:           "/courses",
  COURSE_CREATE:     "/courses/create",
  COURSE_JOIN:       "/courses/join",
  PROFILE:           "/profile",
  PROFILE_EDIT:      "/profile/edit",
  PROFILE_COMPLETE:  "/profile/complete",
  COMPLETE_PROFILE:  "/profile/complete",
  NOTIFICATIONS:     "/notifications",
  SETTINGS:          "/settings",
  SETTINGS_SECURITY: "/settings/security",
  UNAUTHORIZED:      "/unauthorized",
  ASSIGNMENT_DETAIL: "/courses/:courseId/assignments/:assignmentId",
}

// ----------------- Course -----------------
export const COURSE_TABS = {
  STREAM:        "stream",
  ATTENDANCE:    "attendance",
  MATERIALS:     "materials",
  ASSIGNMENTS:   "assignments",
  CT:            "ct",
  PRESENTATIONS: "presentations",
  MARKS:         "marks",
  MEMBERS:       "members",
}

export const COURSE_TYPES = [
  "Theory",
  "Lab",
  "Project",
  "Thesis",
  "Sessional",
]

export const ACADEMIC_SESSIONS = [
  "2020-21", "2021-22", "2022-23", "2023-24", "2024-25",
  "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31",
]

// ----------------- Academic -----------------
export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical & Electronic Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
]

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

export const SEMESTERS = ["1st Semester", "2nd Semester"]

export const CREDIT_HOURS = [0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4]

export const BATCHES = [
  "2019-20", "2020-21", "2021-22",
  "2022-23", "2023-24", "2024-25",
]

// ----------------- Grading -----------------
export const GRADE_SCALE = [
  { min: 90, grade: "A+", label: "Outstanding",    gpa: 4.0  },
  { min: 85, grade: "A",  label: "Excellent",      gpa: 3.75 },
  { min: 80, grade: "A-", label: "Very Good",      gpa: 3.5  },
  { min: 75, grade: "B+", label: "Good",           gpa: 3.25 },
  { min: 70, grade: "B",  label: "Above Average",  gpa: 3.0  },
  { min: 65, grade: "B-", label: "Average",        gpa: 2.75 },
  { min: 60, grade: "C+", label: "Below Average",  gpa: 2.5  },
  { min: 55, grade: "C",  label: "Satisfactory",   gpa: 2.25 },
  { min: 50, grade: "D",  label: "Pass",           gpa: 2.0  },
  { min:  0, grade: "F",  label: "Fail",           gpa: 0.0  },
]

// ----------------- Attendance -----------------
export const ATTENDANCE_MIN_PERCENT  = 75
export const ATTENDANCE_WARN_PERCENT = 85

// ----------------- Files -----------------
export const MAX_FILE_SIZE_MB    = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ALLOWED_FILE_TYPES  = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "application/zip",
]

// ----------------- Pagination -----------------
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE     = 100

// ----------------- Misc -----------------
export const DEBOUNCE_MS       = 300
export const TOAST_DURATION_MS = 3500
export const POLL_INTERVAL_MS  = 30_000
