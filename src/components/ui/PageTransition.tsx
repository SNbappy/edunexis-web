import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"
import { ReactNode } from "react"

const variants = {
  initial:  { opacity: 0, y: 12, scale: 0.99 },
  animate:  { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -8, scale: 0.99,  transition: { duration: 0.18, ease: "easeIn" } },
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
