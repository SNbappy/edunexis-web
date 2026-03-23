import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, X, Upload, CheckCircle2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useCTMarks } from '../hooks/useCTEvents'
import type { CTEventDto } from '@/types/ct.types'

interface Member { userId: string; fullName: string; studentId?: string }
interface Props { isOpen: boolean; onClose: () => void; ct: CTEventDto | null; members: Member[] }

interface KhataSlot {
  key: 'best' | 'worst' | 'avg'
  label: string
  description: string
  emoji: string
  fileKey: 'bestCopy' | 'worstCopy' | 'avgCopy'
  studentKey: 'bestStudentId' | 'worstStudentId' | 'avgStudentId'
  accent: string
  accentBg: string
}

const SLOTS: KhataSlot[] = [
  { key: 'best',  label: 'Best Script',    description: 'Highest scorer',   emoji: '🏆', fileKey: 'bestCopy',  studentKey: 'bestStudentId',  accent: '#34d399', accentBg: 'rgba(52,211,153,0.08)'  },
  { key: 'worst', label: 'Worst Script',   description: 'Lowest scorer',    emoji: '📉', fileKey: 'worstCopy', studentKey: 'worstStudentId', accent: '#f87171', accentBg: 'rgba(248,113,113,0.08)' },
  { key: 'avg',   label: 'Average Script', description: 'Mid-range scorer', emoji: '📊', fileKey: 'avgCopy',   studentKey: 'avgStudentId',   accent: '#818cf8', accentBg: 'rgba(129,140,248,0.08)' },
]

export default function UploadKhataModal({ isOpen, onClose, ct, members }: Props) {
  const ctId = ct?.id ?? ''
  const { uploadKhata, isUploading } = useCTMarks(ctId)
  const [files,    setFiles]    = useState<Partial<Record<KhataSlot['fileKey'], File>>>({})
  const [students, setStudents] = useState<Partial<Record<KhataSlot['studentKey'], string>>>({})

  const refs = {
    bestCopy:  useRef<HTMLInputElement>(null),
    worstCopy: useRef<HTMLInputElement>(null),
    avgCopy:   useRef<HTMLInputElement>(null),
  }

  const handleClose = () => { setFiles({}); setStudents({}); onClose() }
  const setFile = (key: KhataSlot['fileKey'], file: File | undefined) =>
    setFiles(prev => { const n = { ...prev }; if (file) n[key] = file; else delete n[key]; return n })

  const handleSubmit = () => {
    if (!files.bestCopy || !files.worstCopy || !files.avgCopy) return
    const fd = new FormData()
    fd.append('bestCopy',  files.bestCopy)
    fd.append('worstCopy', files.worstCopy)
    fd.append('avgCopy',   files.avgCopy)
    if (students.bestStudentId)  fd.append('bestStudentId',  students.bestStudentId)
    if (students.worstStudentId) fd.append('worstStudentId', students.worstStudentId)
    if (students.avgStudentId)   fd.append('avgStudentId',   students.avgStudentId)
    uploadKhata(fd, { onSuccess: handleClose })
  }

  const fileCount   = Object.keys(files).length
  const allSelected = fileCount === 3
  if (!ct) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Upload Khata — CT ${ct.ctNumber}`}
      description="Upload all 3 answer script copies before entering marks" size="lg">
      <div className="space-y-3">

        {/* Progress indicator */}
        <div className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          {SLOTS.map((slot, i) => (
            <div key={slot.key} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-[2px] rounded-full" style={{ background: files[slot.fileKey] ? '#34d399' : 'rgba(99,102,241,0.15)' }} />}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={files[slot.fileKey]
                  ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }
                  : { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', color: '#334155' }}>
                {files[slot.fileKey] ? <CheckCircle2 className="w-3 h-3" /> : <span>{i+1}</span>}
                {slot.label}
              </div>
            </div>
          ))}
        </div>

        {/* Slot cards */}
        {SLOTS.map(slot => {
          const file = files[slot.fileKey]
          return (
            <div key={slot.key} className="p-4 rounded-xl space-y-3 transition-all"
              style={file
                ? { background: slot.accentBg, border: `1px solid ${slot.accent}40` }
                : { background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{slot.emoji}</span>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>{slot.label}</p>
                    <p className="text-[11px]" style={{ color: '#475569' }}>{slot.description}</p>
                  </div>
                </div>
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0" style={{ color: slot.accent }} />
                    <span className="text-[12px] font-bold max-w-[120px] truncate" style={{ color: slot.accent }}>{file.name}</span>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => { setFile(slot.fileKey, undefined); const r = refs[slot.fileKey]; if (r.current) r.current.value = '' }}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => refs[slot.fileKey].current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{ background: `${slot.accent}15`, border: `1px dashed ${slot.accent}50`, color: slot.accent }}>
                    <Upload className="w-3.5 h-3.5" /> Choose File
                  </motion.button>
                )}
                <input ref={refs[slot.fileKey]} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden" onChange={e => setFile(slot.fileKey, e.target.files?.[0])} />
              </div>

              {members.length > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                  <p className="text-[11px] font-bold shrink-0" style={{ color: '#475569' }}>Student (optional):</p>
                  <select value={students[slot.studentKey] ?? ''}
                    onChange={e => setStudents(prev => ({ ...prev, [slot.studentKey]: e.target.value || undefined }))}
                    className="flex-1 h-8 rounded-lg text-xs px-2 focus:outline-none transition-all"
                    style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>
                    <option value="">Select student…</option>
                    {members.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName}{m.studentId ? ` (${m.studentId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        })}

        {/* Hint */}
        <p className="text-[11.5px] px-3 py-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', color: '#475569' }}>
          Accepted: PDF, JPG, PNG, DOC, DOCX · All 3 files required before entering marks
        </p>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button
            whileHover={allSelected ? { scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' } : {}}
            whileTap={allSelected ? { scale: 0.97 } : {}}
            onClick={handleSubmit} disabled={!allSelected || isUploading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: allSelected ? 'linear-gradient(135deg,#4f46e5,#06b6d4)' : 'rgba(99,102,241,0.08)', color: allSelected ? '#fff' : '#334155', opacity: isUploading ? 0.7 : 1 }}>
            {isUploading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Uploading...</>
              : allSelected
                ? <><Upload className="w-4 h-4" /> Upload All 3 Khata</>
                : `Select ${3 - fileCount} More File${3 - fileCount === 1 ? '' : 's'}`
            }
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}