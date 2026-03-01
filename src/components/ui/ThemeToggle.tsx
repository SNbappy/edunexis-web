import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore, type ThemeMode } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
    { value: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'System' },
    { value: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
]

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { themeMode, setThemeMode } = useUIStore()

    if (compact) {
        const current = modes.find((m) => m.value === themeMode) ?? modes[1]
        const next = modes[(modes.indexOf(current) + 1) % modes.length]
        return (
            <button
                onClick={() => setThemeMode(next.value)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title={`Switch to ${next.label} mode`}
            >
                {current.icon}
            </button>
        )
    }

    return (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
            {modes.map((mode) => (
                <button
                    key={mode.value}
                    onClick={() => setThemeMode(mode.value)}
                    title={mode.label}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        themeMode === mode.value
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {mode.icon}
                    {mode.label}
                </button>
            ))}
        </div>
    )
}
