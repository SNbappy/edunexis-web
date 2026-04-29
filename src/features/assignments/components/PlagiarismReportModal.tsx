import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, FileX, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PlagiarismReport, PlagiarismPair } from '@/types/assignment.types'
import { formatDateTime } from '@/utils/dateUtils'

interface Props {
    isOpen: boolean
    onClose: () => void
    report: PlagiarismReport | null
    isChecking: boolean
}

function SimilarityBar({ value, level }: { value: number; level: string }) {
    const color = level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: value + '%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', color)}
                />
            </div>
            <span className={cn('text-xs font-bold w-9 text-right tabular-nums',
                level === 'high' ? 'text-red-500' : level === 'medium' ? 'text-amber-500' : 'text-emerald-500'
            )}>
                {value}%
            </span>
        </div>
    )
}

function LevelBadge({ level }: { level: string }) {
    return (
        <span className={cn('px-2 py-0.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide',
            level === 'high' ? 'bg-red-500/15 text-red-500' :
            level === 'medium' ? 'bg-amber-400/15 text-amber-500' :
            'bg-emerald-500/15 text-emerald-600'
        )}>
            {level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low'}
        </span>
    )
}

function HighlightText({ text, phrases }: { text: string; phrases: string[] }) {
    if (!phrases.length) return <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{text}</p>
    const parts: { text: string; highlight: boolean }[] = []
    let remaining = text
    const lower = text.toLowerCase()
    const sorted = [...phrases].sort((a, b) => b.length - a.length)
    let lastIdx = 0
    const highlights: { start: number; end: number }[] = []
    sorted.forEach((phrase) => {
        let idx = lower.indexOf(phrase.toLowerCase(), 0)
        while (idx !== -1) {
            highlights.push({ start: idx, end: idx + phrase.length })
            idx = lower.indexOf(phrase.toLowerCase(), idx + 1)
        }
    })
    highlights.sort((a, b) => a.start - b.start)
    const merged: { start: number; end: number }[] = []
    highlights.forEach((h) => {
        if (!merged.length || h.start > merged[merged.length - 1].end) {
            merged.push({ ...h })
        } else {
            merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, h.end)
        }
    })
    let cur = 0
    merged.forEach(({ start, end }) => {
        if (cur < start) parts.push({ text: text.slice(cur, start), highlight: false })
        parts.push({ text: text.slice(start, end), highlight: true })
        cur = end
    })
    if (cur < text.length) parts.push({ text: text.slice(cur), highlight: false })
    return (
        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {parts.map((p, i) =>
                p.highlight
                    ? <mark key={i} className="bg-amber-300/40 text-foreground rounded px-0.5">{p.text}</mark>
                    : <span key={i}>{p.text}</span>
            )}
        </p>
    )
}

