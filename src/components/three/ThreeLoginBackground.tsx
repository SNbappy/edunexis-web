import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeLoginBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    let W = mount.clientWidth
    let H = mount.clientHeight

    // ── Renderer ─────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100)
    camera.position.z = 6

    // ── Color palette ────────────────────────────
    const palette = [
      new THREE.Color("#a78bfa"),
      new THREE.Color("#67e8f9"),
      new THREE.Color("#f9a8d4"),
      new THREE.Color("#6ee7b7"),
      new THREE.Color("#fcd34d"),
      new THREE.Color("#818cf8"),
    ]

    // ── Particle field ───────────────────────────
    const COUNT = 280
    const pos   = new Float32Array(COUNT * 3)
    const col   = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 18
      pos[i*3+1] = (Math.random() - 0.5) * 14
      pos[i*3+2] = (Math.random() - 0.5) * 8
      const c    = palette[Math.floor(Math.random() * palette.length)]
      col[i*3]   = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b
      sizes[i]   = Math.random() * 0.06 + 0.02
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute("color",    new THREE.BufferAttribute(col, 3))

    const pMat = new THREE.PointsMaterial({
      size: 0.07, vertexColors: true,
      transparent: true, opacity: 0.85,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── Floating wireframe shapes ─────────────────
    const shapeConfigs = [
      { geo: new THREE.IcosahedronGeometry(0.55, 0), color: "#a78bfa", x:  2.5, y:  1.5, z: -1 },
      { geo: new THREE.TorusGeometry(0.45, 0.13, 8, 20), color: "#67e8f9", x: -2.8, y:  0.8, z: -0.5 },
      { geo: new THREE.OctahedronGeometry(0.5, 0),  color: "#f9a8d4", x:  1.2, y: -2.0, z:  0.5 },
      { geo: new THREE.TetrahedronGeometry(0.5, 0), color: "#6ee7b7", x: -1.5, y:  2.2, z: -1.5 },
      { geo: new THREE.IcosahedronGeometry(0.32, 0), color: "#fcd34d", x:  3.2, y: -1.2, z:  0 },
      { geo: new THREE.TorusKnotGeometry(0.3, 0.1, 32, 8), color: "#818cf8", x: -3.0, y: -2.0, z: -1 },
    ]

    const meshes: { mesh: THREE.Mesh; speedX: number; speedY: number; floatOffset: number }[] = []

    shapeConfigs.forEach(cfg => {
      const mat  = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: 0.55 })
      const mesh = new THREE.Mesh(cfg.geo, mat)
      mesh.position.set(cfg.x, cfg.y, cfg.z)
      scene.add(mesh)
      meshes.push({ mesh, speedX: Math.random() * 0.4 + 0.15, speedY: Math.random() * 0.3 + 0.1, floatOffset: Math.random() * Math.PI * 2 })
    })

    // ── Connection lines between nearby particles ─
    const lineMat = new THREE.LineBasicMaterial({ color: "#a78bfa", transparent: true, opacity: 0.08 })
    const linePoints: THREE.Vector3[] = []
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(Math.random() * COUNT)
      const b = Math.floor(Math.random() * COUNT)
      linePoints.push(
        new THREE.Vector3(pos[a*3], pos[a*3+1], pos[a*3+2]),
        new THREE.Vector3(pos[b*3], pos[b*3+1], pos[b*3+2]),
      )
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    scene.add(new THREE.LineSegments(lineGeo, lineMat))

    // ── Big ambient glow sphere ───────────────────
    const glowGeo = new THREE.SphereGeometry(2.5, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({ color: "#7c3aed", transparent: true, opacity: 0.04, side: THREE.BackSide })
    scene.add(new THREE.Mesh(glowGeo, glowMat))

    // ── Mouse parallax ────────────────────────────
    let targetX = 0, targetY = 0
    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 1.2
      targetY = -(e.clientY / window.innerHeight - 0.5) * 0.9
    }
    window.addEventListener("mousemove", onMouseMove)

    // ── Animation loop ────────────────────────────
    const clock = new THREE.Clock()
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Rotate particle cloud slowly
      particles.rotation.y = t * 0.025
      particles.rotation.x = t * 0.008

      // Animate each shape
      meshes.forEach(({ mesh, speedX, speedY, floatOffset }) => {
        mesh.rotation.x = t * speedX
        mesh.rotation.y = t * speedY
        mesh.position.y += Math.sin(t * 0.6 + floatOffset) * 0.004
      })

      // Smooth camera parallax
      camera.position.x += (targetX * 0.5 - camera.position.x) * 0.04
      camera.position.y += (targetY * 0.4 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ────────────────────────────
    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", onResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      pGeo.dispose(); pMat.dispose()
      meshes.forEach(({ mesh }) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose() })
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />
}
