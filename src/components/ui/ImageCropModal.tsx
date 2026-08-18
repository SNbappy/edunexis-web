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

const VIEWPORT_SIZE = 300 // px square crop viewport
const OUTPUT_SIZE = 600 // px square exported image resolution

export default function ImageCropModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
  title = "Crop & adjust photo",
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [isSquare, setIsSquare] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
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
      setIsSquare(diff <= 6)
      setZoom(1)
      setRotation(0)
      setOffset({ x: 0, y: 0 })
    }
    img.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [imageFile, isOpen])

  // Compute effective dimensions based on rotation
  const isRotated90or270 = rotation === 90 || rotation === 270
  const effectiveW = isRotated90or270 ? naturalSize.height : naturalSize.width
  const effectiveH = isRotated90or270 ? naturalSize.width : naturalSize.height

  // Cover scale: ensures the image fills 100% of the viewport (no empty space)
  const coverScale = (effectiveW > 0 && effectiveH > 0)
    ? Math.max(VIEWPORT_SIZE / effectiveW, VIEWPORT_SIZE / effectiveH)
    : 1

  const baseW = naturalSize.width * coverScale
  const baseH = naturalSize.height * coverScale

  // Visual size when rotated and zoomed
  const renderedW = (isRotated90or270 ? baseH : baseW) * zoom
  const renderedH = (isRotated90or270 ? baseW : baseH) * zoom

  // Strict boundary clamping so the image always covers the entire circle
  const maxOffsetX = Math.max(0, (renderedW - VIEWPORT_SIZE) / 2)
  const maxOffsetY = Math.max(0, (renderedH - VIEWPORT_SIZE) / 2)

  const clampOffset = useCallback((x: number, y: number, currentZoom = zoom, currentRot = rotation) => {
    const isRot = currentRot === 90 || currentRot === 270
    const effW = isRot ? naturalSize.height : naturalSize.width
    const effH = isRot ? naturalSize.width : naturalSize.height
    const cScale = (effW > 0 && effH > 0) ? Math.max(VIEWPORT_SIZE / effW, VIEWPORT_SIZE / effH) : 1
    const bW = naturalSize.width * cScale
    const bH = naturalSize.height * cScale
    const rW = (isRot ? bH : bW) * currentZoom
    const rH = (isRot ? bW : bH) * currentZoom
    const maxX = Math.max(0, (rW - VIEWPORT_SIZE) / 2)
    const maxY = Math.max(0, (rH - VIEWPORT_SIZE) / 2)

    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    }
  }, [naturalSize])

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
    const rawX = e.clientX - dragStart.x
    const rawY = e.clientY - dragStart.y
    setOffset(clampOffset(rawX, rawY))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      // Ignored
    }
  }

  // Wheel zoom (clamped between 1.0 and 3.0)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.0015
    setZoom(prev => {
      const next = Math.min(Math.max(prev + delta, 1.0), 3.0)
      setOffset(cur => clampOffset(cur.x, cur.y, next))
      return next
    })
  }

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, 1.0), 3.0)
    setZoom(clampedZoom)
    setOffset(cur => clampOffset(cur.x, cur.y, clampedZoom))
  }

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation(prev => {
      const nextRot = (prev + 90) % 360
      setOffset(cur => clampOffset(cur.x, cur.y, zoom, nextRot))
      return nextRot
    })
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
    const factor = OUTPUT_SIZE / VIEWPORT_SIZE

    ctx.save()
    // High quality interpolation
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    // Center canvas coordinate system
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)

    // Apply translation from user pan
    ctx.translate(offset.x * factor, offset.y * factor)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // Apply zoom & cover scale
    const totalScale = coverScale * zoom * factor
    ctx.scale(totalScale, totalScale)

    // Draw image centered at origin
    ctx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2, naturalSize.width, naturalSize.height)
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
      0.93
    )
  }, [imageFile, zoom, rotation, offset, naturalSize, coverScale, onCropComplete])

  if (!isOpen || !imageFile || !imageSrc) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-stone-100 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
            <div>
              <h2 className="font-display text-base font-bold text-white">
                {title}
              </h2>
              <p className="text-xs text-stone-400">
                Drag to frame your photo · Slider to zoom
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body / Cropper Area */}
          <div className="flex flex-col items-center bg-black/95 px-6 py-6">
            {/* Viewport Box (Circle Crop Mask) */}
            <div
              ref={viewportRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
              className="relative cursor-grab overflow-hidden rounded-full border-2 border-teal-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-1 ring-white/20 active:cursor-grabbing"
            >
              {/* Image being manipulated */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.06s ease-out",
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

              {/* Grid overlay for alignment (shows when dragging or hovering) */}
              <div
                className={`pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-200 ${
                  isDragging ? "opacity-35" : "opacity-15"
                }`}
              >
                <div className="border-b border-r border-white/60" />
                <div className="border-b border-r border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-b border-r border-white/60" />
                <div className="border-b border-r border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-white/60" />
                <div className="border-r border-white/60" />
                <div />
              </div>
            </div>

            {isSquare && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300">
                <Sparkles className="h-3 w-3 text-teal-400" />
                Photo is square · framed automatically
              </div>
            )}

            {/* Controls Bar (LinkedIn Style) */}
            <div className="mt-5 flex w-full flex-col gap-3.5 px-2">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 0.15)}
                  disabled={zoom <= 1.0}
                  className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:opacity-30"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.01"
                  value={zoom}
                  onChange={e => handleZoomChange(parseFloat(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-700 accent-teal-400"
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 0.15)}
                  disabled={zoom >= 3.0}
                  className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:opacity-30"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <div className="h-4 w-px bg-stone-700" />

                {/* Rotate Button */}
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800/80 px-2.5 py-1.5 text-xs font-semibold text-stone-200 transition-colors hover:bg-stone-700 hover:text-white"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Rotate</span>
                </button>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 rounded-xl p-1.5 text-xs font-semibold text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
                  title="Reset to default"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-stone-800 bg-stone-900 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCropComplete(imageFile)}
              className="text-xs text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              Use as is
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Check className="h-3.5 w-3.5" />}
                onClick={handleApplyCrop}
                className="bg-teal-500 font-bold text-stone-950 hover:bg-teal-400"
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