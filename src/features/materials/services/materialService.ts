import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { MaterialDto, CreateMaterialRequest } from '@/types/material.types'

export const materialService = {
    getAll: (courseId: string, folderId?: string | null) => {
        const params = folderId ? `?folderId=${folderId}` : ''
        return api
            .get<ApiResponse<MaterialDto[]>>(`/courses/${courseId}/materials${params}`)
            .then((r) => r.data)
    },

    createFolder: (data: CreateMaterialRequest) =>
        api
            .post<ApiResponse<MaterialDto>>(`/courses/${data.courseId}/materials/folder`, data)
            .then((r) => r.data),

    uploadFile: (
        data: { courseId: string; parentFolderId?: string | null; title?: string; description?: string; file: File },
        onProgress?: (pct: number) => void
    ) => {
        const form = new FormData()
        form.append('file', data.file)
        if (data.title) form.append('title', data.title)
        if (data.description) form.append('description', data.description)
        if (data.parentFolderId) form.append('parentFolderId', data.parentFolderId)
        return api
            .post<ApiResponse<MaterialDto>>(`/courses/${data.courseId}/materials/upload`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
                },
            })
            .then((r) => r.data)
    },

    addLink: (data: CreateMaterialRequest) =>
        api
            .post<ApiResponse<MaterialDto>>(`/courses/${data.courseId}/materials/link`, data)
            .then((r) => r.data),

    deleteMaterial: (courseId: string, materialId: string) =>
        api
            .delete<ApiResponse>(`/courses/${courseId}/materials/${materialId}`)
            .then((r) => r.data),

    toggleVisibility: (courseId: string, materialId: string) =>
        api
            .patch<ApiResponse<MaterialDto>>(`/courses/${courseId}/materials/${materialId}/visibility`)
            .then((r) => r.data),

    download: (courseId: string, materialId: string) =>
        api
            .get(`/courses/${courseId}/materials/${materialId}/download`, { responseType: 'blob' })
            .then((r) => r.data),
}
