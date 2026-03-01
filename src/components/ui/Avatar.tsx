import { cn } from '@/utils/cn'

interface AvatarProps {
    src?: string | null
    name?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
}

function getInitials(name?: string | null): string {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function getColor(name?: string | null): string {
    const colors = [
        'from-indigo-500 to-violet-500',
        'from-cyan-500 to-blue-500',
        'from-violet-500 to-purple-500',
        'from-emerald-500 to-teal-500',
        'from-rose-500 to-pink-500',
        'from-amber-500 to-orange-500',
    ]
    if (!name) return colors[0]
    const idx = name.charCodeAt(0) % colors.length
    return colors[idx]
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name ?? 'Avatar'}
                className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
            />
        )
    }
    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
                `bg-gradient-to-br ${getColor(name)}`,
                sizes[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    )
}
