import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeProfileBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = window.innerWidth
    const H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(1) // Force 1x — biggest perf win
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 28

    // -- Particles only — NO O(n²) line connections --
    const COUNT = 160 // Reduced from 280
    const positions = new Float32Array(COUNT * 3)
    const colors    = new Float32Array(COUNT * 3)

    const palette = [
      new THREE.Color(0x6366f1),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0xa5b4fc),
    ]

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 70
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r; colors[i * 3+1] = c.g; colors[i * 3+2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.3, vertexColors: true,
      transparent: true, opacity: 0.45, sizeAttenuation: true,
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // -- Pre-built static lines (NOT dynamic) --
    const linePts: number[] = []
    for (let i = 0; i < 40; i++) {
      linePts.push(
        (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 20,
      )
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePts), 3))
    const lineMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.07 })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lines)

    // -- Single ring only --
    const ringGeo = new THREE.TorusGeometry(8, 0.04, 6, 48)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.1 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 4
    scene.add(ring)

    // -- Mouse tracking (throttled) --
    let lastMove = 0
    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMove < 50) return // Throttle to 20fps
      lastMove = now
      mouseRef.current = {
        x:  (e.clientX / window.innerWidth  - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      mouseRef.current = {
        x:  (t.clientX / window.innerWidth  - 0.5) * 2,
        y: -(t.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })

    // -- Animation — capped at 30fps --
    let frameId: number
    let t = 0
    let last = 0
    const targetRot = { x: 0, y: 0 }
    const currentRot = { x: 0, y: 0 }

    const animate = (now: number) => {
      frameId = requestAnimationFrame(animate)
      if (now - last < 33) return // Cap at ~30fps
      last = now
      t += 0.003

      targetRot.x = mouseRef.current.y * 0.15
      targetRot.y = mouseRef.current.x * 0.18
      currentRot.x += (targetRot.x - currentRot.x) * 0.05
      currentRot.y += (targetRot.y - currentRot.y) * 0.05

      particles.rotation.x = t * 0.02 + currentRot.x
      particles.rotation.y = t * 0.035 + currentRot.y
      lines.rotation.x     = t * 0.015 + currentRot.x * 0.5
      lines.rotation.y     = t * 0.025 + currentRot.y * 0.5
      ring.rotation.z     += 0.002
      ring.rotation.x     += 0.001

      mat.opacity = 0.35 + Math.sin(t * 0.5) * 0.1
      renderer.render(scene, camera)
    }
    frameId = requestAnimationFrame(animate)

    const onResize = () => {
      const nW = window.innerWidth, nH = window.innerHeight
      camera.aspect = nW / nH
      camera.updateProjectionMatrix()
      renderer.setSize(nW, nH)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      geo.dispose(); mat.dispose()
      lineGeo.dispose(); lineMat.dispose()
      ringGeo.dispose(); ringMat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: "none" }} />
  )
}
