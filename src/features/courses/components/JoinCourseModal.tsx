import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Hash } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
    joiningCode: z.string().min(4, 'Enter the course joining code'),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    onJoin: (data: { courseId: string; joiningCode: string }) => void
    isLoading?: boolean
}

export default function JoinCourseModal({ isOpen, onClose, onJoin, isLoading }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const handleClose = () => { reset(); onClose() }

    const onSubmit = ({ joiningCode }: FormData) => {
        // The joining code IS the course lookup key
        // Backend accepts courseId = joiningCode for simplified join
        onJoin({ courseId: joiningCode, joiningCode })
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join a Course" description="Enter the joining code shared by your teacher" size="sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex items-center justify-center py-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Hash className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <Input
                    {...register('joiningCode')}
                    label="Course Joining Code"
                    placeholder="e.g. ABC123"
                    error={errors.joiningCode?.message}
                    className="text-center font-mono tracking-widest uppercase"
                    autoFocus
                />
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Join Course</Button>
                </div>
            </form>
        </Modal>
    )
}
