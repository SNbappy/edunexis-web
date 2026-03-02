import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { MaterialDto, CreateMaterialRequest } from '@/types/material.types'

const base = (courseId: string) => `/Materials/courses/${courseId}/materials`

const toForm = (data: Record<string, unknown>): FormData => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v))
    })
    return form
}

export const materialService = {
    getAll: (courseId: string, parentFolderId?: string | null) => {
        const params = parentFolderId ? { parentFolderId } : {}
        return api
            .get<ApiResponse<MaterialDto[]>>(base(courseId), { params })
            .then((r) => r.data)
    },

    createFolder: (data: CreateMaterialRequest) =>
        api
            .post<ApiResponse<MaterialDto>>(base(data.courseId), toForm({
                title: data.title,
                description: data.description,
                type: 'Folder',
                parentFolderId: data.parentFolderId,
            }), { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((r) => r.data),

    uploadFile: (
        payload: { courseId: string; parentFolderId?: string | null; file: File; title?: string; description?: string },
        onProgress?: (n: number) => void
    ) => {
        const form = new FormData()
        form.append('file', payload.file)
        form.append('type', 'File')
        if (payload.title) form.append('title', payload.title)
        if (payload.description) form.append('description', payload.description)
        if (payload.parentFolderId) form.append('parentFolderId', payload.parentFolderId)
        return api
            .post<ApiResponse<MaterialDto>>(base(payload.courseId), form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
                },
            })
            .then((r) => r.data)
    },

    addLink: (data: CreateMaterialRequest) =>
        api
            .post<ApiResponse<MaterialDto>>(base(data.courseId), toForm({
                title: data.title,
                description: data.description,
                type: 'Link',
                embedUrl: data.linkUrl,
                parentFolderId: data.parentFolderId,
            }), { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((r) => r.data),

    deleteMaterial: (courseId: string, id: string) =>
        api
            .delete<ApiResponse<null>>(`${base(courseId)}/${id}`)
            .then((r) => r.data),

    toggleVisibility: (courseId: string, id: string) =>
        api
            .patch<ApiResponse<MaterialDto>>(`${base(courseId)}/${id}/visibility`)
            .then((r) => r.data),
}
