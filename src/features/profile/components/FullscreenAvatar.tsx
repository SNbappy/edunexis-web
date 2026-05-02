import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Trash2, AlertTriangle } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import InlineSpinner from "@/components/ui/InlineSpinner"

interface FullscreenAvatarProps {
    open:          boolean
    onClose:       () => void
    src:           string | null
    name:          string
    isSelf?:       boolean
    onUpload?:     (file: File) => void
    onRemove?:     () => void
    isUploading?:  boolean
    isRemoving?:   boolean
}

export default function FullscreenAvatar({
    open, onClose, src, name,
    isSelf = false, onUpload, onRemove,
    isUploading = false, isRemoving = false,
}: FullscreenAvatarProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [confirmDelete, setConfirmDelete] = useState(false)

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

    // Reset confirm state when modal closes
    useEffect(() => { if (!open) setConfirmDelete(false) }, [open])

    if (typeof document === "undefined") return null

    const handlePick = () => fileRef.current?.click()
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && onUpload) onUpload(file)
        e.target.value = ""
    }
    const handleDelete = () => {
        if (!onRemove) return
        if (!confirmDelete) { setConfirmDelete(true); return }
        onRemove()
        setConfirmDelete(false)
    }

    const busy = isUploading || isRemoving
    const showActions = isSelf && (onUpload || onRemove)
    const canDelete = isSelf && Boolean(src) && Boolean(onRemove)

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
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
                        className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-5"
                    >
                        <div className="relative">
                            {src ? (
                                <img
                                    src={src}
                                    alt={name}
                                    className="max-h-[70vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                                    draggable={false}
                                />
                            ) : (
                                <div className="flex h-[60vmin] w-[60vmin] items-center justify-center rounded-2xl bg-stone-900 shadow-2xl">
                                    <Avatar name={name} size="xl" className="h-48 w-48 text-6xl" />
                                </div>
                            )}
                            {busy ? (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                                    <InlineSpinner size={40} className="text-white" />
                                </div>
                            ) : null}
                        </div>

                        {showActions ? (
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {onUpload ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handlePick}
                                            disabled={busy}
                                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg transition-colors hover:bg-teal-700 disabled:opacity-50"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {src ? "Upload new photo" : "Upload photo"}
                                        </button>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFile}
                                        />
                                    </>
                                ) : null}

                                {canDelete ? (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={busy}
                                        className={
                                            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold shadow-lg transition-colors disabled:opacity-50 " +
                                            (confirmDelete
                                                ? "bg-red-600 text-white hover:bg-red-700"
                                                : "bg-white/10 text-white backdrop-blur hover:bg-white/20")
                                        }
                                    >
                                        {confirmDelete ? (
                                            <>
                                                <AlertTriangle className="h-4 w-4" />
                                                Click again to confirm
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Delete photo
                                            </>
                                        )}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    )
}