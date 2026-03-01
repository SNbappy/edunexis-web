import { motion } from 'framer-motion'
import { Sparkles, Sun, Moon, Coffee } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import type { UserDto } from '@/types/auth.types'

interface Props { user: UserDto }

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good morning', icon: <Coffee className="w-5 h-5" /> }
    if (h < 17) return { text: 'Good afternoon', icon: <Sun className="w-5 h-5" /> }
    return { text: 'Good evening', icon: <Moon className="w-5 h-5" /> }
}

export default function WelcomeBanner({ user }: Props) {
    const { text, icon } = getGreeting()
    const firstName = user.profile?.fullName?.split(' ')[0] ?? 'there'

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative glass-card rounded-2xl p-6 overflow-hidden"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 gradient-primary opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={user.profile?.profilePhotoUrl}
                        name={user.profile?.fullName}
                        size="lg"
                        className="ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
                    />
                    <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            {icon}
                            <span className="text-sm">{text}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {firstName}! <span className="inline-flex items-center gap-1">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {user.role === 'Teacher'
                                ? 'Ready to inspire your students today?'
                                : 'Stay on top of your academics today.'}
                        </p>
                    </div>
                </div>

                {/* Quick date/time */}
                <div className="text-right">
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
