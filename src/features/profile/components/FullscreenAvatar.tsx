import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Avatar from "@/components/ui/Avatar"

interface FullscreenAvatarProps {
    open: boolean
    onClose: () => void
    src: string | null
    name: string
}

export default function FullscreenAvatar({
    open, onClose, src, name,
}: FullscreenAvatarProps) {
    // Close on Escape + lock body scroll
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", handler)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", handler)
            document.body.style.overflow = prev
        }
    }, [open, onClose])

    if (typeof document === "undefined") return null

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
                    onClick={onClose}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={e => e.stopPropagation()}
                        className="relative max-h-[90vh] max-w-[90vw]"
                    >
                        {src ? (
                            <img
                                src={src}
                                alt={name}
                                className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                                draggable={false}
                            />
                        ) : (
                            <div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-stone-900 shadow-2xl">
                                <Avatar name={name} size="xl" className="h-48 w-48 text-6xl" />
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    )
}