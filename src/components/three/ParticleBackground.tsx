import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth, H = mount.clientHeight
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Particles ───────────────────────────────────
    const COUNT = 200
    const positions  = new Float32Array(COUNT * 3)
    const colors     = new Float32Array(COUNT * 3)
    const velocities = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.004,
    }))

    const palette = [
      new THREE.Color("#7c3aed"),
      new THREE.Color("#a855f7"),
      new THREE.Color("#06b6d4"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#0891b2"),
    ]

    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 22
      positions[i*3+1] = (Math.random() - 0.5) * 22
      positions[i*3+2] = (Math.random() - 0.5) * 6
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.1, vertexColors: true,
      transparent: true, opacity: 0.5,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // ── Connection lines ────────────────────────────
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6, transparent: true, opacity: 0.2,
    })
    const lineGroup = new THREE.Group()
    const THRESHOLD = 5
    function rebuildLines() {
      lineGroup.clear()
      const pos = geo.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pos[i*3] - pos[j*3]
          const dy = pos[i*3+1] - pos[j*3+1]
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < THRESHOLD) {
            const opacity = (1 - dist / THRESHOLD) * 0.18
            const lm = lineMat.clone()
            lm.opacity = opacity
            const lg = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]),
              new THREE.Vector3(pos[j*3], pos[j*3+1], pos[j*3+2]),
            ])
            lineGroup.add(new THREE.Line(lg, lm))
          }
        }
      }
    }
    scene.add(lineGroup)

    // ── Mouse tracking ──────────────────────────────
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 16
      mouse.y = (e.clientY / window.innerHeight - 0.5) * -12
    }
    window.addEventListener("mousemove", onMouseMove)

    // ── Animation ───────────────────────────────────
    let animId: number
    let frame = 0
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      frame++

      // Drift particles
      const pos = geo.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        pos[i*3]   += velocities[i].x
        pos[i*3+1] += velocities[i].y
        if (Math.abs(pos[i*3])   > 11) velocities[i].x *= -1
        if (Math.abs(pos[i*3+1]) > 11) velocities[i].y *= -1

        // Subtle mouse attraction
        const dx = mouse.x - pos[i*3]
        const dy = mouse.y - pos[i*3+1]
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 4) {
          pos[i*3]   += dx * 0.0008
          pos[i*3+1] += dy * 0.0008
        }
      }
      geo.attributes.position.needsUpdate = true

      // Rebuild connection lines every 6 frames
      if (frame % 6 === 0) rebuildLines()

      // Gentle global rotation
      particles.rotation.z = t * 0.008
      camera.position.x += (mouse.x * 0.08 - camera.position.x) * 0.02
      camera.position.y += (mouse.y * 0.05 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose(); geo.dispose(); mat.dispose()
    }
  }, [])

  return <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none w-full h-full" />
}

