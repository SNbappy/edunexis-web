import { Routes, Route, Navigate } from 'react-router-dom'

// Guards
import AuthGuard from '@/components/guards/AuthGuard'
import GuestGuard from '@/components/guards/GuestGuard'
import ProfileGuard from '@/components/guards/ProfileGuard'

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout'

// Auth pages
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'

// Dashboard
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

// Courses
import CoursesListPage from '@/features/courses/pages/CoursesListPage'
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage'

// Profile
import CompleteProfilePage from '@/features/profile/pages/CompleteProfilePage'
import EditProfilePage from '@/features/profile/pages/EditProfilePage'

// Misc
import NotFoundPage from '@/pages/NotFoundPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

import { ROUTES } from '@/config/constants'

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* Guest-only */}
      <Route element={<GuestGuard />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Profile completion — auth required, no profile check */}
      <Route element={<AuthGuard />}>
        <Route path={ROUTES.PROFILE_COMPLETE} element={<CompleteProfilePage />} />
      </Route>

      {/* Main app — auth + profile required */}
      <Route element={<AuthGuard />}>
        <Route element={<ProfileGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.COURSES} element={<CoursesListPage />} />
            <Route path="/courses/:courseId" element={<Navigate to="stream" replace />} />
            <Route path="/courses/:courseId/:tab" element={<CourseDetailPage />} />
            <Route path={ROUTES.PROFILE} element={<EditProfilePage />} />
            <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* Misc */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
