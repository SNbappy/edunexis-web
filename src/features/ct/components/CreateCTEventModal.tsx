import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { CreateCTEventRequest } from '@/types/ct.types'

const schema = z.object({
  title:    z.string().min(3, 'At least 3 characters').max(100),
  maxMarks: z.coerce.number().min(1, 'At least 1').max(500),
  heldOn:   z.string().optional().nullable(),
})
type FormData = z.infer<typeof schema>
interface Props { isOpen: boolean; onClose: () => void; courseId: string; onSubmit: (d: CreateCTEventRequest) => void; isLoading?: boolean }

const S = {
  label:  { display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:6 } as React.CSSProperties,
  input:  { width:'100%', background:'rgba(6,13,31,0.7)', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', transition:'border-color 0.2s' } as React.CSSProperties,
  error:  { fontSize:11, color:'#f87171', marginTop:4, fontWeight:600 } as React.CSSProperties,
}
const focus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')
const blur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')

export default function CreateCTEventModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: 20, heldOn: null },
  })
  const handleClose = () => { reset(); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New CT" size="md">
      <form onSubmit={handleSubmit(d => onSubmit({ title: d.title, maxMarks: d.maxMarks, heldOn: d.heldOn || null }))} className="space-y-4">

        {/* Icon header */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.13)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <ClipboardList className="w-5 h-5" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>New Class Test</p>
            <p className="text-[11px]" style={{ color: '#475569' }}>CT number is assigned automatically</p>
          </div>
        </div>

        <div>
          <label style={S.label}>CT Title <span style={{ color:'#f87171' }}>*</span></label>
          <input {...register('title')} placeholder='e.g. "Chapter 3 — Linked Lists"' style={S.input} onFocus={focus} onBlur={blur} />
          {errors.title && <p style={S.error}>{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={S.label}>Total Marks <span style={{ color:'#f87171' }}>*</span></label>
            <input {...register('maxMarks')} type="number" placeholder="20" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.maxMarks && <p style={S.error}>{errors.maxMarks.message}</p>}
          </div>
          <div>
            <label style={S.label}>Date Held (optional)</label>
            <input {...register('heldOn')} type="date" style={S.input} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <span className="text-[16px] mt-0.5">💡</span>
          <p className="text-[11.5px] leading-relaxed" style={{ color: '#78716c' }}>
            After creating, upload the <strong style={{ color: '#fbbf24' }}>Best</strong>, <strong style={{ color: '#fbbf24' }}>Worst</strong>, and <strong style={{ color: '#fbbf24' }}>Average</strong> khata scripts before entering marks.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.97 }} disabled={!!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating...</>
              : 'Create CT'
            }
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}