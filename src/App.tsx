import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import AuthGuard from "@/components/guards/AuthGuard"
import GuestGuard from "@/components/guards/GuestGuard"
import ProfileGuard from "@/components/guards/ProfileGuard"
import EnrollmentGuard from "@/components/guards/EnrollmentGuard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import AuthLayout from "@/components/layout/AuthLayout"
import BrandLoader from "@/components/ui/BrandLoader"
import { ROUTES } from "@/config/constants"

const LoginPage             = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage          = lazy(() => import("@/features/auth/pages/RegisterPage"))
const DashboardPage         = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const CoursesListPage       = lazy(() => import("@/features/courses/pages/CoursesListPage"))
const CreateCoursePage      = lazy(() => import("@/features/courses/pages/CreateCoursePage"))
const EditCoursePage        = lazy(() => import("@/features/courses/pages/EditCoursePage"))
const CourseDetailPage      = lazy(() => import("@/features/courses/pages/CourseDetailPage"))
const AssignmentDetailPage  = lazy(() => import("@/features/assignments/pages/AssignmentDetailPage"))
const JoinCoursePage        = lazy(() => import("@/features/courses/pages/JoinCoursePage"))
const CTEventPage           = lazy(() => import("@/features/ct/pages/CTEventPage"))
const PresentationEventPage = lazy(() => import("@/features/presentations/pages/PresentationEventPage"))
const CompleteProfilePage   = lazy(() => import("@/features/profile/pages/CompleteProfilePage"))
const EditProfilePage       = lazy(() => import("@/features/profile/pages/EditProfilePage"))
const NotificationsPage     = lazy(() => import("@/features/notifications/pages/NotificationsPage"))
const UserProfilePage       = lazy(() => import("@/features/profile/pages/UserProfilePage"))
const NotFoundPage          = lazy(() => import("@/pages/NotFoundPage"))
const UnauthorizedPage      = lazy(() => import("@/pages/UnauthorizedPage"))

export default function App() {
  return (
    <Suspense fallback={<BrandLoader variant="screen" />}>
      <Routes>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route path={ROUTES.PROFILE_COMPLETE} element={<CompleteProfilePage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<ProfileGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.COURSES}   element={<CoursesListPage />} />
              <Route path="/courses/join"           element={<JoinCoursePage />} />
              <Route path="/courses/create"         element={<CreateCoursePage />} />
              <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
              <Route path="/courses/:courseId/join" element={<JoinCoursePage />} />
              <Route path="/courses/:courseId"      element={<Navigate to="stream" replace />} />
              <Route path="/courses/:courseId/presentations/:presentationId"
                element={<EnrollmentGuard><PresentationEventPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/ct/:ctId"
                element={<EnrollmentGuard><CTEventPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/:tab"
                element={<EnrollmentGuard><CourseDetailPage /></EnrollmentGuard>} />
              <Route path="/courses/:courseId/assignments/:assignmentId"
                element={<EnrollmentGuard><AssignmentDetailPage /></EnrollmentGuard>} />
              <Route path={ROUTES.PROFILE}       element={<ProfilePage />} />
              <Route path={ROUTES.PROFILE_EDIT}  element={<EditProfilePage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
              <Route path="/users/:userId"        element={<UserProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path="*"                   element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

