import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
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
    const [content, setContent] = useState('')
    const [attachment, setAttachment] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
        if (!content.trim() || isLoading) return
        onSubmit({ courseId, content, attachment })
        setContent('')
        setAttachment(null)
        setExpanded(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden relative"
        >
            {/* Posting overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-sm font-medium text-foreground">Posting announcement...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-3 p-4 cursor-text" onClick={() => setExpanded(true)}>
                <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" />
                <span className="flex-1 text-sm text-muted-foreground select-none">
                    Share something with your class...
                </span>
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
                                autoFocus
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement..."
                                rows={4}
                                className="w-full bg-muted/50 rounded-xl border border-border text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            />

                            {attachment && (
                                <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2">
                                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="flex-1 truncate text-foreground">{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all"
                                >
                                    <Paperclip className="w-3.5 h-3.5" /> Attach file
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                                />
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
