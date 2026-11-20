import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from '../pages/auth/LoginPage.jsx'
import { DataTable } from '../components/tables/DataTable.jsx'
import { ConfirmationDialog } from '../components/feedback/ConfirmationDialog.jsx'
import { describeViolations, getViolations } from './axe.js'

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
    dashboardPath: '/member/dashboard',
  }),
}))

async function expectNoViolations(element) {
  const violations = await getViolations(element)
  expect(describeViolations(violations)).toBe('')
}

describe('automated accessibility checks', () => {
  it('finds no axe violations on the login screen', async () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await expectNoViolations(container)
  })

  it('finds no axe violations on a populated data table', async () => {
    const { container } = render(
      <DataTable
        caption="Books"
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'author', header: 'Author' },
        ]}
        data={[{ id: 1, title: 'Clean Code', author: 'Robert C. Martin' }]}
      />,
    )

    await expectNoViolations(container)
  })

  it('finds no axe violations on an open confirmation dialog', async () => {
    render(
      <ConfirmationDialog
        open
        title="Deactivate account?"
        description="Their records are kept."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await expectNoViolations(screen.getByRole('dialog'))
  })
})
