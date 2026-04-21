import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { FolderOpen, Folder, FileText } from "lucide-react"
import gsap from "gsap"
import MaterialCard from "./MaterialCard"
import { useThemeStore } from "@/store/themeStore"
import type { MaterialDto } from "@/types/material.types"

interface Props {
  materials:      MaterialDto[]
  courseId:       string
  isFlattenMode?: boolean
  onDelete?:      (id: string) => void
  onOpenFolder?:  (id: string, label: string) => void
}

function SectionLabel({ icon, label, count, dark }: { icon: React.ReactNode; label: string; count: number; dark: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <div style={{ color: dark ? "rgba(99,102,241,0.5)" : "#9ca3af", display: "flex" }}>{icon}</div>
      <span className="text-[10.5px] font-bold tracking-widest uppercase"
        style={{ color: dark ? "rgba(99,102,241,0.5)" : "#9ca3af" }}>{label}</span>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
        style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", color: dark ? "rgba(165,180,252,0.6)" : "#6366f1", border: dark ? "1px solid rgba(99,102,241,0.15)" : "1px solid #c7d2fe" }}>
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: dark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }} />
    </div>
  )
}

export default function MaterialsList({ materials, courseId, isFlattenMode, onDelete, onOpenFolder }: Props) {
  const { dark } = useThemeStore()
  const listRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current || !materials.length) return
    const items = listRef.current.querySelectorAll(".material-row")
    gsap.fromTo(items,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", stagger: 0.04 }
    )
  }, [materials.length, isFlattenMode])

  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"

  if (materials.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: dark ? "rgba(217,119,6,0.12)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a" }}>
          <FolderOpen style={{ width: 28, height: 28, color: "#d97706" }} strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold mb-1" style={{ color: textMain }}>No materials found</p>
        <p className="text-[13px]" style={{ color: textSub }}>
          Upload files, create folders, or add links to share with students
        </p>
      </motion.div>
    )
  }

  if (isFlattenMode) {
    return (
      <div ref={listRef} className="space-y-2">
        <SectionLabel icon={<FileText style={{ width: 13, height: 13 }} />} label="All Files" count={materials.length} dark={dark} />
        {materials.map((m, i) => (
          <div key={m.id} className="material-row">
            <MaterialCard material={m} index={i} courseId={courseId} onDelete={onDelete} />
          </div>
        ))}
      </div>
    )
  }

  const folders = materials.filter(m => m.type === "Folder")
  const files   = materials.filter(m => m.type !== "Folder")

  return (
    <div ref={listRef} className="space-y-5">
      {folders.length > 0 && (
        <div>
          <SectionLabel icon={<Folder style={{ width: 13, height: 13 }} />} label="Folders" count={folders.length} dark={dark} />
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
          <SectionLabel icon={<FileText style={{ width: 13, height: 13 }} />} label="Files & Links" count={files.length} dark={dark} />
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
