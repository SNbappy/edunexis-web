import { motion } from 'framer-motion'
import { Calendar, BookOpen, Upload, CheckCircle2, ClipboardList, Send, Star, XCircle, FileText, EyeOff } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useCTMarks } from '../hooks/useCTEvents'
import type { CTEventDto } from '@/types/ct.types'

function StudentMarkSection({ ctEventId, maxMarks }: { ctEventId: string; maxMarks: number }) {
  const { marksData, isLoading } = useCTMarks(ctEventId)
  const myMark = marksData?.marks?.[0]

  if (isLoading) return (
    <div className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(99,102,241,0.06)' }} />
  )
  if (!myMark) return (
    <div className="p-4 rounded-xl text-sm text-center"
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', color: '#475569' }}>
      Your marks have not been entered yet.
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl space-y-2"
      style={myMark.isAbsent
        ? { background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }
        : { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Your Result</p>
      {myMark.isAbsent ? (
        <div className="flex items-center gap-2" style={{ color: '#f87171' }}>
          <XCircle className="w-5 h-5" />
          <span className="font-bold text-[15px]">Absent</span>
        </div>
      ) : (
        <div className="flex items-center gap-2" style={{ color: '#34d399' }}>
          <Star className="w-5 h-5" />
          <span className="text-2xl font-extrabold">{myMark.obtainedMarks}</span>
          <span className="text-sm" style={{ color: '#475569' }}>/ {maxMarks}</span>
        </div>
      )}
      {myMark.remarks && <p className="text-[11.5px]" style={{ color: '#64748b' }}>Remarks: {myMark.remarks}</p>}
    </motion.div>
  )
}

interface Props {
  isOpen: boolean; onClose: () => void; ct: CTEventDto | null
  onEnterMarks?: (ct: CTEventDto) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
}

export default function CTEventDetailModal({ isOpen, onClose, ct, onEnterMarks, onUploadKhata, onPublish, onUnpublish }: Props) {
  const { user } = useAuthStore()
  const teacher   = isTeacher(user?.role ?? 'Student')
  if (!ct) return null

  const isPublished = ct.status === 'Published'
  const isDraft     = ct.status === 'Draft'

  const khataSlots = [
    { key: 'best',  label: 'Best Script',    url: ct.bestScriptUrl    },
    { key: 'worst', label: 'Worst Script',   url: ct.worstScriptUrl   },
    { key: 'avg',   label: 'Average Script', url: ct.averageScriptUrl },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`CT ${ct.ctNumber} — ${ct.title}`} size="lg">
      <div className="space-y-5">

        {/* Status badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            style={isPublished
              ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }
              : { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
            <CheckCircle2 className="w-3 h-3" /> {ct.status}
          </span>
          {isDraft && !ct.khataUploaded && (
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
              <Upload className="w-3 h-3" /> Khata Pending
            </span>
          )}
          {isDraft && ct.khataUploaded && (
            <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
              <CheckCircle2 className="w-3 h-3" /> Khata Uploaded
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Calendar, label: 'Date Held',    value: ct.heldOn ? formatDate(ct.heldOn, 'dd MMM yyyy') : 'Not set' },
            { icon: BookOpen, label: 'Total Marks',  value: String(ct.maxMarks) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl space-y-1"
              style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#475569' }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Khata scripts (teacher) */}
        {teacher && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Khata Scripts</p>
            <div className="grid grid-cols-3 gap-2">
              {khataSlots.map(slot => (
                <div key={slot.key} className="p-3 rounded-xl text-center space-y-1.5 transition-all"
                  style={slot.url
                    ? { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }
                    : { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  {slot.url ? (
                    <a href={slot.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                      <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: '#34d399' }} />
                      <p className="text-[10.5px]" style={{ color: '#475569' }}>{slot.label}</p>
                      <p className="text-[11px] font-bold group-hover:underline" style={{ color: '#818cf8' }}>View File</p>
                    </a>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mx-auto" style={{ color: '#334155' }} />
                      <p className="text-[10.5px]" style={{ color: '#475569' }}>{slot.label}</p>
                      <p className="text-[10px]" style={{ color: '#334155' }}>Not uploaded</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student result */}
        {!teacher && isPublished && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Your Result</p>
            <StudentMarkSection ctEventId={ct.id} maxMarks={ct.maxMarks} />
          </div>
        )}
        {!teacher && isDraft && (
          <div className="p-4 rounded-xl text-sm text-center"
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', color: '#475569' }}>
            Results will be visible once the teacher publishes this CT.
          </div>
        )}

        {/* Teacher actions */}
        {teacher && (
          <div className="space-y-2 pt-1">
            {isDraft && onUploadKhata && (
              <ActionBtn
                variant={ct.khataUploaded ? 'secondary' : 'primary'}
                icon={Upload}
                label={ct.khataUploaded ? 'Re-upload Khata Scripts' : 'Upload Khata Scripts'}
                onClick={() => { onClose(); onUploadKhata(ct) }} />
            )}
            {isDraft && ct.khataUploaded && onEnterMarks && (
              <ActionBtn variant="amber" icon={ClipboardList} label="Enter / Edit Marks" onClick={() => { onClose(); onEnterMarks(ct) }} />
            )}
            {isDraft && ct.khataUploaded && onPublish && (
              <ActionBtn variant="success" icon={Send} label="Publish Results to Students" onClick={() => { onClose(); onPublish(ct.id) }} />
            )}
            {isPublished && onUnpublish && (
              <ActionBtn variant="amber" icon={EyeOff} label="Unpublish" onClick={() => { onClose(); onUnpublish(ct.id) }} />
            )}
            {isPublished && !onUnpublish && (
              <div className="p-3 rounded-xl text-[12px] text-center"
                style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' }}>
                ✓ Published — Students can view their marks
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'amber' | 'success'
const VARIANT_STYLES: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', border: 'none' },
  secondary: { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' },
  amber:     { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' },
  success:   { background: 'linear-gradient(135deg,rgba(52,211,153,0.9),rgba(16,185,129,0.9))', color: '#fff', border: 'none' },
}
function ActionBtn({ icon: Icon, label, onClick, variant }: { icon: any; label: string; onClick: () => void; variant: BtnVariant }) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold"
      style={VARIANT_STYLES[variant]}>
      <Icon className="w-4 h-4" /> {label}
    </motion.button>
  )
}