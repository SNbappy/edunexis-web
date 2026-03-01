import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/config/constants'

interface Props {
    percent: number
}

export default function ProfileCompletionBanner({ percent }: Props) {
    if (percent >= 100) return null
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4"
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Complete your profile</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Your profile is {percent}% complete. Add more details to unlock all features.
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-warning"
                        />
                    </div>
                </div>
                <Link
                    to={ROUTES.EDIT_PROFILE}
                    className="flex items-center gap-1 text-xs font-medium text-warning hover:underline shrink-0"
                >
                    Edit <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </motion.div>
    )
}
