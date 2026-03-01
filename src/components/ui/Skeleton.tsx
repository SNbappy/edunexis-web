import { cn } from '@/utils/cn'

interface SkeletonProps {
    className?: string
    rounded?: 'sm' | 'md' | 'lg' | 'full' | 'xl' | '2xl'
}

export default function Skeleton({ className, rounded = 'lg' }: SkeletonProps) {
    const roundedMap = {
        sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg',
        xl: 'rounded-xl', '2xl': 'rounded-2xl', full: 'rounded-full',
    }
    return (
        <div className={cn('bg-muted animate-pulse', roundedMap[rounded], className)} />
    )
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('glass-card rounded-2xl p-5 space-y-3', className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9" rounded="full" />
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
        </div>
    )
}
