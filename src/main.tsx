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
          <App />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", fontSize: "13px", fontWeight: "500" },
              success: {
                style: { background: "rgb(240 253 244)", color: "rgb(22 101 52)", border: "1px solid rgb(187 247 208)" },
                iconTheme: { primary: "rgb(34 197 94)", secondary: "rgb(240 253 244)" },
              },
              error: {
                style: { background: "rgb(254 242 242)", color: "rgb(153 27 27)", border: "1px solid rgb(254 202 202)" },
                iconTheme: { primary: "rgb(239 68 68)", secondary: "rgb(254 242 242)" },
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