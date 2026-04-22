/** @type {import("tailwindcss").Config} */
const config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background:  "rgb(var(--background) / <alpha-value>)",
        foreground:  "rgb(var(--foreground) / <alpha-value>)",
        card:        "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        popover:     "rgb(var(--popover) / <alpha-value>)",
        border:      "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        input:       "rgb(var(--input) / <alpha-value>)",
        ring:        "rgb(var(--ring) / <alpha-value>)",
        muted: {
          DEFAULT:    "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        subtle: {
          DEFAULT:    "rgb(var(--subtle) / <alpha-value>)",
          foreground: "rgb(var(--subtle-foreground) / <alpha-value>)",
        },
        // Brand — teal (signature)
        primary: {
          50:  "rgb(var(--primary-50) / <alpha-value>)",
          100: "rgb(var(--primary-100) / <alpha-value>)",
          200: "rgb(var(--primary-200) / <alpha-value>)",
          300: "rgb(var(--primary-300) / <alpha-value>)",
          400: "rgb(var(--primary-400) / <alpha-value>)",
          500: "rgb(var(--primary-500) / <alpha-value>)",
          600: "rgb(var(--primary-600) / <alpha-value>)",
          700: "rgb(var(--primary-700) / <alpha-value>)",
          800: "rgb(var(--primary-800) / <alpha-value>)",
          900: "rgb(var(--primary-900) / <alpha-value>)",
          DEFAULT:    "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        // Accent — amber (used sparingly: pinned, streaks, highlights)
        accent: {
          DEFAULT:    "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
          soft:       "rgb(var(--accent-soft) / <alpha-value>)",
        },
        // Semantic
        success:     { DEFAULT: "rgb(var(--success) / <alpha-value>)",     soft: "rgb(var(--success-soft) / <alpha-value>)" },
        warning:     { DEFAULT: "rgb(var(--warning) / <alpha-value>)",     soft: "rgb(var(--warning-soft) / <alpha-value>)" },
        destructive: { DEFAULT: "rgb(var(--destructive) / <alpha-value>)", soft: "rgb(var(--destructive-soft) / <alpha-value>)" },
        info:        { DEFAULT: "rgb(var(--info) / <alpha-value>)",        soft: "rgb(var(--info-soft) / <alpha-value>)" },
      },
      fontFamily: {
        sans:    ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', '"Inter Variable"', "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl:  "10px",
        "2xl": "12px",
        "3xl": "16px",
      },
      boxShadow: {
        xs:   "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm:   "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        md:   "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg:   "0 10px 20px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
        xl:   "0 20px 32px -8px rgb(0 0 0 / 0.10), 0 8px 16px -8px rgb(0 0 0 / 0.04)",
        ring:      "0 0 0 4px rgb(var(--ring) / 0.18)",
        "ring-sm": "0 0 0 3px rgb(var(--ring) / 0.15)",
      },
      transitionTimingFunction: {
        "out-expo":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-soft":     "cubic-bezier(0.33, 1, 0.68, 1)",
        "smooth":       "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        120: "120ms",
        180: "180ms",
        240: "240ms",
      },
      animation: {
        "fade-in":   "fadeIn 180ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up":   "fadeUp 280ms cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":  "scaleIn 180ms cubic-bezier(0.16,1,0.3,1) both",
        "shimmer":   "shimmer 1.6s linear infinite",
        "drift":     "drift 24s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp:  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        drift:   {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%":     { transform: "translate(20px,-14px) scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
}
module.exports = config
