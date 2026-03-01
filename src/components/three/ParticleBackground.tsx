import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ParticleBackground() {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000)
        camera.position.z = 8

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        mount.appendChild(renderer.domElement)

        // Particles
        const particleCount = 150
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const colorOptions = [
            new THREE.Color('#6366f1'),
            new THREE.Color('#8b5cf6'),
            new THREE.Color('#22d3ee'),
            new THREE.Color('#a78bfa'),
        ]
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10
            const c = colorOptions[Math.floor(Math.random() * colorOptions.length)]
            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b
        }
        const particleGeo = new THREE.BufferGeometry()
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        const particleMat = new THREE.PointsMaterial({
            size: 0.06, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true,
        })
        const particles = new THREE.Points(particleGeo, particleMat)
        scene.add(particles)

        // Lines
        const lineGroup = new THREE.Group()
        for (let i = 0; i < 25; i++) {
            const start = new THREE.Vector3(
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 8
            )
            const end = new THREE.Vector3(
                start.x + (Math.random() - 0.5) * 4,
                start.y + (Math.random() - 0.5) * 4,
                start.z + (Math.random() - 0.5) * 2
            )
            const geo = new THREE.BufferGeometry().setFromPoints([start, end])
            const mat = new THREE.LineBasicMaterial({ color: '#6366f1', transparent: true, opacity: 0.15 })
            lineGroup.add(new THREE.Line(geo, mat))
        }
        scene.add(lineGroup)

        // Animation loop
        let animId: number
        const clock = new THREE.Clock()
        const animate = () => {
            animId = requestAnimationFrame(animate)
            const t = clock.getElapsedTime()
            particles.rotation.y = t * 0.03
            particles.rotation.x = t * 0.015
            lineGroup.rotation.y = t * 0.02
            renderer.render(scene, camera)
        }
        animate()

        // Resize handler
        const handleResize = () => {
            if (!mount) return
            camera.aspect = mount.clientWidth / mount.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', handleResize)
            mount.removeChild(renderer.domElement)
            renderer.dispose()
            particleGeo.dispose()
            particleMat.dispose()
        }
    }, [])

    return <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none w-full h-full" />
}
