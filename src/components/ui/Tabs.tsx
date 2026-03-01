import { cn } from '@/utils/cn'

interface Tab {
    key: string
    label: string
    icon?: React.ReactNode
    badge?: number
}

interface TabsProps {
    tabs: Tab[]
    active: string
    onChange: (key: string) => void
    variant?: 'pills' | 'underline' | 'boxed'
    className?: string
}

export default function Tabs({ tabs, active, onChange, variant = 'pills', className }: TabsProps) {
    if (variant === 'underline') {
        return (
            <div className={cn('flex items-center gap-1 border-b border-border', className)}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
                            active === tab.key
                                ? 'text-primary border-primary'
                                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        )
    }

    if (variant === 'boxed') {
        return (
            <div className={cn('flex items-center gap-1 p-1 rounded-xl bg-muted border border-border', className)}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center',
                            active === tab.key
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="w-4 h-4 text-xs rounded-full bg-primary text-white font-bold flex items-center justify-center">
                                {tab.badge > 9 ? '9+' : tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        )
    }

    // pills (default)
    return (
        <div className={cn('flex items-center gap-2 flex-wrap', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        active === tab.key
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
