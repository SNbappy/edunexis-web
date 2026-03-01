import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
    themeMode: ThemeMode
    sidebarOpen: boolean
    sidebarCollapsed: boolean
    setThemeMode: (mode: ThemeMode) => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toggleSidebarCollapse: () => void
}

function applyTheme(mode: ThemeMode): void {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark)
    root.classList.toggle('dark', shouldBeDark)
    localStorage.setItem('edunexis-theme-mode', mode)
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            themeMode: 'system', sidebarOpen: true, sidebarCollapsed: false,
            setThemeMode: (mode) => { applyTheme(mode); set({ themeMode: mode }) },
            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        }),
        {
            name: 'edunexis-ui',
            partialize: (state) => ({ themeMode: state.themeMode, sidebarCollapsed: state.sidebarCollapsed }),
            onRehydrateStorage: () => (state) => { if (state?.themeMode) applyTheme(state.themeMode) },
        }
    )
)

if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const { themeMode } = useUIStore.getState()
        if (themeMode === 'system') applyTheme('system')
    })
}
