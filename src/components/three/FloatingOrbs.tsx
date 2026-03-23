import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface Orb {
  size: number; color: string; top: string; left: string
  blur: number; opacity: number; duration: number; delay: number
}

const orbs: Orb[] = [
  { size: 480, color: "124,58,237",  top: "-8%",  left: "-4%",  blur: 80, opacity: 0.18, duration: 9,  delay: 0 },
  { size: 380, color: "6,182,212",   top: "55%",  left: "68%",  blur: 70, opacity: 0.14, duration: 11, delay: 2 },
  { size: 320, color: "168,85,247",  top: "25%",  left: "75%",  blur: 60, opacity: 0.16, duration: 8,  delay: 4 },
  { size: 260, color: "236,72,153",  top: "70%",  left: "8%",   blur: 55, opacity: 0.11, duration: 10, delay: 1 },
  { size: 200, color: "6,182,212",   top: "5%",   left: "48%",  blur: 50, opacity: 0.11, duration: 13, delay: 3 },
  { size: 150, color: "124,58,237",  top: "42%",  left: "30%",  blur: 40, opacity: 0.09, duration: 7,  delay: 5 },
]

export default function FloatingOrbs() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll<HTMLDivElement>(".orb")
    if (!els) return

    const tweens: gsap.core.Tween[] = []

    els.forEach((el, i) => {
      const orb = orbs[i]
      // Float animation
      tweens.push(
        gsap.to(el, {
          y: gsap.utils.random(-35, 35),
          x: gsap.utils.random(-25, 25),
          scale: gsap.utils.random(0.9, 1.15),
          duration: orb.duration,
          delay: orb.delay,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      )
      // Opacity pulse
      tweens.push(
        gsap.to(el, {
          opacity: orb.opacity * 1.6,
          duration: orb.duration * 0.6,
          delay: orb.delay + 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      )
    })

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth  - 0.5) * 2
      const my = (e.clientY / window.innerHeight - 0.5) * 2
      els.forEach((el, i) => {
        const depth = 0.5 + (i % 3) * 0.4
        gsap.to(el, {
          x: `+=${mx * depth * 8}`,
          y: `+=${my * depth * 6}`,
          duration: 1.5,
          ease: "power2.out",
          overwrite: "auto",
        })
      })
    }
    window.addEventListener("mousemove", onMouseMove)

    return () => {
      tweens.forEach(t => t.kill())
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="orb absolute rounded-full"
          style={{
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            opacity: orb.opacity,
            background: `radial-gradient(circle at 35% 35%, rgba(${orb.color},0.9) 0%, rgba(${orb.color},0.3) 50%, transparent 75%)`,
            filter: `blur(${orb.blur}px)`,
          }}
        />
      ))}
    </div>
  )
}

