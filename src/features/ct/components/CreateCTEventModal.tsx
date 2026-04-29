import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ClipboardList, Lightbulb } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import type { CreateCTEventRequest } from "@/types/ct.types"

const schema = z.object({
  title: z.string().min(3, "At least 3 characters").max(100, "Max 100 characters"),
  maxMarks: z.coerce.number().min(1, "At least 1").max(500, "Max 500"),
  heldOn: z.string().optional().nullable(),
})
type FormData = z.infer<typeof schema>

interface CreateCTEventModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  onSubmit: (data: CreateCTEventRequest) => void
  isLoading?: boolean
}

export default function CreateCTEventModal({
  isOpen, onClose, onSubmit, isLoading,
}: CreateCTEventModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: 20, heldOn: null },
  })

  const handleClose = () => { reset(); onClose() }

  const submit = (d: FormData) =>
    onSubmit({ title: d.title, maxMarks: d.maxMarks, heldOn: d.heldOn || null })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New class test"
      size="md"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Helper card — CT number is auto-assigned */}
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-200">
            <ClipboardList className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-[13px] font-bold text-foreground">
              New class test
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              CT number is assigned automatically.
            </p>
          </div>
        </div>

        <Input
          {...register("title")}
          label="CT title"
          placeholder='e.g. "Chapter 3 — Linked lists"'
          error={errors.title?.message}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("maxMarks")}
            type="number"
            label="Total marks"
            placeholder="20"
            error={errors.maxMarks?.message}
            required
          />
          <Input
            {...register("heldOn")}
            type="date"
            label="Date held (optional)"
          />
        </div>

        {/* Workflow tip — CRITICAL for the user mental model */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
            After creating, upload the{" "}
            <strong className="font-bold">best</strong>,{" "}
            <strong className="font-bold">worst</strong>, and{" "}
            <strong className="font-bold">average</strong> scripts before entering marks.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={isLoading}
          >
            Create CT
          </Button>
        </div>
      </form>
    </Modal>
  )
}