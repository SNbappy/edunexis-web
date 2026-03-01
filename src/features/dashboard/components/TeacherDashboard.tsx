import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Users, ClipboardList, Plus, ArrowRight, GraduationCap, BookMarked } from 'lucide-react'
import StatCard from './StatCard'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

export default function TeacherDashboard() {
    const { user } = useAuthStore()

    return (
        <div className="p-6 space-y-8">
            {/* Welcome header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">
                    Good day, <span className="gradient-text">{user?.profile?.fullName?.split(' ')[0]} 👋</span>
                </h1>
                <p className="text-muted-foreground">Here's what's happening in your courses today.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="My Courses" value="—" icon={<BookOpen className="w-5 h-5" />} color="indigo" delay={0.05} />
                <StatCard title="Total Students" value="—" icon={<Users className="w-5 h-5" />} color="cyan" delay={0.1} />
                <StatCard title="Assignments" value="—" icon={<ClipboardList className="w-5 h-5" />} color="violet" delay={0.15} />
                <StatCard title="Pending Grades" value="—" icon={<BookMarked className="w-5 h-5" />} color="amber" delay={0.2} />
            </div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: <Plus className="w-5 h-5" />, label: 'Create Course', desc: 'Start a new course for students', to: ROUTES.COURSES, color: 'from-indigo-600 to-violet-600' },
                        { icon: <ClipboardList className="w-5 h-5" />, label: 'My Courses', desc: 'Manage your active courses', to: ROUTES.COURSES, color: 'from-cyan-600 to-blue-600' },
                        { icon: <GraduationCap className="w-5 h-5" />, label: 'My Profile', desc: 'Update your teacher profile', to: ROUTES.PROFILE, color: 'from-violet-600 to-purple-600' },
                    ].map((action, i) => (
                        <motion.div key={action.label} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                            <Link to={action.to} className="block glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <p className="font-semibold text-foreground">{action.label}</p>
                                <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                                <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Courses placeholder */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
                    <Link to={ROUTES.COURSES} className="text-sm text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                <div className="glass-card rounded-2xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No courses yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Create your first course to get started</p>
                    <Link to={ROUTES.COURSES}>
                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Create Course</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
