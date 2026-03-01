import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import StudentGradeCard from './StudentGradeCard'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useGradebook } from '../hooks/useGradebook'

interface Props { courseId: string }

export default function MyGradesView({ courseId }: Props) {
    const { myGrades, isMyGradesLoading } = useGradebook(courseId)

    if (isMyGradesLoading) {
        return (
            <div className="space-y-4 max-w-2xl mx-auto">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-48" />
                <SkeletonCard className="h-36" />
            </div>
        )
    }

    if (!myGrades) {
        return (
            <EmptyState
                icon={<TrendingUp className="w-8 h-8" />}
                title="No grades yet"
                description="Your grades will appear here once your teacher starts grading"
            />
        )
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StudentGradeCard grades={myGrades} />
        </motion.div>
    )
}
