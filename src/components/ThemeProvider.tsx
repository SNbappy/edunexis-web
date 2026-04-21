import { useEffect } from "react"
import { useThemeStore } from "@/store/themeStore"

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dark } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [dark])

  return <>{children}</>
}
