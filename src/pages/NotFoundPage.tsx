import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/config/constants'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 max-w-md"
            >
                <div className="text-8xl">🎓</div>
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold gradient-text">404</h1>
                    <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
                    <p className="text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
                <Link to={ROUTES.DASHBOARD}>
                    <Button leftIcon={<Home className="w-4 h-4" />}>Go to Dashboard</Button>
                </Link>
            </motion.div>
        </div>
    )
}
