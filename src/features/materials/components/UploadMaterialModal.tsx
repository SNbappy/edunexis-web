import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import FileDropzone from '@/components/ui/FileDropzone'

interface Props {
  isOpen: boolean
  onClose: () => void
  onUploadFile: (payload: { file: File; title?: string; description?: string; onProgress: (n: number) => void }) => void
  isUploading?: boolean
}

export default function UploadMaterialModal({ isOpen, onClose, onUploadFile, isUploading }: Props) {
  const [files, setFiles]           = useState<File[]>([])
  const [fileTitle, setFileTitle]   = useState('')
  const [fileDesc, setFileDesc]     = useState('')
  const [progress, setProgress]     = useState(0)

  const handleClose = () => { setFiles([]); setFileTitle(''); setFileDesc(''); setProgress(0); onClose() }

  const handleUpload = () => {
    if (!files.length) return
    files.forEach(file => onUploadFile({ file, title: fileTitle || file.name, description: fileDesc || undefined, onProgress: setProgress }))
  }

  const INPUT_STYLE = {
    width: '100%', background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)',
    color: '#e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13,
    outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload File" size="md">
      <div className="space-y-4">

        {/* Dropzone */}
        <FileDropzone onFilesSelected={setFiles} />

        {/* File details */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3 p-4 rounded-2xl"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>

              {/* Selected files list */}
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(6,13,31,0.5)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <FileText className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
                    <span className="flex-1 truncate text-[12.5px] font-medium" style={{ color: '#e2e8f0' }}>{f.name}</span>
                    <span className="text-[11px] shrink-0" style={{ color: '#475569' }}>
                      {(f.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                      <X className="w-3.5 h-3.5 transition-colors" style={{ color: '#475569' }}
                        onMouseEnter={e => (e.currentTarget as SVGElement).style.color = '#f87171'}
                        onMouseLeave={e => (e.currentTarget as SVGElement).style.color = '#475569'} />
                    </button>
                  </div>
                ))}
              </div>

              {files.length === 1 && (
                <>
                  <input
                    value={fileTitle} onChange={e => setFileTitle(e.target.value)}
                    placeholder={`Title (default: ${files[0]?.name})`}
                    style={INPUT_STYLE}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.2)'}
                  />
                  <textarea
                    value={fileDesc} onChange={e => setFileDesc(e.target.value)}
                    placeholder="Description (optional)" rows={2}
                    style={{ ...INPUT_STYLE, resize: 'none' }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.2)'}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {isUploading && progress > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold" style={{ color: '#818cf8' }}>
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                  style={{ background: 'linear-gradient(90deg,#4f46e5,#06b6d4)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }} />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#34d399' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Upload complete!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button
            whileHover={files.length ? { scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' } : {}}
            whileTap={files.length ? { scale: 0.97 } : {}}
            onClick={handleUpload}
            disabled={!files.length || !!isUploading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: files.length ? 'linear-gradient(135deg,#4f46e5,#06b6d4)' : 'rgba(99,102,241,0.1)',
              color: files.length ? '#fff' : '#334155',
              opacity: isUploading ? 0.7 : 1,
            }}>
            {isUploading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Uploading...</>
              : <><Upload className="w-4 h-4" /> Upload {files.length > 1 ? `${files.length} Files` : 'File'}</>
            }
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}