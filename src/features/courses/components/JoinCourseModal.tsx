import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Hash, Search } from 'lucide-react'
import { courseService } from '../services/courseService'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const schema = z.object({ joiningCode: z.string().min(4, 'Enter the course joining code') })
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function JoinCourseModal({ isOpen, onClose }: Props) {
    const [loading, setLoading] = useState(false)
    const qc = useQueryClient()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const handleClose = () => { reset(); onClose() }

    const onSubmit = async ({ joiningCode }: FormData) => {
        setLoading(true)
        try {
            // Find course by code first — we POST to join with the code
            // Backend join endpoint requires courseId + joiningCode
            // We'll use a temporary workaround: search by code
            const allRes = await courseService.getMyCourses()
            const course = allRes.data?.find((c) => c.id === joiningCode)

            // Direct join attempt — backend will validate
            const res = await fetch(`/api/courses/join-by-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ joiningCode }),
            })

            if (res.ok) {
                qc.invalidateQueries({ queryKey: ['courses'] })
                toast.success('Join request sent! Wait for teacher approval.')
                handleClose()
            } else {
                toast.error('Invalid joining code. Please check and try again.')
            }
        } catch {
            toast.error('Invalid joining code. Please check and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join a Course" description="Enter the joining code shared by your teacher">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                    💡 Ask your teacher for the course joining code. It looks like <span className="font-mono font-bold text-primary">ABC-12345</span>
                </div>
                <Input
                    {...register('joiningCode')}
                    label="Joining Code"
                    placeholder="e.g. ABC-12345"
                    error={errors.joiningCode?.message}
                    leftIcon={<Hash className="w-4 h-4" />}
                    className="font-mono uppercase"
                />
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={loading} leftIcon={!loading ? <Search className="w-4 h-4" /> : undefined}>
                        Join Course
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