function PairRow({ pair, index }: { pair: PlagiarismPair; index: number }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn('rounded-xl border transition-all',
                pair.level === 'high' ? 'border-red-500/30 bg-red-500/5' :
                pair.level === 'medium' ? 'border-amber-400/30 bg-amber-400/5' :
                'border-border bg-card'
            )}
        >
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-3 p-3 text-left"
            >
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{pair.studentA}</span>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <span className="text-sm font-semibold text-foreground">{pair.studentB}</span>
                        <LevelBadge level={pair.level} />
                    </div>
                    <SimilarityBar value={pair.similarity} level={pair.level} />
                </div>
                <div className="text-muted-foreground shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                            {pair.commonPhrases.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Common phrases detected</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pair.commonPhrases.map((ph, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                                                {ph}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold text-muted-foreground">{pair.studentA}</p>
                                    <div className="p-2.5 rounded-lg bg-muted/60 max-h-32 overflow-y-auto">
                                        <HighlightText text={pair.textA} phrases={pair.commonPhrases} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold text-muted-foreground">{pair.studentB}</p>
                                    <div className="p-2.5 rounded-lg bg-muted/60 max-h-32 overflow-y-auto">
                                        <HighlightText text={pair.textB} phrases={pair.commonPhrases} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function PlagiarismReportModal({ isOpen, onClose, report, isChecking }: Props) {
    const [showAll, setShowAll] = useState(false)

    const displayPairs = showAll ? report?.allPairs ?? [] : report?.flaggedPairs ?? []

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 p-5 border-b border-border shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-foreground text-base">Plagiarism report</h2>
                                {report && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatDateTime(report.checkedAt)}
                                    </p>
                                )}
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {isChecking ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
                                    />
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-foreground">Analyzing submissions...</p>
                                        <p className="text-xs text-muted-foreground mt-1">Comparing text content for similarities</p>
                                    </div>
                                </div>
                            ) : !report ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <ShieldAlert className="w-10 h-10 mb-3 opacity-30" />
                                    <p className="text-sm">No report generated yet</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                                            <p className="text-xl font-bold text-foreground">{report.totalCompared}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Compared</p>
                                        </div>
                                        <div className={cn('p-3 rounded-xl border text-center',
                                            report.flaggedPairs.filter(p => p.level === 'high').length > 0
                                                ? 'bg-red-500/10 border-red-500/30' : 'bg-muted/50 border-border'
                                        )}>
                                            <p className="text-xl font-bold text-red-500">
                                                {report.flaggedPairs.filter((p) => p.level === 'high').length}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">High risk</p>
                                        </div>
                                        <div className={cn('p-3 rounded-xl border text-center',
                                            report.flaggedPairs.filter(p => p.level === 'medium').length > 0
                                                ? 'bg-amber-400/10 border-amber-400/30' : 'bg-muted/50 border-border'
                                        )}>
                                            <p className="text-xl font-bold text-amber-500">
                                                {report.flaggedPairs.filter((p) => p.level === 'medium').length}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Suspicious</p>
                                        </div>
                                    </div>

                                    {/* Cannot check */}
                                    {report.cannotCheck.length > 0 && (
                                        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <FileX className="w-3.5 h-3.5" /> Cannot auto-check (file/link submissions)
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {report.cannotCheck.map((name) => (
                                                    <span key={name} className="px-2 py-0.5 rounded-lg bg-muted text-xs text-muted-foreground">{name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All clear */}
                                    {report.flaggedPairs.length === 0 && report.totalCompared > 0 && (
                                        <div className="flex flex-col items-center py-10 gap-3">
                                            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                                <ShieldCheck className="w-7 h-7 text-emerald-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-foreground">No plagiarism detected</p>
                                                <p className="text-xs text-muted-foreground mt-1">All {report.totalCompared} text submissions appear to be original</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pairs list */}
                                    {report.allPairs.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {showAll ? 'All pairs' : 'Flagged pairs'}
                                                    {' '}({displayPairs.length})
                                                </p>
                                                <button
                                                    onClick={() => setShowAll((v) => !v)}
                                                    className="text-xs text-primary hover:text-primary/70 font-medium transition-colors"
                                                >
                                                    {showAll ? 'Show flagged only' : 'Show all pairs'}
                                                </button>
                                            </div>
                                            {displayPairs.length === 0 ? (
                                                <p className="text-xs text-center text-muted-foreground py-4">No flagged pairs</p>
                                            ) : (
                                                displayPairs.map((pair, i) => (
                                                    <PairRow key={pair.submissionAId + pair.submissionBId} pair={pair} index={i} />
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* Legend */}
                                    <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Similarity thresholds</p>
                                        <div className="space-y-1">
                                            {[
                                                { label: '0â€“29%', desc: 'Low â€” likely original', color: 'bg-emerald-500' },
                                                { label: '30â€“59%', desc: 'Medium â€” review recommended', color: 'bg-amber-400' },
                                                { label: '60â€“100%', desc: 'High â€” likely plagiarized', color: 'bg-red-500' },
                                            ].map((t) => (
                                                <div key={t.label} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${t.color}`} />
                                                    <span className="text-[11px] text-muted-foreground"><strong className="text-foreground">{t.label}</strong> {t.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/60 pt-1">
                                            Uses Jaccard bigram similarity. Only text submissions are analysed.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}


