import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { FolderPlus } from 'lucide-react'
import Modal from '@/components/ui/Modal'

const schema = z.object({
  title:       z.string().min(1, 'Folder name is required').max(60, 'Too long'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string }) => void
  isLoading?: boolean
}

const INPUT_BASE: React.CSSProperties = {
  width: '100%', background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13,
  outline: 'none', transition: 'border-color 0.2s',
}

export default function CreateFolderModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const handleClose = () => { reset(); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Folder" size="sm">
      <form onSubmit={handleSubmit(d => onSubmit(d))} className="space-y-4">

        {/* Icon */}
        <div className="flex items-center justify-center py-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', boxShadow: '0 4px 20px rgba(251,191,36,0.2)' }}>
            <FolderPlus className="w-8 h-8" style={{ color: '#fbbf24' }} />
          </motion.div>
        </div>

        {/* Folder name */}
        <div>
          <label className="block text-[12px] font-bold mb-1.5" style={{ color: '#64748b' }}>
            Folder Name <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            {...register('title')}
            placeholder="e.g. Week 1 Slides"
            autoFocus
            style={INPUT_BASE}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.title ? 'rgba(248,113,113,0.5)' : 'rgba(99,102,241,0.2)'}
          />
          {errors.title && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: '#f87171' }}>{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[12px] font-bold mb-1.5" style={{ color: '#64748b' }}>Description (optional)</label>
          <textarea
            {...register('description')}
            rows={2} placeholder="What's in this folder?"
            style={{ ...INPUT_BASE, resize: 'none' }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.2)'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(251,191,36,0.35)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.9),rgba(245,158,11,0.9))', color: '#111', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" /> Creating...</>
              : <><FolderPlus className="w-4 h-4" /> Create Folder</>
            }
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}