import { useState } from "react"
import { ArrowLeft, Eye, X } from "lucide-react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"

interface FormPageLayoutProps {
  backLabel:    string
  backTo:       string
  title:        string
  subtitle?:    string
  topSlot?:     React.ReactNode
  children:     React.ReactNode
  preview?:     React.ReactNode
  footer:       React.ReactNode
}

export default function FormPageLayout({
  backLabel, backTo, title, subtitle,
  topSlot, children, preview, footer,
}: FormPageLayoutProps) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  return (
    <div className="min-h-full pb-12">
      {/* Back nav */}
      <div className="mx-auto max-w-6xl px-5 pt-6 lg:px-8">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      </div>

      {/* Hero */}
      <header className="mx-auto mt-4 max-w-6xl px-5 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </header>

      {/* Top slot (stepper, etc.) */}
      {topSlot && (
        <div className="mx-auto mt-6 max-w-6xl px-5 lg:px-8">
          {topSlot}
        </div>
      )}

      {/* Body */}
      <div className="mx-auto mt-8 max-w-6xl px-5 lg:px-8">
        {preview ? (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
            <div className="min-w-0">
              {children}
              {/* Inline footer — lives with the form content, not sticky */}
              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
                {footer}
              </div>
            </div>
            <aside className="hidden xl:block">
              <div className="sticky top-8">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Live preview
                  </span>
                </div>
                {preview}
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl">
            {children}
            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
              {footer}
            </div>
          </div>
        )}
      </div>

      {/* Mobile preview — floating button bottom-right (only below xl when preview exists) */}
      {preview && (
        <>
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[12px] font-bold text-foreground shadow-lg transition-transform hover:scale-105 xl:hidden"
            aria-label="Show live preview"
          >
            <Eye className="h-3.5 w-3.5 text-teal-600" />
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
                  className="fixed inset-0 z-40 bg-black/40 xl:hidden"
                />
                <motion.aside
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl xl:hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-teal-600" />
                      <span className="font-display text-[15px] font-bold text-foreground">
                        Live preview
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobilePreviewOpen(false)}
                      aria-label="Close preview"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {preview}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
