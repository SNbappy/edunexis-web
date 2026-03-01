import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementService } from '../services/announcementService'
import type { CreateAnnouncementRequest } from '@/types/announcement.types'
import toast from 'react-hot-toast'

export function useAnnouncements(courseId: string) {
    const qc = useQueryClient()
    const key = ['announcements', courseId]

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await announcementService.getAll(courseId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateAnnouncementRequest) => announcementService.create(data),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                toast.success('Announcement posted!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to post announcement.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (announcementId: string) => announcementService.delete(courseId, announcementId),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: key })
                toast.success('Announcement deleted.')
            } else toast.error(res.message)
        },
    })

    const pinMutation = useMutation({
        mutationFn: (announcementId: string) => announcementService.pin(courseId, announcementId),
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    return {
        announcements: query.data ?? [],
        isLoading: query.isLoading,
        create: createMutation.mutate,
        isCreating: createMutation.isPending,
        deleteAnnouncement: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        pinAnnouncement: pinMutation.mutate,
    }
}
