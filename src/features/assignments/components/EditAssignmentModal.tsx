import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { AssignmentDto, UpdateAssignmentRequest } from '@/types/assignment.types'

const schema = z.object({
  title:               z.string().min(3, 'At least 3 characters'),
  instructions:        z.string().optional(),
  deadline:            z.string().min(1, 'Required'),
  maxMarks:            z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes:         z.string().optional(),
})
type FormData = z.infer<typeof schema>
interface Props { isOpen: boolean; onClose: () => void; assignment: AssignmentDto; onSubmit: (d: UpdateAssignmentRequest) => void; isLoading?: boolean }

function pad(n: number) { return String(n).padStart(2,'0') }
function toLocal(iso: string) { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }

const S = {
  label:    { display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 } as React.CSSProperties,
  input:    { width:'100%', background:'rgba(6,13,31,0.7)', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', transition:'border-color 0.2s' } as React.CSSProperties,
  textarea: { width:'100%', background:'rgba(6,13,31,0.7)', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', resize:'none' as const, transition:'border-color 0.2s' } as React.CSSProperties,
  error:    { fontSize:11, color:'#f87171', marginTop:4, fontWeight:600 } as React.CSSProperties,
}
const focus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')
const blur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')

export default function EditAssignmentModal({ isOpen, onClose, assignment, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: assignment.title, instructions: assignment.instructions ?? '',
      deadline: toLocal(assignment.deadline), maxMarks: assignment.maxMarks,
      allowLateSubmission: assignment.allowLateSubmission, rubricNotes: assignment.rubricNotes ?? '',
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment" size="xl">
      <form onSubmit={handleSubmit(d => onSubmit({ ...d, deadline: new Date(d.deadline).toISOString() }))} className="space-y-4">

        <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <Pencil className="w-5 h-5" style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>Edit Assignment</p>
            <p className="text-[11px] truncate max-w-xs" style={{ color: '#475569' }}>{assignment.title}</p>
          </div>
        </div>

        <div>
          <label style={S.label}>Title <span style={{ color:'#f87171' }}>*</span></label>
          <input {...register('title')} placeholder="Assignment title" style={S.input} onFocus={focus} onBlur={blur} />
          {errors.title && <p style={S.error}>{errors.title.message}</p>}
        </div>

        <div>
          <label style={S.label}>Instructions (optional)</label>
          <textarea {...register('instructions')} rows={4} placeholder="Detailed instructions..." style={S.textarea} onFocus={focus} onBlur={blur} />
        </div>

        <div>
          <label style={S.label}>Rubric / Grading Criteria (optional)</label>
          <textarea {...register('rubricNotes')} rows={2} placeholder="Grading criteria..." style={S.textarea} onFocus={focus} onBlur={blur} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={S.label}>Deadline</label>
            <input {...register('deadline')} type="datetime-local" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.deadline && <p style={S.error}>{errors.deadline.message}</p>}
          </div>
          <div>
            <label style={S.label}>Max Marks</label>
            <input {...register('maxMarks')} type="number" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.maxMarks && <p style={S.error}>{errors.maxMarks.message}</p>}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <input type="checkbox" {...register('allowLateSubmission')} className="w-4 h-4 accent-indigo-500" />
          <span className="text-[13px] font-semibold" style={{ color: '#94a3b8' }}>Allow late submission</span>
        </label>

        <div className="flex gap-3 pt-1">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(251,191,36,0.35)' }}
            whileTap={{ scale: 0.97 }} disabled={!!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.9),rgba(245,158,11,0.9))', color: '#111', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" /> Saving...</>
              : 'Save Changes'
            }
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}