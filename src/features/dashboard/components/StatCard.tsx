import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

interface StatCardProps {
  title:    string
  value:    string | number
  icon:     React.ReactNode
  trend?:   string
  trendUp?: boolean
  color?:   "indigo" | "cyan" | "violet" | "emerald" | "amber"
  delay?:   number
}

const colorTokens: Record<
  NonNullable<StatCardProps["color"]>,
  { bg: string; iconBg: string; iconColor: string; trendColor: string; glow: string; border: string }
> = {
  indigo: {
    bg:         "linear-gradient(135deg,rgba(99,102,241,0.07),rgba(124,58,237,0.05))",
    iconBg:     "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(124,58,237,0.1))",
    iconColor:  "#6366f1",
    trendColor: "#6366f1",
    glow:       "0 4px 20px rgba(99,102,241,0.1)",
    border:     "rgba(99,102,241,0.13)",
  },
  cyan: {
    bg:         "linear-gradient(135deg,rgba(6,182,212,0.07),rgba(14,165,233,0.05))",
    iconBg:     "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(14,165,233,0.1))",
    iconColor:  "#06b6d4",
    trendColor: "#0891b2",
    glow:       "0 4px 20px rgba(6,182,212,0.1)",
    border:     "rgba(6,182,212,0.13)",
  },
  violet: {
    bg:         "linear-gradient(135deg,rgba(139,92,246,0.07),rgba(168,85,247,0.05))",
    iconBg:     "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(168,85,247,0.1))",
    iconColor:  "#8b5cf6",
    trendColor: "#7c3aed",
    glow:       "0 4px 20px rgba(139,92,246,0.1)",
    border:     "rgba(139,92,246,0.13)",
  },
  emerald: {
    bg:         "linear-gradient(135deg,rgba(16,185,129,0.07),rgba(20,184,166,0.05))",
    iconBg:     "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(20,184,166,0.1))",
    iconColor:  "#10b981",
    trendColor: "#059669",
    glow:       "0 4px 20px rgba(16,185,129,0.1)",
    border:     "rgba(16,185,129,0.13)",
  },
  amber: {
    bg:         "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(251,146,60,0.05))",
    iconBg:     "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,146,60,0.1))",
    iconColor:  "#f59e0b",
    trendColor: "#d97706",
    glow:       "0 4px 20px rgba(245,158,11,0.1)",
    border:     "rgba(245,158,11,0.13)",
  },
}

export default function StatCard({
  title, value, icon, trend, trendUp, color = "indigo", delay = 0,
}: StatCardProps) {
  const t = colorTokens[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl p-5 overflow-hidden cursor-default"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: `${t.glow}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Shimmer top edge */}
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${t.border.replace("0.13","0.4")}, transparent)`,
        }}
      />

      {/* Decorative corner blob */}
      <div
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `${t.iconColor}0d` }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2.5 flex-1 min-w-0">
          <p
            className="text-[12.5px] font-semibold truncate"
            style={{ color: "#6e6496" }}
          >
            {title}
          </p>
          <p
            className="text-[28px] font-extrabold leading-none tracking-tight"
            style={{ color: "#120c32", letterSpacing: "-0.03em" }}
          >
            {value}
          </p>
          {trend && (
            <p
              className="text-[11.5px] font-semibold"
              style={{ color: trendUp ? "#059669" : "#6e6496" }}
            >
              {trend}
            </p>
          )}
        </div>

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-3"
          style={{
            background: t.iconBg,
            border: `1px solid ${t.border}`,
            color: t.iconColor,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
