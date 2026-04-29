import { motion } from "framer-motion"
import {
  Calendar, Award, Upload, CheckCircle2, ClipboardList, Send,
  Star, XCircle, FileText, EyeOff, ExternalLink,
} from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { formatDate } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { useCTMarks } from "../hooks/useCTEvents"
import type { CTEventDto } from "@/types/ct.types"

function StudentMarkSection({
  ctEventId, maxMarks,
}: { ctEventId: string; maxMarks: number }) {
  const { marksData, isLoading } = useCTMarks(ctEventId)
  const myMark = marksData?.marks?.[0]

  if (isLoading) {
    return (
      <div className="h-16 animate-pulse rounded-xl border border-border bg-muted/40" />
    )
  }

  if (!myMark) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-[13px] text-muted-foreground">
        Your marks have not been entered yet.
      </div>
    )
  }

  const isAbsent = myMark.isAbsent
  const containerClass = isAbsent
    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
    : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={"space-y-2 rounded-xl border p-4 " + containerClass}
    >
      {isAbsent ? (
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <XCircle className="h-5 w-5" />
          <span className="font-display text-[15px] font-bold">Absent</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-2 text-emerald-700 dark:text-emerald-300">
          <Star className="h-5 w-5 self-center" />
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {myMark.obtainedMarks}
          </span>
          <span className="text-[13px] text-muted-foreground">
            / {maxMarks}
          </span>
        </div>
      )}
      {myMark.remarks && (
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold">Remarks:</span> {myMark.remarks}
        </p>
      )}
    </motion.div>
  )
}

interface CTEventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ct: CTEventDto | null
  onEnterMarks?: (ct: CTEventDto) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
}

export default function CTEventDetailModal({
  isOpen, onClose, ct,
  onEnterMarks, onUploadKhata, onPublish, onUnpublish,
}: CTEventDetailModalProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  if (!ct) return null

  const isPublished = ct.status === "Published"
  const isDraft = ct.status === "Draft"

  const khataSlots = [
    { key: "best", label: "Best script", url: ct.bestScriptUrl },
    { key: "worst", label: "Worst script", url: ct.worstScriptUrl },
    { key: "avg", label: "Average script", url: ct.averageScriptUrl },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"CT " + ct.ctNumber + " — " + ct.title}
      size="lg"
    >
      <div className="space-y-5">
        {/* Status badge row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider " +
            (isPublished
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300")
          }>
            <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
            {ct.status}
          </span>

          {isDraft && !ct.khataUploaded && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <Upload className="h-2.5 w-2.5" strokeWidth={2.5} />
              Scripts pending
            </span>
          )}

          {isDraft && ct.khataUploaded && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
              Scripts uploaded
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            icon={Calendar}
            label="Date held"
            value={ct.heldOn ? formatDate(ct.heldOn, "dd MMM yyyy") : "Not set"}
          />
          <InfoTile
            icon={Award}
            label="Total marks"
            value={String(ct.maxMarks)}
          />
        </div>

        {/* Khata scripts (teacher) */}
        {teacher && (
          <div className="space-y-2">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
              Answer scripts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {khataSlots.map(slot => (
                <div
                  key={slot.key}
                  className={
                    "space-y-1.5 rounded-xl border p-3 text-center transition-all " +
                    (slot.url
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                      : "border-border bg-muted/30")
                  }
                >
                  {slot.url ? (

                  <a href = {slot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1"
                    >
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[10.5px] text-muted-foreground">{slot.label}</p>
                  <p className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 group-hover:underline dark:text-teal-300">
                    View file
                    <ExternalLink className="h-2.5 w-2.5" />
                  </p>
                </a>
              ) : (
              <>
                <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-[10.5px] text-muted-foreground">{slot.label}</p>
                <p className="text-[10px] text-muted-foreground/70">Not uploaded</p>
              </>
                  )}
            </div>
              ))}
          </div>
          </div>
        )}

      {/* Student result */}
      {!teacher && isPublished && (
        <div className="space-y-2">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
            Your result
          </p>
          <StudentMarkSection ctEventId={ct.id} maxMarks={ct.maxMarks} />
        </div>
      )}

      {!teacher && isDraft && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-[13px] text-muted-foreground">
          Results will be visible once your teacher publishes this CT.
        </div>
      )}

      {/* Teacher actions */}
      {teacher && (
        <div className="space-y-2 pt-1">
          {isDraft && onUploadKhata && (
            <ActionButton
              variant={ct.khataUploaded ? "secondary" : "primary"}
              icon={Upload}
              label={ct.khataUploaded ? "Re-upload scripts" : "Upload scripts"}
              onClick={() => { onClose(); onUploadKhata(ct) }}
            />
          )}
          {isDraft && ct.khataUploaded && onEnterMarks && (
            <ActionButton
              variant="amber"
              icon={ClipboardList}
              label="Enter / edit marks"
              onClick={() => { onClose(); onEnterMarks(ct) }}
            />
          )}
          {isDraft && ct.khataUploaded && onPublish && (
            <ActionButton
              variant="success"
              icon={Send}
              label="Publish results to students"
              onClick={() => { onClose(); onPublish(ct.id) }}
            />
          )}
          {isPublished && onUnpublish && (
            <ActionButton
              variant="amber"
              icon={EyeOff}
              label="Unpublish"
              onClick={() => { onClose(); onUnpublish(ct.id) }}
            />
          )}
          {isPublished && !onUnpublish && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-[12px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="mr-1 inline h-3 w-3" />
              Published — students can view their marks
            </div>
          )}
        </div>
      )}

      {/* Close — always available */}
      <div className="pt-1">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
    </Modal >
  )
}

interface InfoTileProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
}

function InfoTile({ icon: Icon, label, value }: InfoTileProps) {
  return (
    <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
      <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="font-display text-[13px] font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}

type ActionVariant = "primary" | "secondary" | "amber" | "success"

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  onClick: () => void
  variant: ActionVariant
}

function ActionButton({ icon: Icon, label, onClick, variant }: ActionButtonProps) {
  const classMap: Record<ActionVariant, string> = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)]",
    secondary: "border border-border bg-muted text-foreground hover:bg-stone-100 dark:hover:bg-stone-900",
    amber: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.6)]",
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={
        "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-colors " +
        classMap[variant]
      }
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {label}
    </motion.button>
  )
}