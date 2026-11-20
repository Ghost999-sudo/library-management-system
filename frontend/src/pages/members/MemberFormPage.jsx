import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { PasswordInput } from '../../components/forms/PasswordInput.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { getFieldErrors } from '../../utils/errors.js'

const requiredText = (label, max) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`)

const accountFields = {
  username: requiredText('Username', 50),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter a valid email address.')
    .max(100, 'Email is too long.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(100, 'Password is too long.'),
}

const memberFields = {
  membershipNumber: requiredText('Membership number', 30),
  firstName: requiredText('First name', 60),
  lastName: requiredText('Last name', 60),
  admissionNumber: requiredText('Admission number', 40),
  phone: z.string().max(20, 'Phone must be 20 characters or fewer.'),
  department: z.string().max(100, 'Department must be 100 characters or fewer.'),
  registrationDate: z.string().min(1, 'Registration date is required.'),
}

const createSchema = z.object({ ...accountFields, ...memberFields })
const updateSchema = z.object(memberFields)

export default function MemberFormPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditing = Boolean(memberId)
  const listPath = location.pathname.replace(/\/(new|\d+\/edit|\d+)$/, '') || '/admin/members'

  const { data: member, loading: loadingMember } = useAsync(
    () => (isEditing ? memberService.getById(memberId) : Promise.resolve(null)),
    [memberId],
  )

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      membershipNumber: '',
      firstName: '',
      lastName: '',
      admissionNumber: '',
      phone: '',
      department: '',
      registrationDate: new Date().toISOString().slice(0, 10),
    },
  })

  useEffect(() => {
    if (!member) return
    reset({
      username: member.username || '',
      email: member.email || '',
      password: '',
      membershipNumber: member.membershipNumber || '',
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      admissionNumber: member.admissionNumber || '',
      phone: member.phone || '',
      department: member.department || '',
      registrationDate: member.registrationDate || '',
    })
  }, [member, reset])

  const onSubmit = async (values) => {
    const payload = {
      membershipNumber: values.membershipNumber.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      admissionNumber: values.admissionNumber.trim(),
      phone: values.phone.trim() || undefined,
      department: values.department.trim() || undefined,
      registrationDate: values.registrationDate,
    }
    if (!isEditing) {
      Object.assign(payload, {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      })
    }

    try {
      if (isEditing) await memberService.updateMember(memberId, payload)
      else await memberService.createMember(payload)
      notify.success(isEditing ? 'Member updated.' : 'Member registered.')
      navigate(listPath)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }))
      setError('root', { message: error.message || 'Could not save the member.' })
    }
  }

  if (isEditing && loadingMember && !member) {
    return <p className="text-body text-text-secondary">Loading member…</p>
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={isEditing ? 'Edit member' : 'Register member'}
        description={
          isEditing
            ? 'Update membership details. Login fields are managed separately from this form.'
            : 'Creates both the member record and their library login.'
        }
        breadcrumbs={[{ label: 'Members', to: listPath }, { label: isEditing ? 'Edit' : 'Register' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-lg">
        {errors.root && <AlertMessage variant="error" title="Unable to save">{errors.root.message}</AlertMessage>}

        {!isEditing && (
          <section className="rounded-card border border-border bg-surface p-base">
            <h2 className="mb-base text-card font-semibold">Account</h2>
            <div className="grid grid-cols-1 gap-base md:grid-cols-2">
              <FormInput label="Username" name="username" required autoComplete="off" error={errors.username?.message} {...register('username')} />
              <FormInput label="Email" name="email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
              <PasswordInput
                label="Temporary password"
                name="password"
                required
                autoComplete="new-password"
                hint="At least 8 characters. Share it securely with the member."
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          </section>
        )}

        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Membership details</h2>
          <div className="grid grid-cols-1 gap-base md:grid-cols-2">
            <FormInput label="Membership number" name="membershipNumber" required error={errors.membershipNumber?.message} {...register('membershipNumber')} />
            <FormInput label="Admission number" name="admissionNumber" required error={errors.admissionNumber?.message} {...register('admissionNumber')} />
            <FormInput label="First name" name="firstName" required error={errors.firstName?.message} {...register('firstName')} />
            <FormInput label="Last name" name="lastName" required error={errors.lastName?.message} {...register('lastName')} />
            <FormInput label="Phone" name="phone" error={errors.phone?.message} {...register('phone')} />
            <FormInput label="Department" name="department" error={errors.department?.message} {...register('department')} />
            <FormInput label="Registration date" name="registrationDate" type="date" required error={errors.registrationDate?.message} {...register('registrationDate')} />
          </div>
        </section>

        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : 'Register member'}</Button>
          <Button variant="secondary" onClick={() => navigate(listPath)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
