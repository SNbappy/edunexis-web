import { BookOpen, User, Hash, GraduationCap, Calendar, Clock, Award, Eye, EyeOff, Copy, Check, Users, Layers } from 'lucide-react'
import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import type { CourseDto } from '@/types/course.types'

interface Props { course: CourseDto }

export default function CourseInfoCard({ course }: Props) {
  const [codeVisible, setCodeVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    if (!course.joiningCode) return
    navigator.clipboard.writeText(course.joiningCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const items = [
    { icon: Hash,          label: 'Course Code',  value: course.courseCode,                  color: '#818cf8' },
    { icon: GraduationCap, label: 'Semester',      value: course.semester,                    color: '#34d399' },
    { icon: Calendar,      label: 'Session',       value: course.academicSession,             color: '#fbbf24' },
    { icon: Award,         label: 'Credits',       value: `${course.creditHours} Hours`,      color: '#f472b6' },
    { icon: Layers,        label: 'Type',          value: course.courseType,                  color: '#38bdf8' },
    { icon: Users,         label: 'Members',       value: `${course.memberCount} students`,   color: '#4ade80' },
    ...(course.section ? [{ icon: BookOpen, label: 'Section', value: course.section, color: '#a78bfa' }] : []),
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,16,34,0.85)', border: '1px solid rgba(99,102,241,0.12)' }}>

      {/* Teacher header */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'rgba(99,102,241,0.5)' }}>Instructor</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ border: '2px solid rgba(99,102,241,0.35)', flexShrink: 0 }}>
            <Avatar src={course.teacherProfilePhotoUrl} name={course.teacherName} size="md" className="w-full h-full" />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>{course.teacherName}</p>
            <p className="text-[11px]" style={{ color: '#334155' }}>{course.department}</p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="p-4 space-y-3" style={{ borderBottom: course.joiningCode || course.description ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold" style={{ color: '#334155' }}>{item.label}</p>
                <p className="text-[12.5px] font-bold truncate" style={{ color: '#94a3b8' }}>{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Joining code */}
      {course.joiningCode && (
        <div className="p-4" style={{ borderBottom: course.description ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.5)' }}>Join Code</p>
            <button onClick={() => setCodeVisible(v => !v)} className="flex items-center gap-1 text-[10px] font-bold transition-colors" style={{ color: '#6366f1' }}>
              {codeVisible ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
            </button>
          </div>
          {codeVisible
            ? <button onClick={copyCode} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <span className="text-[18px] font-black font-mono tracking-[0.3em]" style={{ color: '#818cf8' }}>{course.joiningCode}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: copied ? '#34d399' : '#6366f1' }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </span>
              </button>
            : <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <span className="text-[18px] font-black tracking-[0.3em] select-none" style={{ color: 'rgba(99,102,241,0.15)' }}>
                  {'�'.repeat(course.joiningCode.length)}
                </span>
              </div>
          }
        </div>
      )}

      {/* Description */}
      {course.description && (
        <div className="p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: 'rgba(99,102,241,0.5)' }}>About</p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#334155' }}>{course.description}</p>
        </div>
      )}
    </div>
  )
}
