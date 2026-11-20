import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AppRoutes from './routes/AppRoutes.jsx'

describe('AppRoutes (Phase 1 scaffold)', () => {
  it('renders the login placeholder without requiring authentication', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders a not-found placeholder for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
