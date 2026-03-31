import { Routes, Route, Navigate } from 'react-router-dom'

import AuthGuard from '@/components/guards/AuthGuard'
import GuestGuard from '@/components/guards/GuestGuard'
import ProfileGuard from '@/components/guards/ProfileGuard'
import EnrollmentGuard from '@/components/guards/EnrollmentGuard'

import DashboardLayout from '@/components/layout/DashboardLayout'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'

import DashboardPage from '@/features/dashboard/pages/DashboardPage'

import CoursesListPage from '@/features/courses/pages/CoursesListPage'
import CreateCoursePage from '@/features/courses/pages/CreateCoursePage'
import EditCoursePage from '@/features/courses/pages/EditCoursePage'
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage'
import AssignmentDetailPage from '@/features/assignments/pages/AssignmentDetailPage'
import JoinCoursePage from '@/features/courses/pages/JoinCoursePage'
import CTEventPage from '@/features/ct/pages/CTEventPage'
import PresentationEventPage from '@/features/presentations/pages/PresentationEventPage'

import CompleteProfilePage from '@/features/profile/pages/CompleteProfilePage'
import EditProfilePage from '@/features/profile/pages/EditProfilePage'
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'
import UserProfilePage from '@/features/profile/pages/UserProfilePage'

import NotFoundPage from '@/pages/NotFoundPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

import { ROUTES } from '@/config/constants'

export default function App() {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      <Route element={<GuestGuard />}>
        <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route path={ROUTES.PROFILE_COMPLETE} element={<CompleteProfilePage />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route element={<ProfileGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.COURSES}   element={<CoursesListPage />} />
            <Route path="/courses/join" element={<JoinCoursePage />} />
            <Route path="/courses/create" element={<CreateCoursePage />} />
            <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />

            <Route path="/courses/:courseId/join" element={<JoinCoursePage />} />
            <Route path="/courses/:courseId"      element={<Navigate to="stream" replace />} />

            <Route
              path="/courses/:courseId/presentations/:presentationId"
              element={
                <EnrollmentGuard>
                  <PresentationEventPage />
                </EnrollmentGuard>
              }
            />

            <Route
              path="/courses/:courseId/ct/:ctId"
              element={
                <EnrollmentGuard>
                  <CTEventPage />
                </EnrollmentGuard>
              }
            />

            <Route
              path="/courses/:courseId/:tab"
              element={
                <EnrollmentGuard>
                  <CourseDetailPage />
                </EnrollmentGuard>
              }
            />

            <Route
              path="/courses/:courseId/assignments/:assignmentId"
              element={
                <EnrollmentGuard>
                  <AssignmentDetailPage />
                </EnrollmentGuard>
              }
            />

            <Route path={ROUTES.PROFILE}      element={<EditProfilePage />} />
            <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*"                   element={<NotFoundPage />} />
    </Routes>
  )
}




