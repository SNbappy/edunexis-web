import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { addDays } from 'date-fns'
import type { CreateAssignmentRequest } from '@/types/assignment.types'

const schema = z.object({
  title:               z.string().min(3, 'At least 3 characters'),
  instructions:        z.string().optional(),
  deadline:            z.string().min(1, 'Due date is required'),
  maxMarks:            z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes:         z.string().optional(),
})
type FormData = z.infer<typeof schema>
interface Props { isOpen: boolean; onClose: () => void; onSubmit: (d: CreateAssignmentRequest) => void; isLoading?: boolean }

function pad(n: number) { return String(n).padStart(2,'0') }
function toLocal(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }

const S = {
  label:    { display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 } as React.CSSProperties,
  input:    { width:'100%', background:'rgba(6,13,31,0.7)', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', transition:'border-color 0.2s' } as React.CSSProperties,
  textarea: { width:'100%', background:'rgba(6,13,31,0.7)', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', resize:'none' as const, transition:'border-color 0.2s' } as React.CSSProperties,
  error:    { fontSize:11, color:'#f87171', marginTop:4, fontWeight:600 } as React.CSSProperties,
}
const focus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')
const blur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')

export default function CreateAssignmentModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: 100, allowLateSubmission: false, deadline: toLocal(addDays(new Date(), 7)) },
  })
  const handleClose = () => { reset(); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Assignment" size="xl">
      <form onSubmit={handleSubmit(d => onSubmit({ ...d, deadline: new Date(d.deadline).toISOString() }))} className="space-y-4">

        {/* Icon header */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.13)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <ClipboardList className="w-5 h-5" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>New Assignment</p>
            <p className="text-[11px]" style={{ color: '#475569' }}>Fill in the details below</p>
          </div>
        </div>

        <div>
          <label style={S.label}>Title <span style={{ color:'#f87171' }}>*</span></label>
          <input {...register('title')} placeholder="e.g. Assignment 1 - Linked Lists" style={S.input} onFocus={focus} onBlur={blur} />
          {errors.title && <p style={S.error}>{errors.title.message}</p>}
        </div>

        <div>
          <label style={S.label}>Instructions (optional)</label>
          <textarea {...register('instructions')} rows={4} placeholder="Detailed instructions for students..." style={S.textarea} onFocus={focus} onBlur={blur} />
        </div>

        <div>
          <label style={S.label}>Rubric / Grading Criteria (optional)</label>
          <textarea {...register('rubricNotes')} rows={2} placeholder="e.g. 30% code quality, 40% output..." style={S.textarea} onFocus={focus} onBlur={blur} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={S.label}>Deadline <span style={{ color:'#f87171' }}>*</span></label>
            <input {...register('deadline')} type="datetime-local" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.deadline && <p style={S.error}>{errors.deadline.message}</p>}
          </div>
          <div>
            <label style={S.label}>Max Marks <span style={{ color:'#f87171' }}>*</span></label>
            <input {...register('maxMarks')} type="number" placeholder="100" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.maxMarks && <p style={S.error}>{errors.maxMarks.message}</p>}
          </div>
        </div>

        {/* Late submission toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl transition-colors"
          style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <input type="checkbox" {...register('allowLateSubmission')} className="sr-only peer" id="late" />
          <div className="w-9 h-5 rounded-full relative transition-all peer-checked:bg-indigo-500 bg-slate-700 shrink-0">
            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: '#94a3b8' }}>Allow late submission</span>
        </label>

        <div className="flex gap-3 pt-1">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating...</>
              : 'Create Assignment'
            }
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}