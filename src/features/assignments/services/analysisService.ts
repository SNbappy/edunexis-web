import api from '@/lib/axios'

export interface AiDetectionResult {
    aiScore: number
    humanScore: number
    isAiGenerated: boolean
    level: 'low' | 'medium' | 'high'
    feedback: string
}

export const analysisService = {
    /**
     * AI-content detection for one written answer.
     *
     * The path repeats "analysis" because BaseController carries
     * `[Route("api/[controller]")]` and the action adds `analysis/detect-ai` on
     * top, so the real route is `api/Analysis/analysis/detect-ai`. Calling
     * `/analysis/detect-ai` resolved the controller but matched no action and
     * returned a bare 404, which the panel reported as "could not connect" —
     * the feature had never actually reached the server.
     */
    detectAI: async (
        text: string,
        studentName = '',
    ): Promise<{ success: boolean; data?: AiDetectionResult; message?: string }> => {
        const res = await api.post('/Analysis/analysis/detect-ai', { text, studentName })
        return res.data
    },
}
