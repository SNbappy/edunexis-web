export const APP_NAME = 'EduNexis'
export const APP_TAGLINE = 'Smart Learning Platform'
export const APP_UNIVERSITY = 'JUST — Jessore University of Science & Technology'

export const TEACHER_EMAIL_DOMAIN = '@just.edu.bd'
export const STUDENT_EMAIL_DOMAIN = '@student.just.edu.bd'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5041/api'

export const PROFILE_COMPLETION_THRESHOLD = 60

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    COMPLETE_PROFILE: '/complete-profile',
    DASHBOARD: '/dashboard',
    COURSES: '/courses',
    COURSE_DETAIL: '/courses/:courseId',
    COURSE_TAB: '/courses/:courseId/:tab',
    PROFILE: '/profile',
    PUBLIC_PROFILE: '/users/:userId',
    EDIT_PROFILE: '/profile/edit',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '*',
} as const

export const COURSE_TABS = {
    STREAM: 'stream',
    ATTENDANCE: 'attendance',
    MATERIALS: 'materials',
    ASSIGNMENTS: 'assignments',
    CT: 'ct',
    PRESENTATIONS: 'presentations',
    MARKS: 'marks',
    MEMBERS: 'members',
} as const

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const DEPARTMENTS = [
    'CSE', 'EEE', 'ME', 'CE', 'IPE', 'TE', 'BME', 'MTE', 'FE', 'Other',
] as const

export const SEMESTERS = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester',
] as const

export const CREDIT_HOURS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6] as const
