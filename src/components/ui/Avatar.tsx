import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/names'

interface AvatarProps {
    src?: string | null
    name?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /** `muted` drops the hashed colour — for large surfaces where a saturated
     *  fill would dominate the page. */
    tone?: 'color' | 'muted'
    className?: string
}

const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
}

// Initials come from the shared name helper — see utils/names.ts for why
// honorifics have to be stripped ("Dr. Taslima Rahman" is TR, not DT).

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

export function Avatar({ src, name, size = 'md', tone = 'color', className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name ?? 'Avatar'}
                className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
            />
        )
    }
    /* The hashed gradient earns its place at list sizes — it is what lets you
       pick one person out of eighteen at a glance. Blown up to a 360px block on
       a profile card it stops being a cue and becomes the loudest thing on the
       page, so large surfaces pass tone="muted". */
    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold shrink-0',
                tone === 'muted'
                    ? 'bg-muted text-muted-foreground'
                    : `bg-gradient-to-br text-white ${getColor(name)}`,
                sizes[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    )
}

export default Avatar
