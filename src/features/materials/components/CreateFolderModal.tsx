import InlineSpinner from "@/components/ui/InlineSpinner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { FolderPlus } from "lucide-react"
import Modal from "@/components/ui/Modal"

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
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30 dark:border-teal-800 dark:bg-teal-950/50"
          >
            <FolderPlus className="h-7 w-7 text-teal-600 dark:text-teal-400" />
          </motion.div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-bold text-foreground">
            Folder name
            <span className="ml-1 text-red-600">*</span>
          </label>
          <input
            {...register("title")}
            placeholder="e.g. Week 1 Slides"
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
          {errors.title && (
            <p className="mt-1 text-[11.5px] font-medium text-red-600">
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
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
        </div>

        <div className="flex gap-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!!isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <InlineSpinner className="text-white" />
                Creating…
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4" />
                Create folder
              </>
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}