import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { Button } from '../../components/common/Button.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { PasswordInput } from '../../components/forms/PasswordInput.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username or email is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, dashboardPath } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async ({ username, password }) => {
    try {
      await login(username, password)
      const from = location.state?.from
      navigate(from && from !== '/login' ? from : dashboardPath, { replace: true })
    } catch (error) {
      setError('root', {
        message: error?.message || 'Sign in failed. Check your credentials and try again.',
      })
    }
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardPath} replace />
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your library account to continue. Accounts are issued by library staff."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-base">
        {errors.root && (
          <AlertMessage variant="error" title="Unable to sign in">
            {errors.root.message}
          </AlertMessage>
        )}

        <FormInput
          label="Username or email"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Your username or email"
          required
          error={errors.username?.message}
          {...register('username')}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-sm">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-support text-text-secondary">
          Need an account? Ask a librarian or administrator to register you.
        </p>
      </form>
    </AuthLayout>
  )
}
