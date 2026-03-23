import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Hash, User, BookOpen, Calendar, GraduationCap, Award, Clock, Layers,
  Eye, EyeOff, Copy, Check, Archive, Trash2, Settings, AlertTriangle,
} from 'lucide-react'
import type { CourseDto } from '@/types/course.types'
import Button from '@/components/ui/Button'
import EditCourseModal from './EditCourseModal'
import { useCourseDetail } from '../hooks/useCourseDetail'

interface Props {
  isOpen: boolean
  onClose: () => void
  course: CourseDto
  canManage?: boolean
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function CourseDetailsModal({ isOpen, onClose, course, canManage, onArchive, onDelete }: Props) {
  const [codeVisible, setCodeVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { updateCourse, isUpdating } = useCourseDetail(course.id)

  const copyCode = () => {
    navigator.clipboard.writeText(course.joiningCode!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const info = [
    { icon: <Hash className="w-3.5 h-3.5" />, label: 'Course Code', value: course.courseCode },
    { icon: <User className="w-3.5 h-3.5" />, label: 'Teacher', value: course.teacherName },
    { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Department', value: course.department },
    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Session', value: course.academicSession },
    { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Semester', value: course.semester },
    { icon: <Award className="w-3.5 h-3.5" />, label: 'Credits', value: `${course.creditHours} Credit Hours` },
    { icon: <Clock className="w-3.5 h-3.5" />, label: 'Type', value: course.courseType },
    ...(course.section ? [{ icon: <Layers className="w-3.5 h-3.5" />, label: 'Section', value: course.section }] : []),
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-start gap-3 p-5 border-b border-border">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-foreground text-lg leading-tight truncate">{course.title}</h2>
                <p className="text-xs text-primary font-mono mt-0.5">{course.courseCode}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-3">
                {info.map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground truncate">{item.value ?? 'â€”'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {course.joiningCode && canManage && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joining Code</p>
                    <button onClick={() => setCodeVisible(v => !v)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 font-medium transition-colors">
                      {codeVisible ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> View</>}
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {codeVisible ? (
                      <motion.button key="vis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={copyCode}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <span className="text-2xl font-bold text-primary font-mono tracking-widest">{course.joiningCode}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          {copied
                            ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
                            : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </span>
                      </motion.button>
                    ) : (
                      <motion.div key="hid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-4 py-3 rounded-xl bg-card border border-border">
                        <span className="text-2xl font-bold text-muted-foreground/25 tracking-widest select-none">
                          {'•'.repeat(course.joiningCode.length)}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-muted-foreground">Share with students to join</p>
                </div>
              )}

              {course.description && (
                <div className="p-4 rounded-xl bg-muted/50 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{course.description}</p>
                </div>
              )}

              <AnimatePresence>
                {confirmDelete && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-destructive">Delete this course?</p>
                          <p className="text-xs text-muted-foreground mt-0.5">All data including attendance, assignments and materials will be permanently removed.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/70 transition-colors">Cancel</button>
                        <button onClick={() => { onDelete?.(course.id); setConfirmDelete(false); onClose() }}
                          className="flex-1 py-2 rounded-xl text-sm font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors">Yes, Delete</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {canManage && !confirmDelete && (
              <div className="p-4 border-t border-border space-y-2">
                <Button onClick={() => setEditOpen(true)} leftIcon={<Settings className="w-4 h-4" />} className="w-full" size="sm">
                  Edit Course
                </Button>
                <div className="flex gap-2">
                  {onArchive && (
                    <button onClick={() => { onArchive(course.id); onClose() }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/70 transition-colors">
                      <Archive className="w-3.5 h-3.5" /> {course.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => setConfirmDelete(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <EditCourseModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            course={course}
            onSubmit={(data) => updateCourse(data, { onSuccess: () => setEditOpen(false) })}
            loading={isUpdating}
          />
        </>
      )}
    </AnimatePresence>
  )
}
