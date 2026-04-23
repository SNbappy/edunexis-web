import { Linkedin, Facebook, Twitter, Github, Globe } from "lucide-react"
import type { PublicProfileDto } from "@/types/auth.types"

interface SocialLinksProps {
  profile: PublicProfileDto
  size?:   "sm" | "md"
}

const LINKS = [
  { key: "linkedInUrl", icon: Linkedin, label: "LinkedIn", color: "hover:text-[#0a66c2]" },
  { key: "gitHubUrl",   icon: Github,   label: "GitHub",   color: "hover:text-stone-900" },
  { key: "twitterUrl",  icon: Twitter,  label: "X",        color: "hover:text-stone-900" },
  { key: "facebookUrl", icon: Facebook, label: "Facebook", color: "hover:text-[#1877f2]" },
  { key: "websiteUrl",  icon: Globe,    label: "Website",  color: "hover:text-teal-600" },
] as const

export default function SocialLinks({ profile, size = "md" }: SocialLinksProps) {
  const present = LINKS.filter(l => {
    const url = (profile as any)[l.key] as string | undefined
    return !!url && url.trim().length > 0
  })

  if (present.length === 0) return null

  const btnSize  = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-2">
      {present.map(l => {
        const url = (profile as any)[l.key] as string
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
        return (
          <a
            key={l.key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            className={`inline-flex ${btnSize} items-center justify-center rounded-lg border border-border bg-stone-50 text-stone-600 transition-colors ${l.color}`}
          >
            <l.icon className={iconSize} />
          </a>
        )
      })}
    </div>
  )
}
