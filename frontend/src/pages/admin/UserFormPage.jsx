import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { FormSelect } from '../../components/forms/FormSelect.jsx'
import { PasswordInput } from '../../components/forms/PasswordInput.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { getFieldErrors } from '../../utils/errors.js'
import { ROLES } from '../../utils/constants.js'

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter a valid email address.')
  .max(100, 'Email is too long.')

const roleField = z.enum(['ADMIN', 'LIBRARIAN', 'MEMBER'])

const createSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.').max(50, 'Username is too long.'),
  email: emailField,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(100, 'Password is too long.'),
  role: roleField,
})

const updateSchema = z.object({
  email: emailField,
  role: roleField,
  password: z.string().refine(
    (value) => value === '' || (value.length >= 8 && value.length <= 100),
    'Leave blank to keep the current password, or use 8–100 characters.',
  ),
})

export default function UserFormPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditing = Boolean(userId)
  const listPath = location.pathname.replace(/\/(new|\d+\/edit)$/, '') || '/admin/users'

  const { data: user, loading: loadingUser, error: loadError, run: reload } = useAsync(
    () => (isEditing ? userService.getById(userId) : Promise.resolve(null)),
    [userId],
  )

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: { username: '', email: '', password: '', role: 'MEMBER' },
  })

  useEffect(() => {
    if (!user) return
    reset({ email: user.email || '', role: user.role || 'MEMBER', password: '' })
  }, [user, reset])

  const onSubmit = async (values) => {
    let payload
    if (isEditing) {
      payload = { email: values.email, role: values.role }
      if (values.password) payload.password = values.password
    } else {
      payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      }
    }

    try {
      if (isEditing) await userService.updateUser(userId, payload)
      else await userService.createUser(payload)
      notify.success(isEditing ? 'Account updated.' : 'Account created.')
      navigate(listPath)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }))
      setError('root', { message: error.message || 'Could not save the account.' })
    }
  }

  if (isEditing && loadError) {
    return <ErrorState title="Account unavailable" message={loadError.message} onRetry={reload} />
  }
  if (isEditing && loadingUser && !user) {
    return <p className="text-body text-text-secondary">Loading account…</p>
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={isEditing ? 'Edit account' : 'Create account'}
        description={
          isEditing
            ? 'Update the email, role or password. The username cannot be changed.'
            : 'Creates a login account. Share the temporary password securely.'
        }
        breadcrumbs={[{ label: 'Users', to: listPath }, { label: isEditing ? 'Edit' : 'Create' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-lg">
        {errors.root && <AlertMessage variant="error" title="Unable to save">{errors.root.message}</AlertMessage>}

        <section className="rounded-lg border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Account details</h2>
          <div className="grid grid-cols-1 gap-base md:grid-cols-2">
            {isEditing ? (
              <FormInput
                label="Username"
                name="usernameDisplay"
                value={user?.username || ''}
                disabled
                hint="Usernames are immutable after creation."
                containerClassName="max-w-xl"
              />
            ) : (
              <FormInput
                label="Username"
                name="username"
                required
                autoComplete="off"
                error={errors.username?.message}
                {...register('username')}
              />
            )}
            <FormInput
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="off"
              error={errors.email?.message}
              {...register('email')}
            />
            <FormSelect
              label="Role"
              name="role"
              required
              options={Object.values(ROLES)}
              error={errors.role?.message}
              {...register('role')}
            />
            <PasswordInput
              label={isEditing ? 'New password (optional)' : 'Temporary password'}
              name="password"
              required={!isEditing}
              autoComplete="new-password"
              hint={isEditing ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create account'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(listPath)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
