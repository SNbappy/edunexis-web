import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar, Clock, MapPin, MoreVertical, Eye, Trash2,
    Send, ClipboardList, Star, XCircle, FileCheck2, Users, Award,
} from "lucide-react"
import { formatDate } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { PresentationDto } from "@/types/presentation.types"

interface PresentationCardProps {
    presentation: PresentationDto
    index?: number
    onView: (p: PresentationDto) => void
    onDelete?: () => void
    onUpdateStatus?: (id: string, status: string) => void
    onEnterMarks?: (p: PresentationDto) => void
}

interface MenuItemProps {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    label: string
    variant: "default" | "danger" | "primary"
    onClick: () => void
}

function MenuItem({ icon: Icon, label, variant, onClick }: MenuItemProps) {
    const colorClass =
        variant === "danger"
            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            : "text-foreground hover:bg-teal-50 dark:hover:bg-teal-950/30"

    const iconClass =
        variant === "danger"
            ? "text-red-600"
            : variant === "primary"
                ? "text-amber-700 dark:text-amber-300"
                : "text-teal-700 dark:text-teal-300"

    return (
        <button
            type="button"
            onClick={onClick}
            className={"flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors " + colorClass}
        >
            <Icon className={"h-3.5 w-3.5 " + iconClass} strokeWidth={2} />
            {label}
        </button>
    )
}

export default function PresentationCard({
    presentation: p, index = 0,
    onView, onDelete, onUpdateStatus, onEnterMarks,
}: PresentationCardProps) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? "Student")
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isScheduled = p.status === "Scheduled"
    const isOngoing = p.status === "Ongoing"
    const isCompleted = p.status === "Completed"
    const isCancelled = p.status === "Cancelled"

    /* Status-driven palette (semantic, not feature-specific) */
    const statusBadge = isCompleted
        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        : isOngoing
            ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            : isCancelled
                ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                : "border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"

    const stripeClass = isCompleted
        ? "bg-emerald-500"
        : isOngoing
            ? "bg-amber-500"
            : isCancelled
                ? "bg-red-500"
                : "bg-teal-500"

    const hasMenu = teacher && (onEnterMarks || (onUpdateStatus && (isScheduled || isOngoing)) || onDelete)

    useEffect(() => {
        if (!menuOpen) return
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", h)
        return () => document.removeEventListener("mousedown", h)
    }, [menuOpen])

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.25 }}
            onClick={() => onView(p)}
            whileHover={{ y: -2 }}
            className={
                "group relative cursor-pointer rounded-2xl border border-border bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all hover:border-teal-200 hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.18)] dark:hover:border-teal-800 " +
                (menuOpen ? "z-30" : "z-0")
            }
        >
            <div
                className={"pointer-events-none absolute bottom-3 left-0 top-3 w-[3px] rounded-full " + stripeClass}
                aria-hidden
            />

            <div className="flex items-start gap-3 px-5 py-4 pl-6">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                    <FileCheck2 className="h-4 w-4" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="line-clamp-2 font-display text-[14px] font-bold leading-snug text-foreground">
                            {p.title}
                        </h3>

                        <div className="flex shrink-0 items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider " + statusBadge}>
                                {p.status}
                            </span>

                            {hasMenu && (
                                <div className="relative" ref={menuRef}>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                                        aria-label="Test actions"
                                        aria-expanded={menuOpen}
                                        className={
                                            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors " +
                                            (menuOpen
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground")
                                        }
                                    >
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {menuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                                                transition={{ duration: 0.12 }}
                                                className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <MenuItem
                                                    icon={Eye}
                                                    label="View details"
                                                    variant="default"
                                                    onClick={() => { onView(p); setMenuOpen(false) }}
                                                />

                                                {teacher && onEnterMarks && (
                                                    <MenuItem
                                                        icon={ClipboardList}
                                                        label={isCompleted ? "View / edit marks" : "Enter marks"}
                                                        variant="primary"
                                                        onClick={() => { onEnterMarks(p); setMenuOpen(false) }}
                                                    />
                                                )}

                                                {teacher && isScheduled && onUpdateStatus && (
                                                    <MenuItem
                                                        icon={Send}
                                                        label="Mark as ongoing"
                                                        variant="default"
                                                        onClick={() => { onUpdateStatus(p.id, "Ongoing"); setMenuOpen(false) }}
                                                    />
                                                )}

                                                {teacher && isOngoing && onUpdateStatus && (
                                                    <MenuItem
                                                        icon={Send}
                                                        label="Mark as completed"
                                                        variant="default"
                                                        onClick={() => { onUpdateStatus(p.id, "Completed"); setMenuOpen(false) }}
                                                    />
                                                )}

                                                {onDelete && (
                                                    <>
                                                        <div className="my-1 h-px bg-border" />
                                                        <MenuItem
                                                            icon={Trash2}
                                                            label="Delete"
                                                            variant="danger"
                                                            onClick={() => { onDelete(); setMenuOpen(false) }}
                                                        />
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    {p.description && (
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                            {p.description}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-muted-foreground">
                        {p.scheduledDate ? (
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(p.scheduledDate, "dd MMM yyyy")}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                                <Calendar className="h-3 w-3" />
                                Date not set
                            </span>
                        )}

                        <span className="inline-flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {p.totalMarks} marks
                        </span>

                        {p.format && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {p.format}
                            </span>
                        )}

                        {p.venue && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {p.venue}
                            </span>
                        )}

                        {p.durationPerGroupMinutes && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {p.durationPerGroupMinutes} min
                            </span>
                        )}

                        {teacher && p.submittedCount !== undefined && (
                            <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {p.submittedCount} graded
                            </span>
                        )}

                        {!teacher && p.myResult?.obtainedMarks != null && (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                                <Star className="h-3 w-3" />
                                {p.myResult.obtainedMarks} / {p.totalMarks}
                            </span>
                        )}

                        {!teacher && p.myResult?.isAbsent && (
                            <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                                <XCircle className="h-3 w-3" />
                                Absent
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}