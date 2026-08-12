import { useState } from 'react'
import { Shield, Users, ToggleLeft, ToggleRight, Award } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useAdmin } from '../hooks/useAdmin'
import type { TeacherAdminDto } from '../services/adminService'

export default function AdminSettingsPage() {
  const {
    settings, isSettingsLoading,
    teachers, isTeachersLoading,
    updateSettings, isUpdatingSettings,
    grantQuota, isGrantingQuota,
  } = useAdmin()

  const [quotaModalTeacher, setQuotaModalTeacher] = useState<TeacherAdminDto | null>(null)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Admin
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Platform-wide settings and teacher management.
        </p>
      </header>

      {/* Platform settings card */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Shield className="h-4 w-4 text-teal-600" />
          <h2 className="text-[15px] font-bold text-foreground">Course creation quota</h2>
        </div>

        {isSettingsLoading ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {settings?.courseQuotaEnforced
                  ? "Enforced - teachers limited to 1 free course"
                  : "Disabled - teachers can create unlimited courses"}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {settings?.courseQuotaEnforced
                  ? "Teachers past their limit must request more from you."
                  : "Turn this on when premium launches to start limiting free accounts."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateSettings(!settings?.courseQuotaEnforced)}
              disabled={isUpdatingSettings}
              className="shrink-0 disabled:opacity-50"
              aria-label="Toggle course quota enforcement"
            >
              {settings?.courseQuotaEnforced ? (
                <ToggleRight className="h-9 w-9 text-teal-600" />
              ) : (
                <ToggleLeft className="h-9 w-9 text-muted-foreground" />
              )}
            </button>
          </div>
        )}
      </section>

      {/* Teachers table */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Users className="h-4 w-4 text-teal-600" />
          <h2 className="text-[15px] font-bold text-foreground">
            Teachers {teachers.length > 0 && "(" + teachers.length + ")"}
          </h2>
        </div>

        {isTeachersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No teachers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4">Teacher</th>
                  <th className="pb-2 pr-4">Active courses</th>
                  <th className="pb-2 pr-4">Quota</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b border-border/50 text-[13px]">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-foreground">{t.fullName ?? t.email}</p>
                      <p className="text-[11.5px] text-muted-foreground">{t.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-foreground">{t.activeCourseCount}</td>
                    <td className="py-3 pr-4">
                      {t.hasActiveQuota ? (
                        <span className="text-foreground">{t.usedQuota} / {t.totalQuota}</span>
                      ) : (
                        <span className="text-muted-foreground">No quota</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="secondary"
                        className="text-[12px] py-1.5 px-3"
                        onClick={() => setQuotaModalTeacher(t)}
                      >
                        <Award className="h-3.5 w-3.5" />
                        Grant quota
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <GrantQuotaModal
        teacher={quotaModalTeacher}
        onClose={() => setQuotaModalTeacher(null)}
        onGrant={(totalQuota, accessDurationDays) => {
          if (!quotaModalTeacher) return
          grantQuota({ teacherId: quotaModalTeacher.id, totalQuota, accessDurationDays })
          setQuotaModalTeacher(null)
        }}
        isLoading={isGrantingQuota}
      />
    </div>
  )
}

function GrantQuotaModal({
  teacher, onClose, onGrant, isLoading,
}: {
  teacher: TeacherAdminDto | null
  onClose: () => void
  onGrant: (totalQuota: number, accessDurationDays: number) => void
  isLoading?: boolean
}) {
  const [totalQuota, setTotalQuota] = useState("5")
  const [accessDays, setAccessDays] = useState("365")

  const handleClose = () => {
    setTotalQuota("5")
    setAccessDays("365")
    onClose()
  }

  const handleSubmit = () => {
    const q = parseInt(totalQuota, 10)
    const d = parseInt(accessDays, 10)
    if (!q || q <= 0 || !d || d <= 0) return
    onGrant(q, d)
  }

  return (
    <Modal isOpen={!!teacher} onClose={handleClose} size="sm" title={"Grant quota to " + (teacher?.fullName ?? teacher?.email ?? "")}>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-foreground">
            Total courses allowed
          </label>
          <input
            type="number"
            min={1}
            value={totalQuota}
            onChange={e => setTotalQuota(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-foreground">
            Access duration (days)
          </label>
          <input
            type="number"
            min={1}
            value={accessDays}
            onChange={e => setAccessDays(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="flex-1" loading={isLoading} onClick={handleSubmit}>
            Grant quota
          </Button>
        </div>
      </div>
    </Modal>
  )
}