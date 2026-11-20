import { BookOpen } from 'lucide-react'

/** Centred, card-based layout for unauthenticated screens (login etc.). */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-base">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-lg shadow-sm">
        <div className="mb-lg text-center">
          <BookOpen aria-hidden="true" className="mx-auto h-10 w-10 text-navy" />
          <h1 className="mt-md">{title}</h1>
          {subtitle && <p className="mt-xs text-body text-text-secondary">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  )
}
