import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "react-hot-toast"
import App from "./App"
import { queryClient } from "./lib/queryClient"
import ThemeProvider from "./components/ThemeProvider"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", fontSize: "13px", fontWeight: "500" },
              success: {
                style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
                iconTheme: { primary: "#22c55e", secondary: "#f0fdf4" },
              },
              error: {
                style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
                iconTheme: { primary: "#ef4444", secondary: "#fef2f2" },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
