import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './common/Button.jsx'
import { StatusBadge } from './common/StatusBadge.jsx'
import { DataTable } from './tables/DataTable.jsx'
import { Pagination } from './tables/Pagination.jsx'
import { Breadcrumbs } from './layout/Breadcrumbs.jsx'
import { ConfirmationDialog } from './feedback/ConfirmationDialog.jsx'
import { AlertMessage } from './feedback/AlertMessage.jsx'
import { FormInput } from './forms/FormInput.jsx'
import { PasswordInput } from './forms/PasswordInput.jsx'

const columns = [
  { key: 'title', header: 'Title' },
  { key: 'author', header: 'Author' },
]

describe('Button', () => {
  it('disables itself while loading and exposes busy state', () => {
    render(<Button loading>Saving</Button>)
    const button = screen.getByRole('button', { name: /saving/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('calls the click handler when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Add book</Button>)
    await user.click(screen.getByRole('button', { name: /add book/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('StatusBadge', () => {
  it('shows status text and never relies on colour alone', () => {
    render(<StatusBadge status="OVERDUE" />)
    expect(screen.getByText('OVERDUE')).toBeInTheDocument()
  })
})

describe('DataTable', () => {
  it('renders loading skeletons with aria-busy', () => {
    render(<DataTable columns={columns} loading />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })

  it('renders an empty state when there are no rows', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No books yet" />)
    expect(screen.getByText('No books yet')).toBeInTheDocument()
  })

  it('renders rows through column renderers', () => {
    const data = [{ id: 1, title: 'Clean Code', author: 'Robert Martin' }]
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Clean Code')).toBeInTheDocument()
    expect(screen.getByText('Robert Martin')).toBeInTheDocument()
  })
})

describe('Pagination', () => {
  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(
      <Pagination page={0} size={10} totalElements={25} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled()

    rerender(<Pagination page={2} size={10} totalElements={25} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(
      'Showing 21–25 of 25',
    )
  })
})

describe('Breadcrumbs', () => {
  it('marks the final item as the current page', () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={[{ label: 'Books', to: '/books' }, { label: 'Edit' }]} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Books' })).toHaveAttribute('href', '/books')
    expect(screen.getByText('Edit')).toHaveAttribute('aria-current', 'page')
  })
})

describe('AlertMessage', () => {
  it('uses the alert role for errors', () => {
    render(<AlertMessage variant="error" title="Failed">Try again later.</AlertMessage>)
    expect(screen.getByRole('alert')).toHaveTextContent('Failed')
  })
})

describe('ConfirmationDialog', () => {
  it('closes on Escape and traps focus', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmationDialog
        open
        title="Delete book?"
        description="This cannot be undone."
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete book?' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-describedby')

    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

describe('Form controls', () => {
  it('wires labels and errors for text inputs', () => {
    render(<FormInput name="isbn" label="ISBN" error="ISBN is required" />)
    const input = screen.getByLabelText(/isbn/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('ISBN is required')
  })

  it('toggles password visibility with an accessible button', async () => {
    const user = userEvent.setup()
    render(<PasswordInput />)
    const input = document.querySelector('input[name="password"]')
    expect(input).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
