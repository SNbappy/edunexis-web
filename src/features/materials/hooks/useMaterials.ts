import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '../services/materialService'
import toast from 'react-hot-toast'
import type { MaterialDto } from '@/types/material.types'

export type SortMode = 'all' | 'File' | 'Folder'
export type FileTypeFilter = 'all' | 'pdf' | 'presentation' | 'document' | 'image' | 'link' | 'other'

function getFileCategory(material: MaterialDto): FileTypeFilter {
    if (['Link', 'YouTube', 'GoogleDrive'].includes(material.type)) return 'link'
    const ext = (material.fileName ?? '').split('.').pop()?.toLowerCase() ?? ''
    if (ext === 'pdf') return 'pdf'
    if (['ppt', 'pptx'].includes(ext)) return 'presentation'
    if (['doc', 'docx'].includes(ext)) return 'document'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
    return 'other'
}

export function useMaterials(courseId: string) {
    const qc = useQueryClient()
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; label: string }[]>([
        { id: null, label: 'Materials' },
    ])
    const [sortMode, setSortModeState] = useState<SortMode>('all')
    const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all')

    const isFlattenMode = sortMode === 'File'

    const query = useQuery({
        queryKey: ['materials', courseId, isFlattenMode ? '__flatten__' : currentFolderId],
        queryFn: () =>
            materialService
                .getAll(courseId, isFlattenMode ? undefined : currentFolderId, isFlattenMode)
                .then((r) => {
                    if (!r.success) throw new Error(r.message)
                    return r.data ?? []
                }),
      refetchInterval: 8_000,
        enabled: !!courseId,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    })

    const invalidate = () => qc.invalidateQueries({ queryKey: ['materials', courseId] })

    const setSortMode = (mode: SortMode) => {
        setSortModeState(mode)
        /* The type filter is cleared only for Folders, where it cannot mean
           anything. It used to be cleared on leaving "Files" as well, which is
           why picking "PDF" and then going back to "All" silently dropped the
           filter — and why the filter row was hidden on "All" at all. */
        if (mode === 'Folder') setFileTypeFilter('all')
    }

    const createFolderMutation = useMutation({
        mutationFn: (data: { title: string; description?: string }) =>
            materialService.createFolder({ ...data, type: 'Folder', courseId, parentFolderId: currentFolderId }),
        onSuccess: (res) => { if (res.success) { invalidate(); toast.success('Folder created!') } else toast.error(res.message) },
        onError: () => toast.error('Failed to create folder.'),
    })

    const uploadMutation = useMutation({
        mutationFn: (payload: { file: File; title?: string; description?: string; onProgress?: (n: number) => void }) =>
            materialService.uploadFile({ courseId, parentFolderId: currentFolderId, ...payload }, payload.onProgress),
        onSuccess: (res) => { if (res.success) { invalidate(); toast.success('File uploaded!') } else toast.error(res.message) },
        onError: () => toast.error('Upload failed.'),
    })

    const addLinkMutation = useMutation({
        mutationFn: (payload: {
            title: string; url: string; description?: string; isYouTube: boolean
        }) =>
            materialService.addLink({
                courseId,
                parentFolderId: currentFolderId,
                title: payload.title,
                description: payload.description,
                embedUrl: payload.url,
                // Stored as its own type so the UI knows what it may embed.
                type: payload.isYouTube ? 'YouTube' : 'Link',
            }),
        onSuccess: (res, vars) => {
            if (res.success) {
                invalidate()
                toast.success(vars.isYouTube ? 'Video added!' : 'Link added!')
            } else toast.error(res.message)
        },
        onError: () => toast.error('Failed to add link.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => materialService.deleteMaterial(courseId, id),
        onSuccess: (res) => { if (res.success) { invalidate(); toast.success('Deleted.') } else toast.error(res.message) },
        onError: () => toast.error('Failed to delete.'),
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

    const allMaterials = query.data ?? []

    const materials = useMemo(() => {
        let items = allMaterials
        if (sortMode === 'Folder') items = items.filter((m) => m.type === 'Folder')

        /* Applies on "All" as well as "Files".
           "All" is the tab people actually browse in, and it was the one tab
           where you could not narrow to PDFs — the filter existed but only
           after switching to a different view. Folders drop out while a type
           filter is on, because a folder is not a PDF or an image. */
        if (sortMode !== 'Folder' && fileTypeFilter !== 'all')
            items = items.filter((m) => m.type !== 'Folder' && getFileCategory(m) === fileTypeFilter)
        return items
    }, [allMaterials, sortMode, fileTypeFilter])

    return {
        materials,
        allMaterials,
        isLoading: query.isLoading,
        currentFolderId,
        breadcrumb,
        sortMode,
        setSortMode,
        isFlattenMode,
        fileTypeFilter,
        setFileTypeFilter,
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
    }
}

