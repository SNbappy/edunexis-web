import * as pdfjsLib from 'pdfjs-dist'
import type { PlagiarismPair, PlagiarismReport } from '@/types/assignment.types'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

export interface CheckInput {
    id: string
    studentName: string
    submissionType: string
    textContent?: string | null
    fileUrl?: string | null
}

// ?? PDF extraction ????????????????????????????????????????????????????????
async function extractPdfText(url: string): Promise<string> {
    try {
        const pdf = await pdfjsLib.getDocument({ url, verbosity: 0 }).promise
        const pages: string[] = []
        for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
            const page = await pdf.getPage(i)
            const ct = await page.getTextContent()
            pages.push(ct.items.map((item: any) => item.str).join(' '))
        }
        return pages.join(' ')
    } catch { return '' }
}

// ?? Text normalization ????????????????????????????????????????????????????
const STOPWORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for',
    'of','with','by','from','is','was','are','were','be','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might','this',
    'that','these','those','it','its','i','you','he','she','we','they','as','so'])

function normalize(text: string): string {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function tokenize(text: string): string[] {
    return normalize(text).split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w))
}

// ?? Bigrams ???????????????????????????????????????????????????????????????
function getBigrams(words: string[]): Map<string, number> {
    const map = new Map<string, number>()
    for (let i = 0; i < words.length - 1; i++) {
        const bg = words[i] + ' ' + words[i + 1]
        map.set(bg, (map.get(bg) ?? 0) + 1)
    }
    return map
}

// ?? Trigrams ??????????????????????????????????????????????????????????????
function getTrigrams(words: string[]): Set<string> {
    const s = new Set<string>()
    for (let i = 0; i < words.length - 2; i++)
        s.add(words[i] + ' ' + words[i+1] + ' ' + words[i+2])
    return s
}

// ?? TF-IDF cosine similarity ??????????????????????????????????????????????
function tfIdfCosine(wordsA: string[], wordsB: string[]): number {
    const tfA = new Map<string, number>()
    const tfB = new Map<string, number>()
    wordsA.forEach(w => tfA.set(w, (tfA.get(w) ?? 0) + 1))
    wordsB.forEach(w => tfB.set(w, (tfB.get(w) ?? 0) + 1))

    const allTerms = new Set([...tfA.keys(), ...tfB.keys()])
    let dot = 0, magA = 0, magB = 0
    for (const term of allTerms) {
        const a = (tfA.get(term) ?? 0) / (wordsA.length || 1)
        const b = (tfB.get(term) ?? 0) / (wordsB.length || 1)
        dot += a * b
        magA += a * a
        magB += b * b
    }
    if (magA === 0 || magB === 0) return 0
    return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100)
}

// ?? Jaccard bigram similarity ?????????????????????????????????????????????
function jaccardBigram(bgA: Map<string, number>, bgB: Map<string, number>): number {
    const setA = new Set(bgA.keys())
    const setB = new Set(bgB.keys())
    const intersection = [...setA].filter(x => setB.has(x)).length
    const union = new Set([...setA, ...setB]).size
    if (union === 0) return 0
    return Math.round((intersection / union) * 100)
}

// ?? Longest Common Substring ratio ????????????????????????????????????????
function lcsRatio(a: string, b: string): number {
    const wa = a.split(' ').slice(0, 300)
    const wb = b.split(' ').slice(0, 300)
    let max = 0
    const dp: number[][] = Array.from({ length: wa.length + 1 }, () => new Array(wb.length + 1).fill(0))
    for (let i = 1; i <= wa.length; i++) {
        for (let j = 1; j <= wb.length; j++) {
            if (wa[i-1] === wb[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1
                max = Math.max(max, dp[i][j])
            }
        }
    }
    const minLen = Math.min(wa.length, wb.length) || 1
    return Math.round((max / minLen) * 100)
}

// ?? Matching sentence fragments ???????????????????????????????????????????
function getMatchingPhrases(textA: string, textB: string): string[] {
    const sentA = textA.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(' ').length >= 5)
    const normB = normalize(textB)
    return sentA
        .filter(s => normB.includes(normalize(s)))
        .slice(0, 5)
}

