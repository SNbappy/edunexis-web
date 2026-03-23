import { useState, useRef, useEffect } from "react"
import { Outlet } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import MobileSidebar from "./MobileSidebar"
import ParticleBackground from "@/components/three/ParticleBackground"
import FloatingOrbs from "@/components/three/FloatingOrbs"

gsap.registerPlugin(ScrollTrigger)

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal-card").forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, ease: "power3.out",
          scrollTrigger: {
            trigger: el, scroller: mainRef.current,
            start: "top 93%", toggleActions: "play none none none"
          }
        })
      })
    }, mainRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <ParticleBackground />
      <FloatingOrbs />
      <div className="fixed inset-0 bg-dot-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 10% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(6,182,212,0.07) 0%, transparent 55%)"
      }} />
      <div className="hidden lg:flex h-full shrink-0 relative z-10">
        <Sidebar />
      </div>
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div ref={mainRef} className="flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
