import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  totalMarks: z.coerce.number().min(1, "Min 1").max(500, "Max 500"),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface CreatePresentationModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export default function CreatePresentationModal({
  isOpen, onClose, courseId, onSubmit, isLoading,
}: CreatePresentationModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { totalMarks: 20 },
  })

  const handleClose = () => { reset(); onClose() }

  // Backend still accepts the legacy fields for back-compat; we just send safe defaults.
  const submit = (data: FormData) => onSubmit({
    courseId,
    title: data.title,
    totalMarks: data.totalMarks,
    description: data.description,
    format: "Individual",
    topicsAllowed: false,
    scheduledDate: null,
    venue: null,
    durationPerGroupMinutes: null,
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New test"
      description="Create a test. You can enter marks anytime and publish when ready."
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          {...register("title")}
          label="Title"
          placeholder="e.g. Oral test — Chapter 3"
          error={errors.title?.message}
        />

        <Input
          {...register("totalMarks")}
          type="number"
          label="Total marks (out of)"
          placeholder="20"
          error={errors.totalMarks?.message}
        />

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
            placeholder="Notes for students about this test…"
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}