import { useEffect, useRef, useCallback } from "react"
import * as THREE from "three"

export interface ThreeFullBackgroundRef {
  onHoverForm: (hovering: boolean) => void
}

interface Props {
  variant?: "login" | "register"
  onReady?: (ref: ThreeFullBackgroundRef) => void
}

export default function ThreeFullBackground({ variant = "login", onReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(false)

  const handleReady = useCallback(() => {
    if (onReady) {
      onReady({
        onHoverForm: (hovering: boolean) => {
          hoverRef.current = hovering
        },
      })
    }
  }, [onReady])

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth || window.innerWidth
    const H = mount.clientHeight || window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 30

    const primaryColor   = variant === "register" ? 0xf59e0b : 0x7c3aed
    const secondaryColor = variant === "register" ? 0xec4899 : 0x38bdf8

    // Particles
    const count = 320
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 80
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.35, color: primaryColor, transparent: true, opacity: 0.55,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Lines
    const lineMat = new THREE.LineBasicMaterial({ color: secondaryColor, transparent: true, opacity: 0.15 })
    const lineGeo = new THREE.BufferGeometry()
    const linePositions: number[] = []
    for (let i = 0; i < 60; i++) {
      const x1 = (Math.random() - 0.5) * 60, y1 = (Math.random() - 0.5) * 60, z1 = (Math.random() - 0.5) * 20
      const x2 = x1 + (Math.random() - 0.5) * 14, y2 = y1 + (Math.random() - 0.5) * 14, z2 = z1 + (Math.random() - 0.5) * 8
      linePositions.push(x1, y1, z1, x2, y2, z2)
    }
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3))
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lines)

    handleReady()

    let frameId: number
    let t = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      t += 0.004
      const speed = hoverRef.current ? 0.35 : 1
      particles.rotation.y = t * 0.06 * speed
      particles.rotation.x = t * 0.03 * speed
      lines.rotation.y     = t * 0.04 * speed
      mat.opacity = 0.45 + Math.sin(t * 0.8) * 0.1
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nW = mount.clientWidth, nH = mount.clientHeight
      camera.aspect = nW / nH
      camera.updateProjectionMatrix()
      renderer.setSize(nW, nH)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [variant, handleReady])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: "none",
        background: variant === "register"
          ? "linear-gradient(135deg, #0a0612 0%, #130a1e 40%, #0d0a18 100%)"
          : "linear-gradient(135deg, #03000e 0%, #0d0521 40%, #06011a 100%)",
      }}
    />
  )
}
