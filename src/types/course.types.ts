export type CourseType = 'Theory' | 'Lab'

export interface CourseDto {
    id: string
    title: string
    courseCode: string
    creditHours: number
    department: string
    academicSession: string
    semester: string
    section: string | null
    courseType: CourseType
    description: string | null
    coverImageUrl: string
    joiningCode: string
    teacherId: string
    teacherName: string
    isArchived: boolean
    memberCount: number
    createdAt: string
}

export interface CourseMemberDto {
    userId: string
    fullName: string
    email: string
    studentId: string | null
    profilePhotoUrl: string | null
    joinedAt: string
    isCR: boolean
    role?: string
    role?: string
}

export interface CreateCourseRequest {
    title: string
    courseCode: string
    creditHours: number
    department: string
    academicSession: string
    semester: string
    section?: string
    courseType: CourseType
    description?: string
    coverImageUrl: string
    teacherId: string
}

export interface UpdateCourseRequest {
    title: string
    courseCode: string
    creditHours: number
    department: string
    academicSession: string
    semester: string
    section?: string
    courseType: CourseType
    description?: string
}

export interface JoinRequest {
    id: string
    studentId: string
    studentName: string
    studentEmail: string
    profilePhotoUrl: string | null
    requestedAt: string
    status: 'Pending' | 'Approved' | 'Rejected'
}


