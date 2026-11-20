import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, subDays } from 'date-fns'
import { FormInput } from '../forms/FormInput.jsx'
import { Button } from '../common/Button.jsx'
import { AlertMessage } from '../feedback/AlertMessage.jsx'

/** Default to the last 30 days so a report never loads an unbounded range. */
export function defaultReportRange(days = 30) {
  const end = new Date()
  return {
    startDate: format(subDays(end, days - 1), 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  }
}

const schema = z
  .object({
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string().min(1, 'End date is required.'),
  })
  .refine((values) => values.startDate <= values.endDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date.',
  })

export function ReportControls({ range, onApply, loading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: range })

  return (
    <form
      onSubmit={handleSubmit((values) => onApply(values))}
      noValidate
      className="flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base"
      aria-label="Report date range"
    >
      <FormInput
        label="Start date"
        name="startDate"
        type="date"
        required
        error={errors.startDate?.message}
        {...register('startDate')}
      />
      <FormInput
        label="End date"
        name="endDate"
        type="date"
        required
        error={errors.endDate?.message}
        {...register('endDate')}
      />
      <Button type="submit" loading={loading}>Apply range</Button>
      <Button variant="secondary" type="button" onClick={() => {
        reset(range)
        onApply(range)
      }}>
        Reset
      </Button>
      {errors.root && <AlertMessage variant="error">{errors.root.message}</AlertMessage>}
    </form>
  )
}
