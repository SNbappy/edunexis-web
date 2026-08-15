import { useState } from 'react'
import { Users, Award, Ban, Clock } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Page, PageHero, PageSection } from '@/components/ui/Page'
import { Switch } from '@/components/ui/field'
import { ICON_STROKE, SURFACE, TEXT } from '@/components/ui/appTokens'
import { cn } from '@/utils/cn'
import { useAdmin, useTeacherGrants } from '../hooks/useAdmin'
import type { TeacherAdminDto, GrantDto, GrantStatus } from '../services/adminService'

export default function AdminSettingsPage() {
  const {
    settings, isSettingsLoading,
    teachers, isTeachersLoading,
    updateSettings, isUpdatingSettings,
    grantQuota, isGrantingQuota,
    revokeGrant, isRevokingGrant,
  } = useAdmin()

  const [grantFor, setGrantFor] = useState<TeacherAdminDto | null>(null)
  const [historyFor, setHistoryFor] = useState<TeacherAdminDto | null>(null)

  const enforced = !!settings?.courseQuotaEnforced

  return (
    <Page>
      <PageHero
        eyebrow="Platform"
        title="Admin"
        description="Course-creation limits and the allowances you grant to teachers."
        figures={[
          { value: teachers.length, label: teachers.length === 1 ? "teacher" : "teachers" },
          { value: enforced ? "On" : "Off", label: "quota enforcement" },
        ]}
      />

      <div className="h-6" />

      {/* ── Enforcement switch ─────────────────────────────────────
          The single lever that turns the whole quota system on. While it is
          off nothing below has any effect on teachers. */}
      <PageSection title="Course creation quota">
        {isSettingsLoading ? (
          <Skeleton className="m-4 h-14" rounded="xl" />
        ) : (
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
                {enforced ? 'Enforced' : 'Disabled'}
                <Badge variant={enforced ? 'warning' : 'success'} size="sm">
                  {enforced ? 'Limits apply' : 'Unlimited'}
                </Badge>
              </p>
              <p className={cn(TEXT.muted, 'mt-1 max-w-prose leading-relaxed')}>
                {enforced
                  ? 'Teachers get one free course, then need a grant from you. Courses they already created are never affected.'
                  : 'Every teacher can create unlimited courses. Turn this on when premium launches — existing courses stay, limits apply only to new ones.'}
              </p>
            </div>
            <Switch
              checked={enforced}
              onChange={next => updateSettings(next)}
              disabled={isUpdatingSettings}
              label="Enforce course creation quota"
            />
          </div>
        )}
      </PageSection>

      {/* ── Teachers ───────────────────────────────────────────── */}
      <PageSection
        title={`Teachers${teachers.length > 0 ? ` (${teachers.length})` : ''}`}
        description={enforced ? undefined : 'Allowances are inactive while the quota switch is off.'}
      >
        {isTeachersLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" rounded="lg" />)}
          </div>
        ) : teachers.length === 0 ? (
          <EmptyState
            icon={<Users strokeWidth={ICON_STROKE} />}
            title="No teachers yet"
            description="Teacher accounts appear here once they register."
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className={cn(TEXT.eyebrow, 'px-4 py-2.5')}>Teacher</th>
                  <th className={cn(TEXT.eyebrow, 'px-3 py-2.5 text-right')}>Courses</th>
                  <th className={cn(TEXT.eyebrow, 'px-3 py-2.5 text-right')}>Allowance</th>
                  <th className={cn(TEXT.eyebrow, 'px-3 py-2.5')}>Expires</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map(t => (
                  <tr key={t.id} className="transition-colors duration-120 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <p className="text-[13px] font-semibold text-foreground">
                        {t.fullName ?? t.email}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{t.email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {t.activeCourseCount}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {t.hasActiveQuota ? (
                        <span className="tabular-nums text-foreground">
                          <span className="font-semibold">{t.remainingQuota}</span>
                          <span className="text-muted-foreground"> left of {t.totalQuota}</span>
                        </span>
                      ) : (
                        <span className="text-[12.5px] text-muted-foreground">No allowance</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {t.expiresInDays === null ? (
                        <span className="text-[12.5px] text-muted-foreground">—</span>
                      ) : (
                        <ExpiryLabel days={t.expiresInDays} grants={t.activeGrantCount} />
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setHistoryFor(t)}>
                          History
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setGrantFor(t)}
                          leftIcon={<Award strokeWidth={ICON_STROKE} />}
                        >
                          Grant
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      <GrantQuotaModal
        teacher={grantFor}
        onClose={() => setGrantFor(null)}
        onGrant={(courses, accessDurationDays, note) => {
          if (!grantFor) return
          grantQuota({ teacherId: grantFor.id, courses, accessDurationDays, note })
          setGrantFor(null)
        }}
        isLoading={isGrantingQuota}
      />

      <GrantHistoryModal
        teacher={historyFor}
        onClose={() => setHistoryFor(null)}
        onRevoke={(grantId) => {
          if (!historyFor) return
          revokeGrant({ grantId, teacherId: historyFor.id })
        }}
        isRevoking={isRevokingGrant}
      />
    </Page>
  )
}

/** Colours only when the deadline is close enough to act on. */
function ExpiryLabel({ days, grants }: { days: number; grants: number }) {
  const tone = days <= 7 ? 'text-destructive' : days <= 30 ? 'text-warning' : 'text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12.5px]', tone)}>
      <Clock className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
      <span className="tabular-nums">{days === 0 ? 'today' : `${days} days`}</span>
      {grants > 1 && (
        <span className="text-muted-foreground">· {grants} grants</span>
      )}
    </span>
  )
}

const STATUS_VARIANT: Record<GrantStatus, 'success' | 'neutral' | 'warning' | 'danger'> = {
  active: 'success',
  'used-up': 'neutral',
  expired: 'warning',
  revoked: 'danger',
}

function GrantHistoryModal({
  teacher, onClose, onRevoke, isRevoking,
}: {
  teacher: TeacherAdminDto | null
  onClose: () => void
  onRevoke: (grantId: string) => void
  isRevoking?: boolean
}) {
  const { data: grants = [], isLoading } = useTeacherGrants(teacher?.id ?? null)
  const [confirmRevoke, setConfirmRevoke] = useState<GrantDto | null>(null)

  return (
    <>
      <Modal
        isOpen={!!teacher}
        onClose={onClose}
        size="xl"
        scrollable
        title={`Course allowance — ${teacher?.fullName ?? teacher?.email ?? ''}`}
        description="Every grant ever issued. Revoking withdraws unused slots only; courses already created are never removed."
      >
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" rounded="xl" />)}
          </div>
        ) : grants.length === 0 ? (
          <EmptyState
            icon={<Award strokeWidth={ICON_STROKE} />}
            title="No grants yet"
            description="This teacher has never been given a course allowance."
            className="py-10"
          />
        ) : (
          <ul className={cn(SURFACE.card, 'divide-y divide-border overflow-hidden')}>
            {grants.map(g => (
              <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                    <span className="tabular-nums">
                      {g.used} of {g.courses} used
                    </span>
                    <Badge variant={STATUS_VARIANT[g.status]} size="sm">{g.status}</Badge>
                    {g.isStarterGrant && <Badge variant="neutral" size="sm">free tier</Badge>}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {g.isRevoked
                      ? 'Revoked'
                      : g.status === 'expired'
                        ? `Expired ${new Date(g.expiresAt).toLocaleDateString()}`
                        : `Expires ${new Date(g.expiresAt).toLocaleDateString()} · ${g.expiresInDays} days`}
                    {g.grantedByEmail && ` · by ${g.grantedByEmail}`}
                    {g.note && ` · ${g.note}`}
                  </p>
                </div>

                {g.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRevoke(g)}
                    leftIcon={<Ban strokeWidth={ICON_STROKE} />}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={() => {
          if (confirmRevoke) onRevoke(confirmRevoke.id)
          setConfirmRevoke(null)
        }}
        title="Revoke this grant?"
        description={
          confirmRevoke
            ? `${confirmRevoke.remaining} unused course slot(s) will be withdrawn. Courses already created with this grant are not affected.`
            : ''
        }
        confirmLabel="Revoke grant"
        isLoading={isRevoking}
      />
    </>
  )
}

function GrantQuotaModal({
  teacher, onClose, onGrant, isLoading,
}: {
  teacher: TeacherAdminDto | null
  onClose: () => void
  onGrant: (courses: number, accessDurationDays: number, note?: string) => void
  isLoading?: boolean
}) {
  const [courses, setCourses] = useState('5')
  const [days, setDays] = useState('365')
  const [note, setNote] = useState('')

  const handleClose = () => {
    setCourses('5'); setDays('365'); setNote('')
    onClose()
  }

  const c = parseInt(courses, 10)
  const d = parseInt(days, 10)
  const valid = c > 0 && d > 0

  const expiresOn = valid
    ? new Date(Date.now() + d * 86_400_000).toLocaleDateString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  return (
    <Modal
      isOpen={!!teacher}
      onClose={handleClose}
      size="sm"
      title={`Grant courses to ${teacher?.fullName ?? teacher?.email ?? ''}`}
      description="This is added on top of any allowance they already hold."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button loading={isLoading} disabled={!valid} onClick={() => onGrant(c, d, note)}>
            Grant {valid ? c : ''} {c === 1 ? 'course' : 'courses'}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Input
          label="Courses to add"
          type="number"
          min={1}
          value={courses}
          onChange={e => setCourses(e.target.value)}
          hint={
            teacher?.hasActiveQuota
              ? `They currently have ${teacher.remainingQuota} left of ${teacher.totalQuota}.`
              : 'They have no active allowance right now.'
          }
        />
        <Input
          label="Valid for (days)"
          type="number"
          min={1}
          value={days}
          onChange={e => setDays(e.target.value)}
          hint={expiresOn ? `Expires ${expiresOn}. Unused slots lapse on that date.` : undefined}
        />
        <Input
          label="Note"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Spring 2027 premium"
          hint="Optional — shown in the grant history."
        />
      </div>
    </Modal>
  )
}
