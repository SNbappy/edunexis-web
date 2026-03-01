import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 max-w-md"
            >
                <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                    <ShieldX className="w-10 h-10 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold gradient-text">403</h1>
                    <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground">You don't have permission to view this page.</p>
                </div>
                <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </motion.div>
        </div>
    )
}
