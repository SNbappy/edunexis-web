import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Home, ArrowLeft, Lock } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(135deg,#faf9ff 0%,#fff1f2 50%,#faf9ff 100%)" }}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle,#e11d4844,transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle,#7c3aed33,transparent 70%)", filter: "blur(60px)" }} />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative mb-8 select-none"
                >
                    <div
                        className="text-[9rem] lg:text-[10rem] font-black leading-none tracking-tighter"
                        style={{
                            background: "linear-gradient(135deg,#fecdd3,#fda4af,#fecdd3)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}
                    >
                        403
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-3xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#e11d48,#be185d)", boxShadow: "0 16px 48px rgba(225,29,72,0.4)" }}
                    >
                        <Lock className="w-9 h-9 text-white" strokeWidth={1.5} />
                    </motion.div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-extrabold mb-3 tracking-tight"
                    style={{
                        background: "linear-gradient(135deg,#1e1b4b,#e11d48)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}
                >
                    Access Denied
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-medium mb-8 leading-relaxed"
                    style={{ color: "#94a3b8" }}
                >
                    You don't have permission to view this page. Contact your administrator if you believe this is an error.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-3"
                >
                    <Link to="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(225,29,72,0.3)" }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#e11d48,#be185d)" }}
                        >
                            <Home style={{ width: 16, height: 16 }} strokeWidth={2.5} />
                            Dashboard
                        </motion.button>
                    </Link>
                    <motion.button
                        onClick={() => window.history.back()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48" }}
                    >
                        <ArrowLeft style={{ width: 16, height: 16 }} strokeWidth={2.5} />
                        Go Back
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}
