import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ClipboardList } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { addDays } from "date-fns"
import type { CreateAssignmentRequest } from "@/types/assignment.types"

const schema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  instructions: z.string().optional(),
  deadline: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (d: CreateAssignmentRequest) => void
  isLoading?: boolean
}

function pad(n: number) { return String(n).padStart(2, "0") }
function toLocal(d: Date) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
}

export default function CreateAssignmentModal({
  isOpen, onClose, onSubmit, isLoading,
}: CreateAssignmentModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maxMarks: 100,
      allowLateSubmission: false,
      deadline: toLocal(addDays(new Date(), 7)),
    },
  })

  const allowLate = watch("allowLateSubmission")
  const handleClose = () => { reset(); onClose() }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New assignment"
      size="xl"
      scrollable
    >
      <form
        onSubmit={handleSubmit(d => onSubmit({ ...d, deadline: new Date(d.deadline).toISOString() }))}
        className="space-y-4"
      >
        {/* Helper card */}
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-200">
            <ClipboardList className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-[13px] font-bold text-foreground">
              Create a new assignment
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Students will see it on the Assignments tab when published.
            </p>
          </div>
        </div>

        <Input
          {...register("title")}
          label="Title"
          placeholder='e.g. "Assignment 1 — Linked lists"'
          error={errors.title?.message}
          required
        />

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Instructions <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            {...register("instructions")}
            rows={4}
            placeholder="Detailed instructions for students…"
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Rubric / grading criteria <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            {...register("rubricNotes")}
            rows={2}
            placeholder="e.g. 30% code quality, 40% output, 30% report"
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("deadline")}
            type="datetime-local"
            label="Deadline"
            error={errors.deadline?.message}
            required
          />
          <Input
            {...register("maxMarks")}
            type="number"
            label="Max marks"
            placeholder="100"
            error={errors.maxMarks?.message}
            required
          />
        </div>

        {/* Late submission toggle */}
        <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
          <input
            type="checkbox"
            {...register("allowLateSubmission")}
            className="sr-only"
          />
          <div className={
            "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
            (allowLate ? "bg-teal-600" : "bg-stone-300 dark:bg-stone-700")
          }>
            <div className={
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all " +
              (allowLate ? "left-[18px]" : "left-0.5")
            } />
          </div>
          <span className="text-[13px] font-semibold text-foreground">
            Allow late submission
          </span>
        </label>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isLoading}>
            Create assignment
          </Button>
        </div>
      </form>
    </Modal>
  )
}