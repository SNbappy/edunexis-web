import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Star, ShieldAlert, Clock, Loader2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import GradeSubmissionModal from './GradeSubmissionModal'
import PlagiarismReportModal from './PlagiarismReportModal'
import { useSubmissions } from '../hooks/useSubmissions'
import { checkPlagiarismAsync } from '../utils/plagiarismChecker'
import { formatRelative } from '@/utils/dateUtils'
import type { SubmissionDto, PlagiarismReport } from '@/types/assignment.types'

interface Props { courseId: string; assignmentId: string; maxMarks: number }

function getStatus(s: SubmissionDto) {
  if (s.isGraded) return 'Graded'
  if (s.isLate)   return 'Late'
  return 'Submitted'
}

const STATUS_CFG = {
  Graded:    { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  icon: Star        },
  Late:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  icon: AlertCircle },
  Submitted: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)', icon: CheckCircle2 },
}

export default function SubmissionsPanel({ courseId, assignmentId, maxMarks }: Props) {
  const { submissions, isLoading, gradeSubmission, isGrading } = useSubmissions(courseId, assignmentId)
  const [grading,     setGrading]     = useState<SubmissionDto | null>(null)
  const [plagReport,  setPlagReport]  = useState<PlagiarismReport | null>(null)
  const [plagOpen,    setPlagOpen]    = useState(false)
  const [isChecking,  setIsChecking]  = useState(false)

  const handleCheckPlag = async () => {
    setPlagOpen(true); setIsChecking(true)
    try { setPlagReport(await checkPlagiarismAsync(submissions)) }
    catch { /* ignore */ }
    finally { setIsChecking(false) }
  }

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => (
        <div key={i} className="h-16 rounded-xl animate-pulse"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
      ))}
    </div>
  )

  const graded  = submissions.filter(s => s.isGraded).length
  const pending = submissions.filter(s => !s.isGraded).length

  return (
    <div className="space-y-4">
      {/* Stats + plagiarism row */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-extrabold" style={{ color: '#e2e8f0' }}>{submissions.length}</p>
            <p className="text-[10px] font-bold" style={{ color: '#475569' }}>Total</p>
          </div>
          <div className="w-[1px] h-8" style={{ background: 'rgba(99,102,241,0.15)' }} />
          <div className="text-center">
            <p className="text-lg font-extrabold" style={{ color: '#34d399' }}>{graded}</p>
            <p className="text-[10px] font-bold" style={{ color: '#475569' }}>Graded</p>
          </div>
          <div className="w-[1px] h-8" style={{ background: 'rgba(99,102,241,0.15)' }} />
          <div className="text-center">
            <p className="text-lg font-extrabold" style={{ color: '#fbbf24' }}>{pending}</p>
            <p className="text-[10px] font-bold" style={{ color: '#475569' }}>Pending</p>
          </div>
        </div>
        {submissions.length >= 2 && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleCheckPlag}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
            <ShieldAlert className="w-3.5 h-3.5" /> Check Plagiarism
          </motion.button>
        )}
      </div>

      {/* Submissions list */}
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl"
          style={{ background: 'rgba(6,13,31,0.5)', border: '1px dashed rgba(99,102,241,0.12)' }}>
          <Clock className="w-8 h-8 mb-3" style={{ color: 'rgba(129,140,248,0.3)' }} strokeWidth={1.5} />
          <p className="text-sm font-semibold" style={{ color: '#334155' }}>No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub, i) => {
            const status = getStatus(sub)
            const cfg    = STATUS_CFG[status]
            const Icon   = cfg.icon
            return (
              <motion.div key={sub.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.1)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.1)'}>
                <Avatar name={sub.studentName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: '#e2e8f0' }}>{sub.studentName}</p>
                  <p className="text-[11px]" style={{ color: '#475569' }}>{formatRelative(sub.submittedAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {sub.isGraded && sub.marks != null && (
                    <span className="text-[13px] font-extrabold" style={{ color: '#34d399' }}>{sub.marks}/{maxMarks}</span>
                  )}
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                    <Icon className="w-3 h-3" /> {status}
                  </span>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setGrading(sub)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={sub.isGraded
                      ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }
                      : { background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff' }}>
                    {sub.isGraded ? 'Edit' : 'Grade'}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <GradeSubmissionModal isOpen={!!grading} onClose={() => setGrading(null)}
        submission={grading} maxMarks={maxMarks}
        onGrade={data => gradeSubmission({ submissionId: grading!.id, data }, { onSuccess: () => setGrading(null) })}
        isLoading={isGrading} />

      <PlagiarismReportModal isOpen={plagOpen} onClose={() => setPlagOpen(false)}
        report={plagReport} isChecking={isChecking} />
    </div>
  )
}