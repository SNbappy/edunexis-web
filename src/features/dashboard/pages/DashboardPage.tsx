import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import WelcomeBanner from '../components/WelcomeBanner'
import QuickStatsRow from '../components/QuickStatsRow'
import UpcomingEventsWidget from '../components/UpcomingEventsWidget'
import RecentActivityWidget from '../components/RecentActivityWidget'
import PendingTasksWidget from '../components/PendingTasksWidget'
import CourseProgressWidget from '../components/CourseProgressWidget'
import { useDashboard } from '../hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { data, isLoading } = useDashboard()
    const teacher = isTeacher(user?.role ?? 'Student')

    if (!user) return null

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Welcome */}
            <WelcomeBanner user={user} />

            {/* Stats */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : data?.stats && (
                <QuickStatsRow stats={data.stats} />
            )}

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upcoming events */}
                    {isLoading ? (
                        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
                    ) : (
                        <UpcomingEventsWidget events={data?.upcomingEvents ?? []} />
                    )}

                    {/* Student: pending assignments */}
                    {!teacher && (
                        isLoading ? (
                            <div className="h-48 rounded-2xl bg-muted animate-pulse" />
                        ) : (
                            <PendingTasksWidget events={data?.upcomingEvents ?? []} />
                        )
                    )}

                    {/* Recent activity */}
                    {isLoading ? (
                        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
                    ) : (
                        <RecentActivityWidget activities={data?.recentActivity ?? []} />
                    )}
                </div>

                {/* Right column (1/3) */}
                <div className="space-y-6">
                    <CourseProgressWidget />
                </div>
            </div>
        </div>
    )
}
