import { Toaster, toast } from 'sonner'

/** Mounted once near the app root. */
export function ToastProvider() {
  return <Toaster position="top-right" richColors closeButton />
}

export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast.warning(message),
  info: (message) => toast(message),
}
