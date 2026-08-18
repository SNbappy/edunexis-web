import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "react-hot-toast"
import App from "./App"
import { queryClient } from "./lib/queryClient"
import ThemeProvider from "./components/ThemeProvider"
import ScrollToTop from "./components/ScrollToTop"
import NavigationProgress from "./components/ui/NavigationProgress"
import "./index.css"

/**
 * Turn off the browser's own scroll restoration.
 *
 * With it on, reloading part-way down a long page makes Chrome jump straight
 * to the old offset on first paint — so you see the footer for a frame before
 * the app finishes laying out and snaps back to the top. That flash is what
 * this prevents. ScrollToTop below then owns scroll position explicitly.
 */
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual"
}

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ThemeProvider>
          <ScrollToTop />
          <NavigationProgress />
          <App />
          {/* Toasts must sit above dialogs.
              react-hot-toast defaults its container to z-index 9999, but Modal
              renders at 99999 — so every "Saved", "Grading failed" or validation
              error raised from inside a dialog appeared *underneath* the modal's
              blurred scrim: visible as a smear in the corner, and unreadable.
              Since most toasts in this app are fired by an action taken inside a
              modal, that was almost all of them.

              The palette also uses the theme tokens rather than fixed light-mode
              greens and reds, which were near-illegible over a dark background. */}
          <Toaster
            position="top-right"
            gutter={8}
            containerStyle={{ zIndex: 100000 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
                background: "rgb(var(--card))",
                color: "rgb(var(--foreground))",
                border: "1px solid rgb(var(--border))",
                boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.35)",
              },
              success: {
                style: {
                  background: "rgb(var(--success-soft))",
                  color: "rgb(var(--success))",
                  border: "1px solid rgb(var(--success) / 0.25)",
                },
                iconTheme: { primary: "rgb(var(--success))", secondary: "rgb(var(--card))" },
              },
              error: {
                style: {
                  background: "rgb(var(--destructive-soft))",
                  color: "rgb(var(--destructive))",
                  border: "1px solid rgb(var(--destructive) / 0.25)",
                },
                iconTheme: { primary: "rgb(var(--destructive))", secondary: "rgb(var(--card))" },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)