import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ZoomIn, ZoomOut, RotateCw, Check, X,
  RefreshCw, Sparkles,
} from "lucide-react"
import Button from "@/components/ui/Button"

interface ImageCropModalProps {
  isOpen: boolean
  imageFile: File | null
  onClose: () => void
  onCropComplete: (file: File) => void
  aspectRatio?: number
  title?: string
}

const VIEWPORT_SIZE = 280 // px square viewport
const OUTPUT_SIZE = 600 // px square exported resolution

export default function ImageCropModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  title = "Adjust profile photo",
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [isSquare, setIsSquare] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // degrees (0, 90, 180, 270)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const imageRef = useRef<HTMLImageElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  // Load image when file changes
  useEffect(() => {
    if (!imageFile || !isOpen) {
      setImageSrc(null)
      return
    }

    const url = URL.createObjectURL(imageFile)
    setImageSrc(url)

    const img = new Image()
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      const diff = Math.abs(img.naturalWidth - img.naturalHeight)
      setIsSquare(diff <= 4) // within 4px is virtually square
      setZoom(1)
      setRotation(0)
      setOffset({ x: 0, y: 0 })
    }
    img.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [imageFile, isOpen])

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      // Ignored
    }
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.0015
    setZoom(prev => Math.min(Math.max(prev + delta, 0.6), 3.5))
  }

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Reset adjustments
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  // Export cropped canvas
  const handleApplyCrop = useCallback(() => {
    if (!imageRef.current || !imageFile) return

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      onCropComplete(imageFile)
      return
    }

    const img = imageRef.current
    const scale = (OUTPUT_SIZE / VIEWPORT_SIZE) * zoom

    ctx.save()
    // Fill white background in case of transparent PNG/WebP
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    // Move to canvas center
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)
    ctx.translate(offset.x * (OUTPUT_SIZE / VIEWPORT_SIZE), offset.y * (OUTPUT_SIZE / VIEWPORT_SIZE))
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Calculate aspect ratio fitting for base rendering
    let renderW = VIEWPORT_SIZE
    let renderH = VIEWPORT_SIZE
    if (naturalSize.width && naturalSize.height) {
      const imgAspect = naturalSize.width / naturalSize.height
      if (imgAspect > 1) {
        renderH = VIEWPORT_SIZE
        renderW = VIEWPORT_SIZE * imgAspect
      } else {
        renderW = VIEWPORT_SIZE
        renderH = VIEWPORT_SIZE / imgAspect
      }
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH)
    ctx.restore()

    canvas.toBlob(
      blob => {
        if (!blob) {
          onCropComplete(imageFile)
          return
        }
        const fileName = imageFile.name.replace(/\.[^/.]+$/, "") + ".jpg"
        const croppedFile = new File([blob], fileName, { type: "image/jpeg" })
        onCropComplete(croppedFile)
      },
      "image/jpeg",
      0.92
    )
  }, [imageFile, zoom, rotation, offset, naturalSize, onCropComplete])

  if (!isOpen || !imageFile || !imageSrc) return null

  // Calculate dimensions for preview inside viewport
  let baseW = VIEWPORT_SIZE
  let baseH = VIEWPORT_SIZE
  if (naturalSize.width && naturalSize.height) {
    const imgAspect = naturalSize.width / naturalSize.height
    if (imgAspect > 1) {
      baseH = VIEWPORT_SIZE
      baseW = VIEWPORT_SIZE * imgAspect
    } else {
      baseW = VIEWPORT_SIZE
      baseH = VIEWPORT_SIZE / imgAspect
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Drag to reposition · Scroll or slider to zoom
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body / Cropper Area */}
          <div className="flex flex-col items-center bg-stone-950/90 px-6 py-6 dark:bg-black/90">
            {/* Viewport Box */}
            <div
              ref={viewportRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
              className="relative cursor-grab overflow-hidden rounded-full border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] active:cursor-grabbing"
            >
              {/* Image being manipulated */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.08s ease-out",
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    width: baseW,
                    height: baseH,
                    maxWidth: "none",
                  }}
                  className="pointer-events-none select-none object-contain"
                />
              </div>

              {/* Grid overlay for alignment */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-b border-r border-white" />
                <div className="border-b border-r border-white" />
                <div className="border-b border-white" />
                <div className="border-b border-r border-white" />
                <div className="border-b border-r border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </div>

            {isSquare && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300">
                <Sparkles className="h-3 w-3 text-teal-400" />
                Square image detected · ready as-is or adjust below
              </div>
            )}

            {/* Controls Bar */}
            <div className="mt-5 flex w-full flex-col gap-3.5">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                  className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.02"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-700 accent-primary"
                />

                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3.0, z + 0.15))}
                  className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <div className="h-4 w-px bg-stone-700" />

                {/* Rotate Button */}
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-stone-200 transition-colors hover:bg-white/10 hover:text-white"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Rotate</span>
                </button>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 rounded-xl p-1.5 text-xs font-semibold text-stone-400 transition-colors hover:text-stone-200"
                  title="Reset"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCropComplete(imageFile)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Use original
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Check className="h-3.5 w-3.5" />}
                onClick={handleApplyCrop}
              >
                Save photo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}