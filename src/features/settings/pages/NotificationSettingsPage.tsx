import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Bell, Mail, MessageSquare, Info } from "lucide-react"
import api from "@/lib/axios"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { Switch } from "@/components/ui/field"
import { ICON_STROKE, SURFACE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type { ApiResponse } from "@/types/api.types"

interface PreferenceDto {
  type: string
  label: string
  description: string
  inApp: boolean
  email: boolean
  sms: boolean
  supportsEmail: boolean
  supportsSms: boolean
}

interface ChannelsDto {
  /** Whether the platform has an SMS gateway configured at all. */
  smsConfigured: boolean
}

interface PreferencesResponse {
  preferences: PreferenceDto[]
  channels: ChannelsDto
}

/**
 * Which notifications you want, by type and channel.
 *
 * Everything is on until you turn it off — the server stores a row only for
 * choices you actually make, so a type added next semester arrives switched on
 * rather than silently muted for everyone who visited this page once.
 */
export default function NotificationSettingsPage() {
  const qc = useQueryClient()
  const [draft, setDraft] = useState<PreferenceDto[] | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () =>
      api.get<ApiResponse<PreferencesResponse>>("/Notifications/preferences").then(r => r.data),
    select: res => res.data,
  })

  const prefs = data?.preferences
  const smsConfigured = data?.channels?.smsConfigured ?? false

  useEffect(() => {
    if (prefs) setDraft(prefs)
  }, [prefs])

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (prefs: PreferenceDto[]) =>
      api.put<ApiResponse>("/Notifications/preferences", {
        preferences: prefs.map(p => ({
          type: p.type, inApp: p.inApp, email: p.email, sms: p.sms,
        })),
      }).then(r => r.data),
    onSuccess: res => {
      if (res.success) {
        toast.success("Notification preferences saved.")
        qc.invalidateQueries({ queryKey: ["notification-preferences"] })
      } else {
        toast.error(res.message ?? "Could not save preferences.")
      }
    },
    onError: () => toast.error("Could not save preferences."),
  })

  if (isLoading || !draft) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" rounded="xl" />
        ))}
      </div>
    )
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(prefs)
  const allOn = draft.every(p => p.inApp)

  const set = (type: string, patch: Partial<PreferenceDto>) =>
    setDraft(d => d!.map(p => (p.type === type ? { ...p, ...patch } : p)))

  /* "Turn all on/off" only touches in-app.
     Flipping every email and SMS switch on from one button is how somebody
     accidentally signs themselves up for a text message per material upload. */
  const setAll = (on: boolean) => setDraft(d => d!.map(p => ({ ...p, inApp: on })))

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={TEXT.section}>Notifications</h2>
          <p className={cn(TEXT.muted, "mt-0.5")}>
            In-app notifications are on by default. Email and SMS are opt-in.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setAll(!allOn)}>
          {allOn ? "Turn all off" : "Turn all on"}
        </Button>
      </header>

      <div className={cn(SURFACE.card, "overflow-hidden")}>
        {/* Channel header — three columns of toggles need naming once, at the
            top, rather than a label beside every switch. */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Notify me about
          </span>
          <span className="flex w-[68px] shrink-0 items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Bell className="h-3 w-3" strokeWidth={ICON_STROKE} />
            App
          </span>
          <span className="flex w-[68px] shrink-0 items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Mail className="h-3 w-3" strokeWidth={ICON_STROKE} />
            Email
          </span>
          <span className="flex w-[68px] shrink-0 items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3 w-3" strokeWidth={ICON_STROKE} />
            SMS
          </span>
        </div>

        <ul className="divide-y divide-border">
          {draft.map(p => (
            <li key={p.type} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold text-foreground">{p.label}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>

              <div className="flex w-[68px] shrink-0 justify-center">
                <Switch
                  checked={p.inApp}
                  onChange={next => set(p.type, { inApp: next })}
                  label={`${p.inApp ? "Turn off" : "Turn on"} in-app notifications for ${p.label}`}
                />
              </div>

              <div className="flex w-[68px] shrink-0 justify-center">
                {p.supportsEmail ? (
                  <Switch
                    checked={p.email}
                    onChange={next => set(p.type, { email: next })}
                    label={`${p.email ? "Turn off" : "Turn on"} emails for ${p.label}`}
                  />
                ) : (
                  /* Not every type is ever emailed. A dash states that plainly
                     instead of showing a toggle that would do nothing. */
                  <span className="text-[13px] text-muted-foreground/60" title="Never sent by email">
                    —
                  </span>
                )}
              </div>

              <div className="flex w-[68px] shrink-0 justify-center">
                {p.supportsSms ? (
                  <Switch
                    checked={p.sms}
                    onChange={next => set(p.type, { sms: next })}
                    disabled={!smsConfigured}
                    label={`${p.sms ? "Turn off" : "Turn on"} SMS for ${p.label}`}
                  />
                ) : (
                  <span className="text-[13px] text-muted-foreground/60" title="Never sent by SMS">
                    —
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Says what is actually true rather than a hard-coded line. "SMS is not
          available yet" was baked into the page, so it would have kept claiming
          that after a gateway was configured. */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          {smsConfigured
            ? "SMS goes to the phone number on your profile — add one there first if it is blank."
            : "SMS is switched off for this platform, so those toggles are disabled until an administrator configures a gateway."}
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => save(draft)} loading={isSaving} disabled={!dirty}>
          Save preferences
        </Button>
      </div>
    </div>
  )
}
