import type { UserRole } from '@/types/auth.types'

export function isTeacher(role: UserRole): boolean { return role === 'Teacher' || role === 'Admin' || role === 'SuperAdmin' }
export function isStudent(role: UserRole): boolean { return role === 'Student' }
export function isAdmin(role: UserRole): boolean { return role === 'Admin' || role === 'SuperAdmin' }
export function isSuperAdmin(role: UserRole): boolean { return role === 'SuperAdmin' }
export function canCreateCourse(role: UserRole): boolean { return isTeacher(role) }
export function canJoinCourse(role: UserRole): boolean { return isStudent(role) }
export function getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
        SuperAdmin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        Teacher: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        Student: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    }
    return colors[role]
}
