import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeHeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Cleanup any prior instance (React StrictMode safety)
    if (rendererRef.current) {
      cancelAnimationFrame(frameRef.current)
      rendererRef.current.dispose()
      rendererRef.current = null
    }

    const W = mount.offsetWidth  || window.innerWidth
    const H = mount.offsetHeight || 220

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, 0.1, 100)
    camera.position.z = 10

    // -- Blue-themed palette ----------------------------------
    // #60a5fa blue-400, #22d3ee cyan-400, #818cf8 indigo-400, #a5f3fc sky-200
    const PALETTE = [
      [0.376, 0.647, 0.980],   // #60a5fa  (main blue — most common)
      [0.376, 0.647, 0.980],
      [0.376, 0.647, 0.980],
      [0.133, 0.827, 0.933],   // #22d3ee  (cyan accent)
      [0.506, 0.549, 0.984],   // #818cf8  (indigo)
      [0.647, 0.953, 0.984],   // #a5f3fc  (sky — bright pop)
    ]

    const COUNT    = 220
    const positions = new Float32Array(COUNT * 3)
    const aPhase    = new Float32Array(COUNT)
    const aSpeed    = new Float32Array(COUNT)
    const aSize     = new Float32Array(COUNT)
    const aColor    = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * W * 1.25
      positions[i*3+1] = (Math.random() - 0.5) * H * 1.25
      positions[i*3+2] = 0
      aPhase[i] = Math.random() * Math.PI * 2
      aSpeed[i] = Math.random() * 1.8 + 0.4
      // 70% small, 30% larger — matches the image style
      aSize[i]  = Math.random() < 0.70
        ? Math.random() * 1.5 + 0.8
        : Math.random() * 2.5 + 2.2
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      aColor[i*3] = col[0]; aColor[i*3+1] = col[1]; aColor[i*3+2] = col[2]
    }

    const geo     = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute("position", posAttr)
    geo.setAttribute("aPhase",   new THREE.BufferAttribute(aPhase, 1))
    geo.setAttribute("aSpeed",   new THREE.BufferAttribute(aSpeed, 1))
    geo.setAttribute("aSize",    new THREE.BufferAttribute(aSize,  1))
    geo.setAttribute("aColor",   new THREE.BufferAttribute(aColor, 3))

    // -- GLSL shaders -----------------------------------------
    const vertexShader = /* glsl */`
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      attribute vec3  aColor;
      uniform   float uTime;
      varying   float vAlpha;
      varying   vec3  vColor;
      void main() {
        float twinkle = 0.25 + 0.75 * abs(sin(uTime * aSpeed + aPhase));
        vAlpha = twinkle;
        vColor = aColor;
        gl_PointSize = aSize;
        gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const fragmentShader = /* glsl */`
      varying float vAlpha;
      varying vec3  vColor;
      void main() {
        // Square particle — no circle clip
        gl_FragColor = vec4(vColor, vAlpha);
      }
    `

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0.0 } },
      transparent: true,
      depthWrite: false,
    })

    const stars = new THREE.Points(geo, mat)
    scene.add(stars)

    // -- Mouse / touch parallax -------------------------------
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    const onMouseMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width  - 0.5) * 2
      ty = ((e.clientY - r.top)  / r.height - 0.5) * 2
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return
      const r = mount.getBoundingClientRect()
      tx = ((e.touches[0].clientX - r.left) / r.width  - 0.5) * 2
      ty = ((e.touches[0].clientY - r.top)  / r.height - 0.5) * 2
    }
    const onMouseLeave = () => { tx = 0; ty = 0 }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)
    mount.addEventListener("touchmove", onTouchMove, { passive: true })

    // -- Animation loop ---------------------------------------
    let t = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      t += 0.01

      // Smooth lerp toward cursor
      cx += (tx - cx) * 0.045
      cy += (ty - cy) * 0.045

      // Parallax offset
      stars.position.x =  cx * 28
      stars.position.y = -cy * 16

      // Very slow drift rotation
      stars.rotation.z = Math.sin(t * 0.05) * 0.014

      // Update time uniform ? drives twinkling in shader
      mat.uniforms.uTime.value = t

      renderer.render(scene, camera)
    }
    animate()

    // -- Resize handler ---------------------------------------
    const onResize = () => {
      const nW = mount.offsetWidth  || window.innerWidth
      const nH = mount.offsetHeight || 220
      renderer.setSize(nW, nH)
      camera.left   = -nW / 2;  camera.right  = nW / 2
      camera.top    =  nH / 2;  camera.bottom = -nH / 2
      camera.updateProjectionMatrix()
    }
    window.addEventListener("resize", onResize)

    // -- Cleanup ----------------------------------------------
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize",     onResize)
      window.removeEventListener("mousemove",  onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      mount.removeEventListener("touchmove",   onTouchMove)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      rendererRef.current = null
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: "all", cursor: "default" }}
    />
  )
}
