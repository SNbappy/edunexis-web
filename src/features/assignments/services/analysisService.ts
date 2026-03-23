import api from '@/lib/axios'

export interface AiDetectionResult {
    aiScore: number
    humanScore: number
    isAiGenerated: boolean
    level: 'low' | 'medium' | 'high'
    feedback: string
}

export interface WebPlagiarismResult {
    scanId: string
    status: string
    message: string
    checkUrl: string
}

export const analysisService = {
    detectAI: async (text: string, studentName = ''): Promise<{ success: boolean; data?: AiDetectionResult; message?: string }> => {
        const res = await api.post('/analysis/detect-ai', { text, studentName })
        return res.data
    },
    checkWebPlagiarism: async (text: string): Promise<{ success: boolean; data?: WebPlagiarismResult; message?: string }> => {
        const res = await api.post('/analysis/check-web-plagiarism', { text })
        return res.data
    },
}
