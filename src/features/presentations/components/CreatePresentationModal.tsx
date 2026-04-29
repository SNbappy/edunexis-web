import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { formatInputDate } from "@/utils/dateUtils"
import { addDays } from "date-fns"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  totalMarks: z.coerce.number().min(1, "Min 1").max(500, "Max 500"),
  format: z.enum(["Individual", "Group"]),
  durationPerGroupMinutes: z.coerce.number().min(1).max(120).optional(),
  venue: z.string().optional(),
  topicsAllowed: z.boolean(),
})
type FormData = z.infer<typeof schema>

interface CreatePresentationModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  onSubmit: (data: FormData & { courseId: string }) => void
  isLoading?: boolean
}

export default function CreatePresentationModal({
  isOpen, onClose, courseId, onSubmit, isLoading,
}: CreatePresentationModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      totalMarks: 20,
      format: "Individual",
      topicsAllowed: true,
      scheduledDate: formatInputDate(addDays(new Date(), 14)),
      durationPerGroupMinutes: 10,
    },
  })

  const format = watch("format")
  const handleClose = () => { reset(); onClose() }
  const submit = (data: FormData) => onSubmit({ ...data, courseId })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Schedule new test"
      description="Add a marked event — oral test, viva, lab test, presentation, or pop quiz."
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          {...register("title")}
          label="Title"
          placeholder="e.g. Oral test — Chapter 3"
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("scheduledDate")}
            type="datetime-local"
            label="Scheduled date"
            error={errors.scheduledDate?.message}
          />
          <Input
            {...register("totalMarks")}
            type="number"
            label="Total marks"
            placeholder="20"
            error={errors.totalMarks?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            {...register("format")}
            label="Format"
            options={[
              { value: "Individual", label: "Individual" },
              { value: "Group", label: "Group" },
            ]}
          />
          <Input
            {...register("venue")}
            label="Venue (optional)"
            placeholder="e.g. Seminar hall"
          />
        </div>

        {format === "Group" && (
          <Input
            {...register("durationPerGroupMinutes")}
            type="number"
            label="Duration per group (minutes)"
            placeholder="10"
            error={errors.durationPerGroupMinutes?.message}
          />
        )}

        {/* Topics checkbox */}
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
          <input
            type="checkbox"
            id="topicsAllowed"
            {...register("topicsAllowed")}
            className="h-4 w-4 rounded accent-teal-600"
          />
          <label
            htmlFor="topicsAllowed"
            className="cursor-pointer text-[13px] font-medium text-foreground"
          >
            Allow students to submit their own topic
          </label>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="presentation-description"
            className="mb-1.5 block text-[13px] font-semibold text-foreground"
          >
            Description{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="presentation-description"
            {...register("description")}
            rows={3}
            placeholder="Guidelines, evaluation criteria, allowed topics…"
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isLoading}>
            Schedule
          </Button>
        </div>
      </form>
    </Modal>
  )
}