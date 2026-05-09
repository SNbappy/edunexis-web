import { useEffect } from "react"
import Sidebar from "./Sidebar"
import { cn } from "@/utils/cn"

interface MobileSidebarProps { isOpen: boolean; onClose: () => void }

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // DashboardLayout already locks scroll via h-screen overflow-hidden, but
  // keep this defensive for any future layout that does scroll the body.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop. pointer-events-none when closed so it never blocks touches. */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-foreground/40 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel. Always mounted; translated off-screen when closed.
          pointer-events-none guarantees no stuck-overlay scroll blocking. */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden flex transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        <div className="relative flex-1 flex flex-col overflow-hidden shadow-2xl">
          <Sidebar onItemClick={onClose} />
        </div>
      </div>
    </>
  )
}