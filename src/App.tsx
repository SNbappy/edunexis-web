import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import AuthGuard from "@/components/guards/AuthGuard"
import GuestGuard from "@/components/guards/GuestGuard"
import ProfileGuard from "@/components/guards/ProfileGuard"
import EnrollmentGuard from "@/components/guards/EnrollmentGuard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import PublicLayout from "@/components/layout/PublicLayout"
import RedirectIfAuthed from "@/components/guards/RedirectIfAuthed"
import AuthLayout from "@/components/layout/AuthLayout"
import BrandLoader from "@/components/ui/BrandLoader"
import { ROUTES } from "@/config/constants"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"))
const VerifyEmailPage = lazy(() => import("@/features/auth/pages/VerifyEmailPage"))
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const CoursesListPage = lazy(() => import("@/features/courses/pages/CoursesListPage"))
const CreateCoursePage = lazy(() => import("@/features/courses/pages/CreateCoursePage"))
const EditCoursePage = lazy(() => import("@/features/courses/pages/EditCoursePage"))
const CourseDetailPage = lazy(() => import("@/features/courses/pages/CourseDetailPage"))
const AssignmentDetailPage = lazy(() => import("@/features/assignments/pages/AssignmentDetailPage"))
const CreateAssignmentPage = lazy(() => import("@/features/assignments/pages/CreateAssignmentPage"))
const EditAssignmentPage = lazy(() => import("@/features/assignments/pages/EditAssignmentPage"))
const JoinCoursePage = lazy(() => import("@/features/courses/pages/JoinCoursePage"))
const CTEventPage = lazy(() => import("@/features/ct/pages/CTEventPage"))
const PresentationEventPage = lazy(() => import("@/features/presentations/pages/PresentationEventPage"))
const CompleteProfilePage = lazy(() => import("@/features/profile/pages/CompleteProfilePage"))
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const EditProfilePage = lazy(() => import("@/features/profile/pages/EditProfilePage"))
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"))
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"))
const UserProfilePage = lazy(() => import("@/features/profile/pages/UserProfilePage"))
const UserCoursesPage = lazy(() => import("@/features/profile/pages/UserCoursesPage"))
const HomePage = lazy(() => import("@/features/public/pages/HomePage"))
const FacultyDirectoryPage = lazy(() => import("@/features/public/pages/FacultyDirectoryPage"))
const AboutPage = lazy(() => import("@/features/public/pages/AboutPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"))

export default function App() {
  return (
    <Suspense fallback={<BrandLoader variant="page" />}>
      <Routes>
        {/* Public routes — visible to logged-out users; redirect to dashboard if logged in */}
        <Route element={<RedirectIfAuthed />}>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/faculty" element={<FacultyDirectoryPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Route>

        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route path={ROUTES.PROFILE_COMPLETE} element={<CompleteProfilePage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<ProfileGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.COURSES} element={<CoursesListPage />} />
              <Route path="/courses/join" element={<JoinCoursePage />} />
              <Route path="/courses/create" element={<CreateCoursePage />} />
              <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
              <Route path="/courses/:courseId/join" element={<JoinCoursePage />} />
              <Route path="/courses/:courseId" element={<Navigate to="stream" replace />} />
              <Route path="/courses/:courseId/presentations/:presentationId"
                element={<EnrollmentGuard><PresentationEventPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/ct/:ctId"
                element={<EnrollmentGuard><CTEventPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/:tab"
                element={<EnrollmentGuard><CourseDetailPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/assignments/new"
                element={<EnrollmentGuard><CreateAssignmentPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/assignments/:assignmentId/edit"
                element={<EnrollmentGuard><EditAssignmentPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/assignments/:assignmentId"
                element={<EnrollmentGuard><AssignmentDetailPage /></EnrollmentGuard>} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage isOwnProfile />} />
              <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
              <Route path="/users/:userId" element={<UserProfilePage />} />
              <Route path="/users/:userId/courses" element={<UserCoursesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}