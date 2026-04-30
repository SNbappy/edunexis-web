import {
  FaLinkedinIn, FaGithub, FaXTwitter, FaFacebookF,
} from "react-icons/fa6"
import { FaGlobe } from "react-icons/fa6"
import type { PublicProfileDto } from "@/types/auth.types"
import type { IconType } from "react-icons"

interface SocialLinksProps {
  profile: PublicProfileDto
  size?: "sm" | "md"
}

interface SocialDef {
  key: keyof PublicProfileDto
  icon: IconType
  label: string
  /** Brand background color (light + dark) */
  bg: string
}

const LINKS: ReadonlyArray<SocialDef> = [
  {
    key: "linkedInUrl",
    icon: FaLinkedinIn,
    label: "LinkedIn",
    bg: "bg-[#0A66C2] hover:bg-[#0958a5]",
  },
  {
    key: "gitHubUrl",
    icon: FaGithub,
    label: "GitHub",
    bg: "bg-[#181717] hover:bg-[#000000] dark:bg-[#2a2a2a] dark:hover:bg-[#3a3a3a]",
  },
  {
    key: "twitterUrl",
    icon: FaXTwitter,
    label: "X",
    bg: "bg-black hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-stone-100",
  },
  {
    key: "facebookUrl",
    icon: FaFacebookF,
    label: "Facebook",
    bg: "bg-[#1877F2] hover:bg-[#1566d3]",
  },
  {
    key: "websiteUrl",
    icon: FaGlobe,
    label: "Website",
    bg: "bg-teal-600 hover:bg-teal-700",
  },
]

export default function SocialLinks({ profile, size = "md" }: SocialLinksProps) {
  const present = LINKS.filter(l => {
    const url = profile[l.key] as string | null | undefined
    return Boolean(url && url.trim().length > 0)
  })

  if (present.length === 0) return null

  const btnSize = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  const openLink = (rawUrl: string) => {
    const href = /^https?:\/\//i.test(rawUrl) ? rawUrl : "https://" + rawUrl
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex items-center gap-2">
      {present.map(l => {
        const url = profile[l.key] as string
        const Icon = l.icon
        return (
          <button
            key={String(l.key)}
            type="button"
            onClick={() => openLink(url)}
            aria-label={l.label}
            title={l.label}
            className={"inline-flex " + btnSize + " items-center justify-center rounded-lg text-white shadow-sm transition-colors " + l.bg}
          >
            <Icon className={iconSize} />
          </button>
        )
      })}
    </div>
  )
}