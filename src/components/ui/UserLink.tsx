import { Link } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import { cn } from "@/utils/cn"
import { FOCUS } from "@/components/ui/appTokens"

interface UserLinkProps {
  userId:    string | null | undefined
  name:      string | null | undefined
  photoUrl?: string | null
  /** Avatar size forwarded to Avatar component */
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Extra className on the Avatar element */
  avatarClassName?: string
  /** If true renders only the avatar, no name text beside it */
  avatarOnly?: boolean
  /** Extra classes on the outer anchor */
  className?: string
  /** Extra classes on the name text */
  nameClassName?: string
  /** stop propagation so clicks inside a card link don't double-navigate */
  stopPropagation?: boolean
}

/**
 * Clickable avatar + name that navigates to /users/:userId.
 *
 * Used everywhere a user identity appears alongside their photo:
 * course cards, course header, announcement authors, comment authors, members list.
 *
 * Falls back to a plain non-linking div when `userId` is unknown, so callers
 * never need to guard for it.
 */
export default function UserLink({
  userId,
  name,
  photoUrl,
  avatarSize = "xs",
  avatarClassName,
  avatarOnly = false,
  className,
  nameClassName,
  stopPropagation = false,
}: UserLinkProps) {
  const avatar = (
    <Avatar
      src={photoUrl ?? undefined}
      name={name ?? undefined}
      size={avatarSize}
      className={avatarClassName}
    />
  )

  const inner = avatarOnly ? avatar : (
    <>
      {avatar}
      <span className={cn("truncate", nameClassName)}>{name}</span>
    </>
  )

  if (!userId) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {inner}
      </span>
    )
  }

  return (
    <Link
      to={`/users/${userId}`}
      onClick={stopPropagation ? e => e.stopPropagation() : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg transition-opacity duration-120 hover:opacity-75",
        FOCUS,
        className,
      )}
      aria-label={name ? `View ${name}'s profile` : "View profile"}
    >
      {inner}
    </Link>
  )
}
