import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <div className="text-8xl font-black text-primary/20 leading-none select-none">404</div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
                    <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
                </div>
                <div className="flex items-center gap-3 justify-center">
                    <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                    <Link to="/dashboard">
                        <Button leftIcon={<Home className="w-4 h-4" />}>Dashboard</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
