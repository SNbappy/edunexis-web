import { useParams, Navigate } from 'react-router-dom'
import { useCourseAccess } from '@/hooks/useCourseAccess'
import Spinner from '@/components/ui/Spinner'

export default function EnrollmentGuard({ children }: { children: React.ReactNode }) {
    const { courseId } = useParams<{ courseId: string }>()
    const { status } = useCourseAccess(courseId!)

    if (status === 'loading') return (
        <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" className="text-primary" />
        </div>
    )
    if (status === 'not-found')    return <Navigate to="/404" replace />
    if (status === 'not-enrolled') return <Navigate to={`/courses/${courseId}/join`} replace />
    if (status === 'error')        return <Navigate to="/dashboard" replace />

    return <>{children}</>
}
