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

function Root() {
  return (
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