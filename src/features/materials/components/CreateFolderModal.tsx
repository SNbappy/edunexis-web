import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { FolderPlus } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { ICON_STROKE } from "@/components/ui/appTokens"

const schema = z.object({
  title: z.string().min(1, "Folder name is required").max(60, "Too long"),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string }) => void
  isLoading?: boolean
}

export default function CreateFolderModal({
  isOpen, onClose, onSubmit, isLoading,
}: CreateFolderModalProps) {
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New folder" size="sm">
      <form onSubmit={handleSubmit(d => onSubmit(d))} className="space-y-4">
        <div className="flex items-center justify-center py-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"
          >
            <FolderPlus className="h-7 w-7 text-primary" />
          </motion.div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-bold text-foreground">
            Folder name
            <span className="ml-1 text-destructive">*</span>
          </label>
          <input
            {...register("title")}
            placeholder="e.g. Week 1 Slides"
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
          />
          {errors.title && (
            <p className="mt-1 text-[11.5px] font-medium text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-bold text-foreground">
            Description
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="What's in this folder?"
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
          />
        </div>

        {/* The shared Button, not a hand-rolled one — these were flat fills
            written inline, so they never picked up the gradient, the inner
            highlight or the loading state the rest of the app has. */}
        <div className="flex justify-end gap-2 border-t border-border pt-3.5">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            leftIcon={<FolderPlus strokeWidth={ICON_STROKE} />}
          >
            Create folder
          </Button>
        </div>
      </form>
    </Modal>
  )
}