import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: string
    trendUp?: boolean
    color?: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber'
    delay?: number
}

const colorMap = {
    indigo: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20 [&_.icon-bg]:bg-indigo-500/10 [&_.icon-color]:text-indigo-500',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 [&_.icon-bg]:bg-cyan-500/10 [&_.icon-color]:text-cyan-500',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 [&_.icon-bg]:bg-violet-500/10 [&_.icon-color]:text-violet-500',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 [&_.icon-bg]:bg-emerald-500/10 [&_.icon-color]:text-emerald-500',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 [&_.icon-bg]:bg-amber-500/10 [&_.icon-color]:text-amber-500',
}

export default function StatCard({ title, value, icon, trend, trendUp, color = 'indigo', delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={cn(
                'glass-card rounded-2xl p-5 bg-gradient-to-br border',
                colorMap[color]
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    {trend && (
                        <p className={cn('text-xs font-medium', trendUp ? 'text-success' : 'text-muted-foreground')}>
                            {trend}
                        </p>
                    )}
                </div>
                <div className="icon-bg p-3 rounded-xl">
                    <div className="icon-color">{icon}</div>
                </div>
            </div>
        </motion.div>
    )
}