// ?? Combined score (weighted) ?????????????????????????????????????????????
function combinedScore(cosine: number, jaccard: number, lcs: number): number {
    return Math.round(cosine * 0.45 + jaccard * 0.35 + lcs * 0.20)
}

function level(score: number): 'low' | 'medium' | 'high' {
    if (score >= 55) return 'high'
    if (score >= 25) return 'medium'
    return 'low'
}

// ?? Main async checker ????????????????????????????????????????????????????
export async function checkPlagiarismAsync(submissions: CheckInput[]): Promise<PlagiarismReport> {
    const resolved: { id: string; studentName: string; text: string; source: string }[] = []
    const cannotCheck: string[] = []

    for (const sub of submissions) {
        if (sub.submissionType === 'Text' && sub.textContent && sub.textContent.trim().length > 30) {
            resolved.push({ id: sub.id, studentName: sub.studentName, text: sub.textContent, source: 'text' })
        } else if (sub.submissionType === 'File' && sub.fileUrl) {
            const isPdf = /\.pdf(\?|$)/i.test(sub.fileUrl) || sub.fileUrl.toLowerCase().includes('pdf')
            if (isPdf) {
                const extracted = await extractPdfText(sub.fileUrl)
                if (extracted.trim().length > 30)
                    resolved.push({ id: sub.id, studentName: sub.studentName, text: extracted, source: 'pdf' })
                else
                    cannotCheck.push(sub.studentName + ' (scanned/image PDF ? not readable)')
            } else {
                cannotCheck.push(sub.studentName + ' (non-PDF file)')
            }
        } else if (sub.submissionType === 'Link') {
            cannotCheck.push(sub.studentName + ' (link submission)')
        } else {
            cannotCheck.push(sub.studentName + ' (no content)')
        }
    }

    const allPairs: PlagiarismPair[] = []

    for (let i = 0; i < resolved.length; i++) {
        for (let j = i + 1; j < resolved.length; j++) {
            const a = resolved[i]
            const b = resolved[j]
            const wA = tokenize(a.text)
            const wB = tokenize(b.text)
            const bgA = getBigrams(wA)
            const bgB = getBigrams(wB)

            const cosine  = tfIdfCosine(wA, wB)
            const jaccard  = jaccardBigram(bgA, bgB)
            const lcs     = lcsRatio(normalize(a.text), normalize(b.text))
            const similarity = combinedScore(cosine, jaccard, lcs)

            const matchingPhrases = getMatchingPhrases(a.text, b.text)
            const tgA = getTrigrams(wA)
            const tgB = getTrigrams(wB)
            const commonTrigrams = [...tgA].filter(t => tgB.has(t)).slice(0, 8)

            allPairs.push({
                studentA: a.studentName,
                studentB: b.studentName,
                submissionAId: a.id,
                submissionBId: b.id,
                textA: a.text.slice(0, 1000),
                textB: b.text.slice(0, 1000),
                similarity,
                level: level(similarity),
                commonPhrases: [...matchingPhrases, ...commonTrigrams].slice(0, 8),
                breakdown: { cosine, jaccard, lcs },
            })
        }
    }

    allPairs.sort((a, b) => b.similarity - a.similarity)

    return {
        checkedAt: new Date().toISOString(),
        totalCompared: resolved.length,
        allPairs,
        flaggedPairs: allPairs.filter(p => p.level !== 'low'),
        cannotCheck,
    }
}

export function checkPlagiarism(): PlagiarismReport {
    return { checkedAt: new Date().toISOString(), totalCompared: 0, allPairs: [], flaggedPairs: [], cannotCheck: [] }
}
