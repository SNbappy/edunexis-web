import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import MobileSidebar from "./MobileSidebar"
import { useThemeStore } from "@/store/themeStore"

function AnimatedBackground({ dark }: { dark: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base background */}
      <div className="absolute inset-0" style={{
        background: dark
          ? "rgb(11,17,32)"
          : "rgb(248,249,255)",
      }} />

      {/* Animated gradient orbs */}
      <div className="absolute orb-1" style={{
        width: 600, height: 600,
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
        top: "-10%", left: "-5%",
        filter: "blur(40px)",
        animation: "orbFloat1 18s ease-in-out infinite",
      }} />
      <div className="absolute orb-2" style={{
        width: 500, height: 500,
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        top: "20%", right: "-8%",
        filter: "blur(40px)",
        animation: "orbFloat2 22s ease-in-out infinite",
      }} />
      <div className="absolute orb-3" style={{
        width: 400, height: 400,
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        bottom: "10%", left: "30%",
        filter: "blur(40px)",
        animation: "orbFloat3 26s ease-in-out infinite",
      }} />
      <div className="absolute" style={{
        width: 300, height: 300,
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)",
        bottom: "30%", right: "20%",
        filter: "blur(30px)",
        animation: "orbFloat2 30s ease-in-out infinite reverse",
      }} />

      {/* Dot grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle, ${dark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)"} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        opacity: dark ? 0.5 : 0.6,
      }} />
    </div>
  )
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark } = useThemeStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: dark ? "rgb(11,17,32)" : "rgb(248,249,255)" }}>
      <AnimatedBackground dark={dark} />

      <div className="hidden lg:flex h-full shrink-0 relative z-10">
        <Sidebar />
      </div>
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
