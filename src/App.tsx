import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import AuthGuard from "@/components/guards/AuthGuard"
import GuestGuard from "@/components/guards/GuestGuard"
import ProfileGuard from "@/components/guards/ProfileGuard"
import EnrollmentGuard from "@/components/guards/EnrollmentGuard"
import DashboardLayout from "@/components/layout/DashboardLayout"
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

function PageLoader() {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem("edunexis-theme") ?? "{}") }
    catch { return {} }
  })()
  const dark = stored?.state?.dark ?? true

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: dark ? "rgb(11,17,32)" : "rgb(248,249,255)" }}>
      <div className="flex flex-col items-center gap-5">

        {/* Animated logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-2xl animate-ping opacity-15"
            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", animationDuration: "1.6s" }} />
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", boxShadow: "0 8px 32px rgba(99,102,241,0.45)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <p className="text-[20px] font-extrabold tracking-tight"
            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EduNexis
          </p>
          <p className="text-[11px] font-semibold mt-0.5 tracking-widest uppercase"
            style={{ color: dark ? "#4a6090" : "#9ca3af" }}>
            Learning Platform
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#6366f1",
                  animation: `edunexisBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
                }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes edunexisBounce {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40%            { transform: scale(1.1);  opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
              <Route path={ROUTES.PROFILE}       element={<EditProfilePage />} />
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
