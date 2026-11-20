/** Normalises the backend ApiErrorResponse into a single client-side error shape. */

export class AppError extends Error {
  constructor({ message, status = 0, fieldErrors = null, path = null }) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.fieldErrors = fieldErrors || {}
    this.path = path
  }
}

export function toAppError(error) {
  const data = error?.response?.data

  if (data && typeof data === 'object') {
    return new AppError({
      message: data.message || 'The request could not be completed.',
      status: data.status ?? error.response.status,
      fieldErrors: data.fieldErrors,
      path: data.path,
    })
  }

  if (error?.code === 'ECONNABORTED') {
    return new AppError({ message: 'The server took too long to respond. Please try again.' })
  }

  if (!error?.response) {
    return new AppError({
      message: 'Unable to reach the server. Check your connection and try again.',
    })
  }

  return new AppError({
    message: error.message || 'An unexpected error occurred.',
    status: error.response.status,
  })
}

export function getFieldError(error, field) {
  return error?.fieldErrors?.[field] || null
}

export function getFieldErrors(error) {
  return error?.fieldErrors || {}
}
