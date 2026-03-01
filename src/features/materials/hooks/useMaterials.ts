import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '../services/materialService'
import type { CreateMaterialRequest, BreadcrumbItem } from '@/types/material.types'
import toast from 'react-hot-toast'

export function useMaterials(courseId: string) {
    const qc = useQueryClient()
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
        { id: null, label: 'Materials' },
    ])

    const query = useQuery({
        queryKey: ['materials', courseId, currentFolderId],
        queryFn: async () => {
            const res = await materialService.getAll(courseId, currentFolderId)
            if (!res.success) throw new Error(res.message)
            return res.data
        },
        enabled: !!courseId,
    })

    const invalidate = () =>
        qc.invalidateQueries({ queryKey: ['materials', courseId] })

    const createFolderMutation = useMutation({
        mutationFn: (data: Omit<CreateMaterialRequest, 'type'>) =>
            materialService.createFolder({ ...data, type: 'Folder', parentFolderId: currentFolderId }),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Folder created!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to create folder.'),
    })

    const uploadMutation = useMutation({
        mutationFn: (payload: { file: File; title?: string; description?: string; onProgress?: (n: number) => void }) =>
            materialService.uploadFile(
                { courseId, parentFolderId: currentFolderId, ...payload },
                payload.onProgress
            ),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('File uploaded!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Upload failed.'),
    })

    const addLinkMutation = useMutation({
        mutationFn: (data: Omit<CreateMaterialRequest, 'type' | 'courseId'>) =>
            materialService.addLink({ ...data, type: 'Link', courseId, parentFolderId: currentFolderId }),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Link added!') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to add link.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => materialService.deleteMaterial(courseId, id),
        onSuccess: (res) => {
            if (res.success) { invalidate(); toast.success('Deleted.') }
            else toast.error(res.message)
        },
        onError: () => toast.error('Failed to delete.'),
    })

    const toggleVisibilityMutation = useMutation({
        mutationFn: (id: string) => materialService.toggleVisibility(courseId, id),
        onSuccess: () => invalidate(),
        onError: () => toast.error('Failed to update visibility.'),
    })

    const openFolder = (folderId: string, label: string) => {
        setCurrentFolderId(folderId)
        setBreadcrumb((prev) => [...prev, { id: folderId, label }])
    }

    const navigateTo = (index: number) => {
        const item = breadcrumb[index]
        setCurrentFolderId(item.id)
        setBreadcrumb((prev) => prev.slice(0, index + 1))
    }

    return {
        materials: query.data ?? [],
        isLoading: query.isLoading,
        currentFolderId,
        breadcrumb,
        openFolder,
        navigateTo,
        createFolder: createFolderMutation.mutate,
        isCreatingFolder: createFolderMutation.isPending,
        uploadFile: uploadMutation.mutate,
        isUploading: uploadMutation.isPending,
        addLink: addLinkMutation.mutate,
        isAddingLink: addLinkMutation.isPending,
        deleteMaterial: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        toggleVisibility: toggleVisibilityMutation.mutate,
    }
}
