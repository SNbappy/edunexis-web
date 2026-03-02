import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courseService } from '../services/courseService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function JoinCoursePage() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    const handleJoin = async () => {
        if (!code.trim()) return toast.error('Enter a joining code')
        setLoading(true)
        try {
            const res = await courseService.join(courseId!, code.trim())
            if (res.success) {
                toast.success('Request sent! Awaiting teacher approval.')
                navigate('/courses', { replace: true })
            } else {
                toast.error(res.message ?? 'Failed to join.')
            }
        } catch {
            toast.error('Invalid joining code or request failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm space-y-5 shadow-lg">
                <div className="text-center">
                    <div className="text-4xl mb-3">??</div>
                    <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        You are not enrolled in this course. Enter the joining code to request access.
                    </p>
                </div>
                <Input
                    placeholder="Enter joining code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => navigate('/courses')}>
                        Back
                    </Button>
                    <Button className="flex-1" onClick={handleJoin} isLoading={loading}>
                        Join Course
                    </Button>
                </div>
            </div>
        </div>
    )
}
