import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAsync } from '../../hooks/useAsync.js'
import { settingsService } from '../../services/settingsService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { getFieldErrors } from '../../utils/errors.js'

const requiredNumber = (label) =>
  z.number({ error: `Enter a valid ${label.toLowerCase()}.` })

const positiveInt = (label) =>
  requiredNumber(label).int(`${label} must be a whole number.`).positive(`${label} must be positive.`)

const nonNegativeInt = (label) =>
  requiredNumber(label).int(`${label} must be a whole number.`).min(0, `${label} cannot be negative.`)

const nonNegativeMoney = (label) =>
  requiredNumber(label).min(0, `${label} cannot be negative.`)

const schema = z.object({
  borrowingLimit: positiveInt('Borrowing limit'),
  borrowingPeriodDays: positiveInt('Borrowing period'),
  finePerDay: nonNegativeMoney('Fine per day'),
  fineGracePeriodDays: nonNegativeInt('Fine grace period'),
  maxOutstandingFine: nonNegativeMoney('Maximum outstanding fine'),
})

export default function SettingsPage() {
  const { data: settings, loading, error, run } = useAsync(() => settingsService.getSettings(), [])
  const [pendingSave, setPendingSave] = useState(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!settings) return
    reset({
      borrowingLimit: settings.borrowingLimit,
      borrowingPeriodDays: settings.borrowingPeriodDays,
      finePerDay: settings.finePerDay,
      fineGracePeriodDays: settings.fineGracePeriodDays,
      maxOutstandingFine: settings.maxOutstandingFine,
    })
  }, [settings, reset])

  const onSubmit = (values) => setPendingSave(values)

  const saveSettings = async () => {
    if (!pendingSave) return
    setSaving(true)
    try {
      await settingsService.updateSettings(pendingSave)
      notify.success('Library settings saved.')
      reset(pendingSave)
      setPendingSave(null)
    } catch (errorSave) {
      const fieldErrors = getFieldErrors(errorSave)
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }))
      setError('root', { message: errorSave.message || 'Could not save the settings.' })
      setPendingSave(null)
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return <ErrorState title="Settings unavailable" message={error.message} onRetry={run} />
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Library settings"
        description="Borrowing and fine policies enforced by the backend for every loan and return."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Library Settings' }]}
      />

      <AlertMessage variant="info">
        Changes apply to future issues and returns. Existing due dates and assessed fines are
        not recalculated.
      </AlertMessage>

      {loading && <p className="text-body text-text-secondary">Loading settings…</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-lg">
        {errors.root && <AlertMessage variant="error" title="Unable to save">{errors.root.message}</AlertMessage>}

        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Borrowing policy</h2>
          <div className="grid grid-cols-1 gap-base md:grid-cols-2">
            <FormInput
              label="Borrowing limit"
              name="borrowingLimit"
              type="number"
              step="1"
              min="1"
              required
              hint="Maximum books a member may have on loan."
              error={errors.borrowingLimit?.message}
              {...register('borrowingLimit', { valueAsNumber: true })}
            />
            <FormInput
              label="Borrowing period (days)"
              name="borrowingPeriodDays"
              type="number"
              step="1"
              min="1"
              required
              hint="Days allowed before a loan is due."
              error={errors.borrowingPeriodDays?.message}
              {...register('borrowingPeriodDays', { valueAsNumber: true })}
            />
            <FormInput
              label="Maximum outstanding fine"
              name="maxOutstandingFine"
              type="number"
              step="0.01"
              min="0"
              required
              hint="Members above this balance cannot borrow."
              error={errors.maxOutstandingFine?.message}
              {...register('maxOutstandingFine', { valueAsNumber: true })}
            />
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Fine policy</h2>
          <div className="grid grid-cols-1 gap-base md:grid-cols-2">
            <FormInput
              label="Fine per day"
              name="finePerDay"
              type="number"
              step="0.01"
              min="0"
              required
              hint="Charged for each whole overdue day after the grace period."
              error={errors.finePerDay?.message}
              {...register('finePerDay', { valueAsNumber: true })}
            />
            <FormInput
              label="Fine grace period (days)"
              name="fineGracePeriodDays"
              type="number"
              step="1"
              min="0"
              required
              hint="Overdue days before a fine starts."
              error={errors.fineGracePeriodDays?.message}
              {...register('fineGracePeriodDays', { valueAsNumber: true })}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={loading || saving} disabled={loading || saving}>
            Save settings
          </Button>
          <Button variant="secondary" onClick={run} disabled={loading || saving}>Reload</Button>
        </div>
      </form>

      <ConfirmationDialog
        open={Boolean(pendingSave)}
        title="Save library settings?"
        description="These borrowing and fine policies apply immediately to future issues and returns."
        confirmLabel="Save settings"
        tone="primary"
        onConfirm={saveSettings}
        onCancel={() => setPendingSave(null)}
      />
    </div>
  )
}
