import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface LivePreviewPanelProps {
  children: React.ReactNode
  /** Small descriptive caption shown under the preview. */
  caption?: string
}

export default function LivePreviewPanel({ children, caption }: LivePreviewPanelProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  /* A preview is a picture of a thing, not the thing.
     These panels render the real components (ActiveCourseCard, the profile
     card), and those wrap themselves in <Link>. Inside a preview that link is
     live: on Create course it pointed at /courses/create-course-preview/stream,
     a placeholder id, so clicking your own preview threw away everything you
     had typed and landed on a course that does not exist.

     Deliberately not `inert`: that also strips the subtree from the
     accessibility tree, so a screen reader lost the preview altogether rather
     than just losing the bogus link. Instead the controls are pulled out of the
     tab order and pointer-events-none blocks the click, which leaves the
     preview readable to everyone and actionable to no one. */
  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    node.querySelectorAll<HTMLElement>("a, button, input, select, textarea")
      .forEach(el => el.setAttribute("tabindex", "-1"))
  })

  return (
    <div>
      <motion.div
        layout
        transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
        className="rounded-2xl border border-border bg-muted/60 p-4"
      >
        <div ref={stageRef} className="pointer-events-none">
          {children}
        </div>
      </motion.div>
      {caption && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}
