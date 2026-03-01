import { useQuery } from '@tanstack/react-query'
import { marksService } from '../services/marksService'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import toast from 'react-hot-toast'

export function useGradebook(courseId: string) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const gradebookQuery = useQuery({
        queryKey: ['gradebook', courseId],
        queryFn: async () => {
            const res = await marksService.getGradebook(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && teacher,
    })

    const myGradesQuery = useQuery({
        queryKey: ['my-grades', courseId],
        queryFn: async () => {
            const res = await marksService.getMyGrades(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId && !teacher,
    })

    const exportGradebook = async () => {
        try {
            toast.loading('Preparing export...', { id: 'export' })
            const blob = await marksService.exportGradebook(courseId)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `gradebook-${courseId}.xlsx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Export downloaded!', { id: 'export' })
        } catch {
            toast.error('Export failed.', { id: 'export' })
        }
    }

    return {
        gradebook: gradebookQuery.data,
        isGradebookLoading: gradebookQuery.isLoading,
        myGrades: myGradesQuery.data,
        isMyGradesLoading: myGradesQuery.isLoading,
        exportGradebook,
    }
}
