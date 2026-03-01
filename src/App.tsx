import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ROUTES } from '@/config/constants'
import GuestGuard from '@/components/guards/GuestGuard'
import AuthGuard from '@/components/guards/AuthGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Spinner from '@/components/ui/Spinner'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const CompleteProfilePage = lazy(() => import('@/features/profile/pages/CompleteProfilePage'))
const EditProfilePage = lazy(() => import('@/features/profile/pages/EditProfilePage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const CoursesListPage = lazy(() => import('@/features/courses/pages/CoursesListPage'))
const CourseDetailPage = lazy(() => import('@/features/courses/pages/CourseDetailPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner size="lg" className="text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* Guest only */}
        <Route path={ROUTES.LOGIN} element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path={ROUTES.REGISTER} element={<GuestGuard><RegisterPage /></GuestGuard>} />

        {/* Profile completion */}
        <Route path={ROUTES.COMPLETE_PROFILE} element={<AuthGuard><CompleteProfilePage /></AuthGuard>} />

        {/* Dashboard layout */}
        <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path="/profile" element={<EditProfilePage />} />
          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
          <Route path={ROUTES.COURSES} element={<CoursesListPage />} />
          <Route path="/courses/:courseId" element={<Navigate to="stream" replace />} />
          <Route path="/courses/:courseId/:tab" element={<CourseDetailPage />} />
          <Route path="/notifications" element={
            <div className="p-6 space-y-2">
              <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
              <p className="text-muted-foreground">Coming in next phase!</p>
            </div>
          } />
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
