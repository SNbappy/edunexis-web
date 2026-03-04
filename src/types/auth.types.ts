export type UserRole = 'SuperAdmin' | 'Admin' | 'Teacher' | 'Student'

export interface UserProfileDto {
    id: string
    fullName: string
    department: string | null
    designation: string | null
    studentId: string | null
    bio: string | null
    profilePhotoUrl: string | null
    coverPhotoUrl: string | null
    phoneNumber: string | null
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

export interface PublicCourseDto {
    id: string
    title: string
    courseCode: string
    department: string
    semester: string
    courseType: string
}

export interface PublicProfileDto {
    userId: string
    fullName: string
    department: string | null
    designation: string | null
    studentId: string | null
    bio: string | null
    profilePhotoUrl: string | null
    coverPhotoUrl: string | null
    phoneNumber: string | null
    linkedInUrl: string | null
    facebookUrl: string | null
    twitterUrl: string | null
    gitHubUrl: string | null
    websiteUrl: string | null
    email: string
    role: UserRole
    education: UserEducationDto[]
    courses: PublicCourseDto[]
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
