import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Folder, FileText } from 'lucide-react'
import gsap from 'gsap'
import MaterialCard from './MaterialCard'
import type { MaterialDto } from '@/types/material.types'

interface Props {
  materials: MaterialDto[]
  courseId: string
  isFlattenMode?: boolean
  onDelete?: (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
}

function SectionLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <div className="w-5 h-5 flex items-center justify-center" style={{ color: 'rgba(129,140,248,0.5)' }}>
        {icon}
      </div>
      <span className="text-[10.5px] font-extrabold tracking-widest uppercase"
        style={{ color: 'rgba(129,140,248,0.45)' }}>{label}</span>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
        style={{ background: 'rgba(99,102,241,0.1)', color: 'rgba(129,140,248,0.5)', border: '1px solid rgba(99,102,241,0.15)' }}>
        {count}
      </span>
      <div className="flex-1 h-[1px]" style={{ background: 'rgba(99,102,241,0.08)' }} />
    </div>
  )
}

export default function MaterialsList({ materials, courseId, isFlattenMode, onDelete, onOpenFolder }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current || !materials.length) return
    const items = listRef.current.querySelectorAll('.material-row')
    gsap.fromTo(items,
      { opacity: 0, y: 14, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'power2.out', stagger: 0.05 }
    )
  }, [materials.length, isFlattenMode])

  if (materials.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
        style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.6),rgba(6,13,31,0.8))', border: '1px dashed rgba(99,102,241,0.15)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <FolderOpen className="w-8 h-8" style={{ color: '#818cf8' }} strokeWidth={1.5} />
        </div>
        <p className="text-base font-bold mb-1" style={{ color: '#e2e8f0' }}>No materials found</p>
        <p className="text-sm" style={{ color: '#475569' }}>Upload files, create folders, or add links to share with students</p>
      </motion.div>
    )
  }

  if (isFlattenMode) {
    return (
      <div ref={listRef} className="space-y-2">
        <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="All Files" count={materials.length} />
        {materials.map((m, i) => (
          <div key={m.id} className="material-row">
            <MaterialCard material={m} index={i} courseId={courseId} onDelete={onDelete} />
          </div>
        ))}
      </div>
    )
  }

  const folders = materials.filter(m => m.type === 'Folder')
  const files   = materials.filter(m => m.type !== 'Folder')

  return (
    <div ref={listRef} className="space-y-5">
      {folders.length > 0 && (
        <div>
          <SectionLabel icon={<Folder className="w-3.5 h-3.5" />} label="Folders" count={folders.length} />
          <div className="space-y-2">
            {folders.map((m, i) => (
              <div key={m.id} className="material-row">
                <MaterialCard material={m} index={i} courseId={courseId} onDelete={onDelete} onOpenFolder={onOpenFolder} />
              </div>
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div>
          <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="Files & Links" count={files.length} />
          <div className="space-y-2">
            {files.map((m, i) => (
              <div key={m.id} className="material-row">
                <MaterialCard material={m} index={i} courseId={courseId} onDelete={onDelete} onOpenFolder={onOpenFolder} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}