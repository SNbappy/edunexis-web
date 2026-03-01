import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Pin, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import type { CreateAnnouncementRequest } from '@/types/announcement.types'

interface Props {
    courseId: string
    onSubmit: (data: CreateAnnouncementRequest) => void
    isLoading?: boolean
}

export default function CreateAnnouncementForm({ courseId, onSubmit, isLoading }: Props) {
    const { user } = useAuthStore()
    const [expanded, setExpanded] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [pinned, setPinned] = useState(false)

    const handleSubmit = () => {
        if (!content.trim()) return
        onSubmit({ courseId, title: title || undefined, content, isPinned: pinned })
        setTitle('')
        setContent('')
        setPinned(false)
        setExpanded(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
        >
            <div
                className="flex items-center gap-3 p-4 cursor-text"
                onClick={() => setExpanded(true)}
            >
                <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" />
                {!expanded ? (
                    <span className="flex-1 text-sm text-muted-foreground select-none">
                        Share something with your class...
                    </span>
                ) : (
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="flex-1 text-sm font-medium bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                    />
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            <textarea
                                autoFocus={!title}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement..."
                                rows={4}
                                className="w-full bg-muted/50 rounded-xl border border-border text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPinned((p) => !p)}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${pinned
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                            : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Pin className="w-3.5 h-3.5" />
                                    {pinned ? 'Pinned' : 'Pin to top'}
                                </button>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={!content.trim()}
                                        loading={isLoading}
                                        onClick={handleSubmit}
                                        leftIcon={!isLoading ? <Send className="w-3.5 h-3.5" /> : undefined}
                                    >
                                        Post
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
