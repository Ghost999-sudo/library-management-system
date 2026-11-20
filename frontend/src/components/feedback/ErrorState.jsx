import { AlertMessage } from './AlertMessage.jsx'
import { Button } from '../common/Button.jsx'

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <AlertMessage variant="error" title={title}>
      <p>{message || 'The request could not be completed. Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-md" onClick={onRetry}>
          Try again
        </Button>
      )}
    </AlertMessage>
  )
}
