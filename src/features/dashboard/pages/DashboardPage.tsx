import WelcomeBanner from '../components/WelcomeBanner'
import QuickStatsRow from '../components/QuickStatsRow'
import RecentActivityWidget from '../components/RecentActivityWidget'
import CourseProgressWidget from '../components/CourseProgressWidget'
import { useDashboard } from '../hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { data, isLoading } = useDashboard()

    if (!user) return null

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <WelcomeBanner user={user} />

            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <QuickStatsRow stats={data.stats} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
                    ) : (
                        <RecentActivityWidget activities={data.recentActivity} />
                    )}
                </div>
                <div className="space-y-6">
                    {/* CourseProgressWidget has its own useCourses() — no props needed */}
                    <CourseProgressWidget />
                </div>
            </div>
        </div>
    )
}
