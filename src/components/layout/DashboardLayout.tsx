import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileSidebar from './MobileSidebar'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import ProfileCompletionBanner from '@/features/profile/components/ProfileCompletionBanner'

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const { sidebarCollapsed } = useUIStore()
    const { user } = useAuthStore()
    const completionPercent = user?.profile?.profileCompletionPercent ?? 0

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onMenuClick={() => setMobileOpen(true)} />

                {/* Profile completion banner */}
                {completionPercent < 100 && completionPercent > 0 && (
                    <ProfileCompletionBanner percent={completionPercent} />
                )}

                {/* Page content */}
                <motion.main
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-y-auto"
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    )
}
