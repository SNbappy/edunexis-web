import { useAuthStore } from '@/store/authStore'
import TeacherDashboard from '../components/TeacherDashboard'
import StudentDashboard from '../components/StudentDashboard'
import { isTeacher } from '@/utils/roleGuard'

export default function DashboardPage() {
    const { user } = useAuthStore()
    return isTeacher(user?.role ?? 'Student')
        ? <TeacherDashboard />
        : <StudentDashboard />
}
