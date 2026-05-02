import { motion } from "framer-motion"

interface LivePreviewPanelProps {
  children: React.ReactNode
  /** Small descriptive caption shown under the preview. */
  caption?: string
}

export default function LivePreviewPanel({ children, caption }: LivePreviewPanelProps) {
  return (
    <div>
      <motion.div
        layout
        transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
        className="rounded-2xl border border-border bg-muted/60 p-4"
      >
        {children}
      </motion.div>
      {caption && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}
