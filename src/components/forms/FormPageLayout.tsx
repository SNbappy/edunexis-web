import { useState } from "react"
import { Eye, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Page, PageHeader } from "@/components/ui/Page"
import { ICON, ICON_STROKE, FOCUS, SURFACE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface FormPageLayoutProps {
  backLabel:    string
  backTo:       string
  title:        string
  subtitle?:    string
  topSlot?:     React.ReactNode
  children:     React.ReactNode
  preview?:     React.ReactNode
  /**
   * Submit / cancel actions. Optional — not every form has its own action row
   * (JoinCoursePage submits from inside its body), and requiring it meant that
   * page failed to typecheck.
   */
  footer?:      React.ReactNode
}

/**
 * Shared layout for every create/edit form.
 *
 * Now built on the same `Page` + `PageHeader` as the rest of the app, so a form
 * page and a list page share a left edge, a title size and a back link. It was
 * previously its own world: a 36px hero title where list pages used 30px, its
 * own back-link styling, and its own max-width.
 */
export default function FormPageLayout({
  backLabel, backTo, title, subtitle,
  topSlot, children, preview, footer,
}: FormPageLayoutProps) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  const actions = footer && (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
      {footer}
    </div>
  )

  return (
    <Page>
      <PageHeader title={title} description={subtitle} back={{ label: backLabel, to: backTo }} />

      {/* topSlot shares the body's width. It used to sit outside the max-width
          wrapper, so on a single-column form a step rail stretched the full page
          while the fields it described stopped at 640px — the rail read as
          belonging to the page rather than to the form. */}
      {topSlot && <div className={cn("mb-6", preview ? undefined : "max-w-2xl")}>{topSlot}</div>}

      {preview ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {children}
            {actions}
          </div>
          <aside className="hidden xl:block">
            <div className="sticky top-20">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Eye className={cn(ICON.xs, "text-muted-foreground")} strokeWidth={ICON_STROKE} />
                <span className={TEXT.eyebrow}>Live preview</span>
              </div>
              {preview}
            </div>
          </aside>
        </div>
      ) : (
        /* Single-column forms cap at ~640px: a text input wider than that is
           harder to scan back along, not easier to fill. */
        <div className="max-w-2xl">
          {children}
          {actions}
        </div>
      )}

      {/* Below xl the preview moves to a sheet behind a floating button. */}
      {preview && (
        <>
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className={cn(
              SURFACE.raised,
              FOCUS,
              "fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-semibold text-foreground transition-transform duration-120 hover:scale-105 xl:hidden",
            )}
            aria-label="Show live preview"
          >
            <Eye className={cn(ICON.sm, "text-primary")} strokeWidth={ICON_STROKE} />
            Preview
          </button>

          <AnimatePresence>
            {mobilePreviewOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobilePreviewOpen(false)}
                  className={cn("fixed inset-0 z-40 xl:hidden", SURFACE.scrim)}
                />
                <motion.aside
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 shadow-xl xl:hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className={cn(ICON.sm, "text-primary")} strokeWidth={ICON_STROKE} />
                      <span className="font-display text-[15px] font-bold text-foreground">
                        Live preview
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobilePreviewOpen(false)}
                      aria-label="Close preview"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground",
                        FOCUS,
                      )}
                    >
                      <X className={ICON.sm} strokeWidth={ICON_STROKE} />
                    </button>
                  </div>
                  {preview}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </Page>
  )
}
