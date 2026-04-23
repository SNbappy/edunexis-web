import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

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
  return (
    <div className="min-h-full pb-24">
      <div className="mx-auto max-w-6xl px-5 pt-6 lg:px-8">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      </div>

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

      {topSlot && (
        <div className="mx-auto mt-6 max-w-6xl px-5 lg:px-8">
          {topSlot}
        </div>
      )}

      <div className="mx-auto mt-8 max-w-6xl px-5 lg:px-8">
        {preview ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">{children}</div>
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Live preview
                </div>
                {preview}
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl">{children}</div>
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-5 py-4 lg:px-8">
          {footer}
        </div>
      </footer>
    </div>
  )
}
