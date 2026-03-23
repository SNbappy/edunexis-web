import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Globe, ShieldAlert, ChevronDown, ChevronUp, Loader2, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import { analysisService, type AiDetectionResult } from '../services/analysisService'
import type { SubmissionDto } from '@/types/assignment.types'

interface Props {
    submission: SubmissionDto
}

function ScoreRing({ score, color }: { score: number; color: string }) {
    const r = 28
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    return (
        <svg width="72" height="72" className="-rotate-90">
            <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <motion.circle
                cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6"
                strokeDasharray={circ} strokeDashoffset={circ - dash}
                strokeLinecap="round"
                className={color}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - dash }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
        </svg>
    )
}

function LevelBadge({ level, label }: { level: string; label: string }) {
    return (
        <span className={cn('px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide',
            level === 'high' ? 'bg-red-500/15 text-red-500' :
            level === 'medium' ? 'bg-amber-400/15 text-amber-500' :
            'bg-emerald-500/15 text-emerald-600'
        )}>{label}</span>
    )
}

function AiResultCard({ result }: { result: AiDetectionResult }) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-xl border space-y-4',
                result.level === 'high' ? 'border-red-500/30 bg-red-500/5' :
                result.level === 'medium' ? 'border-amber-400/30 bg-amber-400/5' :
                'border-emerald-500/30 bg-emerald-500/5'
            )}>
            <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                    <ScoreRing score={result.aiScore}
                        color={result.level === 'high' ? 'text-red-500' : result.level === 'medium' ? 'text-amber-400' : 'text-emerald-500'} />
                    <span className="absolute text-sm font-bold text-foreground">{result.aiScore}%</span>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">AI Generated Content</p>
                        <LevelBadge level={result.level} label={result.level === 'high' ? 'High' : result.level === 'medium' ? 'Medium' : 'Low'} />
                    </div>
                    <p className="text-xs text-muted-foreground">{result.feedback}</p>
                    <div className="flex gap-4 pt-1">
                        <span className="text-xs text-red-500 font-medium">AI: {result.aiScore}%</span>
                        <span className="text-xs text-emerald-500 font-medium">Human: {result.humanScore}%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function AnalysisPanel({ submission }: Props) {
    const [aiResult, setAiResult] = useState<AiDetectionResult | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [webLoading, setWebLoading] = useState(false)
    const [webResult, setWebResult] = useState<{ scanId: string; message: string; checkUrl: string } | null>(null)
    const [webError, setWebError] = useState<string | null>(null)

    const text = submission.textContent ?? ''
    const hasText = text.trim().length > 50

    const runAiDetection = async () => {
        if (!hasText) return
        setAiLoading(true)
        setAiError(null)
        try {
            const res = await analysisService.detectAI(text, submission.studentName)
            if (res.success && res.data) setAiResult(res.data)
            else setAiError(res.message ?? 'Detection failed')
        } catch {
            setAiError('Could not connect to AI detection service')
        } finally {
            setAiLoading(false)
        }
    }

    const runWebPlagiarism = async () => {
        if (!hasText) return
        setWebLoading(true)
        setWebError(null)
        try {
            const res = await analysisService.checkWebPlagiarism(text)
            if (res.success && res.data) setWebResult(res.data)
            else setWebError(res.message ?? 'Check failed')
        } catch {
            setWebError('Could not connect to Copyleaks')
        } finally {
            setWebLoading(false)
        }
    }

    if (!hasText) {
        return (
            <div className="p-4 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Analysis unavailable</p>
                <p className="text-xs text-muted-foreground">Only text submissions can be analysed for AI content and web plagiarism.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* AI Detection */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">AI Content Detector</p>
                            <p className="text-[11px] text-muted-foreground">Powered by ZeroGPT</p>
                        </div>
                    </div>
                    {!aiResult && (
                        <Button size="sm" variant="secondary" loading={aiLoading} onClick={runAiDetection}
                            leftIcon={!aiLoading ? <Bot className="w-3.5 h-3.5" /> : undefined}>
                            {aiLoading ? 'Detecting...' : 'Run Detection'}
                        </Button>
                    )}
                </div>
                <AnimatePresence>
                    {(aiResult || aiError) && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 border-t border-border/50 pt-3">
                                {aiError ? (
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>{aiError}</span>
                                    </div>
                                ) : aiResult && (
                                    <>
                                        <AiResultCard result={aiResult} />
                                        <button onClick={() => { setAiResult(null); setAiError(null) }}
                                            className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors">
                                            Re-run
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Web Plagiarism */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Web Plagiarism Check</p>
                            <p className="text-[11px] text-muted-foreground">Powered by Copyleaks</p>
                        </div>
                    </div>
                    {!webResult && (
                        <Button size="sm" variant="secondary" loading={webLoading} onClick={runWebPlagiarism}
                            leftIcon={!webLoading ? <Globe className="w-3.5 h-3.5" /> : undefined}>
                            {webLoading ? 'Submitting...' : 'Check Web'}
                        </Button>
                    )}
                    {!webResult && !webLoading && (
                        <span className="text-[10px] text-muted-foreground italic">API key required</span>
                    )}
                </div>
                <AnimatePresence>
                    {(webResult || webError) && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-2">
                                {webError ? (
                                    webError.includes('not configured') ? (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Copyleaks not configured yet</p>
                                                <p className="text-xs text-muted-foreground">Add your API key in <code className="bg-muted px-1 rounded">appsettings.json</code> before deployment.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-destructive">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <span>{webError}</span>
                                        </div>
                                    )
                                ) : webResult && (
                                    <>
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">Scan submitted</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{webResult.message}</p>
                                                <p className="text-xs text-muted-foreground">Scan ID: <code className="bg-muted px-1 rounded">{webResult.scanId}</code></p>
                                            </div>
                                        </div>
                                        <a href={webResult.checkUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="secondary" className="w-full"
                                                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                                                View Full Report on Copyleaks
                                            </Button>
                                        </a>
                                    </>
                                    )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
