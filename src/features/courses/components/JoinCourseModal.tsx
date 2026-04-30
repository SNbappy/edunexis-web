import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { CourseDto } from '@/types/course.types'

interface Props {
    course: CourseDto | null
    isOpen: boolean
    onClose: () => void
    onSubmit: (courseId: string, code: string) => void
    isLoading?: boolean
}

export default function JoinCourseModal({ course, isOpen, onClose, onSubmit, isLoading }: Props) {
    const [code, setCode] = useState('')

    const handleClose = () => { setCode(''); onClose() }

    const handleSubmit = () => {
        if (!code.trim() || !course) return
        onSubmit(course.id, code.trim().toUpperCase())
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join course" description={course?.title ?? ''} size="sm">
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="text-sm font-semibold text-foreground">{course?.title}</p>
                    <p className="text-xs text-muted-foreground">{course?.department} · {course?.semester}</p>
                </div>

                <Input
                    label="Joining Code"
                    placeholder="e.g. 6F9E6565"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        className="flex-1"
                        disabled={!code.trim()}
                        loading={isLoading}
                        onClick={handleSubmit}
                    >
                        Send Request
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

