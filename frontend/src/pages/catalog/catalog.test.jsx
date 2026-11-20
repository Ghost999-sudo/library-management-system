import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CataloguePage from '../books/CataloguePage.jsx'
import BookFormPage from '../books/BookFormPage.jsx'
import CategoriesPage from './CategoriesPage.jsx'
import BookCopiesPage from './BookCopiesPage.jsx'

const {
  mockGetBooks, mockSearchBooks, mockGetCategories, mockGetAuthors,
  mockCreateBook, mockGetCopies, mockCreateCategory, mockDeleteCategory, mockAddCopy,
  mockRequestBook,
} = vi.hoisted(() => ({
  mockGetBooks: vi.fn(), mockSearchBooks: vi.fn(), mockGetCategories: vi.fn(),
  mockGetAuthors: vi.fn(), mockCreateBook: vi.fn(), mockGetCopies: vi.fn(),
  mockCreateCategory: vi.fn(), mockDeleteCategory: vi.fn(), mockAddCopy: vi.fn(),
  mockRequestBook: vi.fn(),
}))

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { role: 'MEMBER' }, hasRole: (role) => role === 'MEMBER' }),
}))

vi.mock('../../services/borrowRequestService.js', () => ({
  borrowRequestService: { requestBook: mockRequestBook },
}))

vi.mock('../../services/catalogService.js', () => ({
  catalogService: {
    getBooks: mockGetBooks,
    searchBooks: mockSearchBooks,
    getCategories: mockGetCategories,
    getAuthors: mockGetAuthors,
    createBook: mockCreateBook,
    getCopies: mockGetCopies,
    addCopy: mockAddCopy,
    createCategory: mockCreateCategory,
    deleteCategory: mockDeleteCategory,
  },
}))

const book = (id, title, categoryId = 1) => ({
  bookId: id,
  title,
  categoryId,
  categoryName: 'Fiction',
  isbn: `ISBN-${id}`,
  publisher: 'Example Press',
  publicationYear: 2024,
  description: '',
  authors: [{ authorId: 1, authorName: 'Author One' }],
  copies: [
    { copyId: id * 10, accessionNumber: `ACC-${id}`, status: 'AVAILABLE', acquiredDate: '2024-01-10' },
    { copyId: id * 10 + 1, accessionNumber: `ACC-${id}-2`, status: 'BORROWED', acquiredDate: '2024-01-11' },
  ],
})

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCategories.mockResolvedValue({ content: [{ categoryId: 1, categoryName: 'Fiction' }] })
  mockGetAuthors.mockResolvedValue({ content: [{ authorId: 1, authorName: 'Author One' }] })
  mockGetBooks.mockResolvedValue({ content: [book(1, 'Clean Code')], page: 0, size: 12, totalElements: 1, totalPages: 1 })
  mockSearchBooks.mockResolvedValue({ content: [book(2, 'Refactoring')], page: 0, size: 12, totalElements: 1, totalPages: 1 })
  mockGetCopies.mockResolvedValue([])
  mockCreateBook.mockResolvedValue(book(3, 'New Book'))
  mockCreateCategory.mockResolvedValue({ categoryId: 2, categoryName: 'History' })
  mockDeleteCategory.mockResolvedValue({})
  mockAddCopy.mockResolvedValue({ copyId: 1, accessionNumber: 'ACC-99', status: 'AVAILABLE' })
  mockRequestBook.mockResolvedValue({ requestId: 1, status: 'PENDING' })
})

describe('CataloguePage', () => {
  it('renders real backend books and searches through the search endpoint', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(screen.getByText('1 available')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search the catalogue'), 'refactor')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    await waitFor(() => {
      expect(mockSearchBooks).toHaveBeenCalledWith('refactor', expect.objectContaining({ page: 0, size: 12 }))
    })
    expect(await screen.findByText('Refactoring')).toBeInTheDocument()
  })

  it('sends a title-only borrow request from book details', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'View details' }))
    await user.click(await screen.findByRole('button', { name: /request this book/i }))

    await waitFor(() => expect(mockRequestBook).toHaveBeenCalledWith(1))
  })
})

describe('BookFormPage', () => {
  it('submits only backend-supported fields and strips empty copies', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/books/new']}>
        <Routes><Route path="/admin/books/new" element={<BookFormPage />} /></Routes>
      </MemoryRouter>,
    )

    await user.type(await screen.findByLabelText(/title/i), 'New Book')
    await user.selectOptions(screen.getByLabelText(/category/i), '1')
    await user.click(screen.getByLabelText('Author One'))
    await user.click(screen.getByRole('button', { name: /^add book$/i }))

    await waitFor(() => {
      expect(mockCreateBook).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Book',
        categoryId: 1,
        authorIds: [1],
      }))
    })
    expect(mockCreateBook.mock.calls[0][0].copies).toEqual([])
  })
})

describe('CategoriesPage', () => {
  it('creates a category through the modal', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CategoriesPage /></MemoryRouter>)

    expect(await screen.findByText('Fiction')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /add category/i }))
    await user.type(screen.getByLabelText(/category name/i), 'History')
    await user.click(screen.getByRole('dialog').querySelector('button[type="submit"]'))

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({ categoryName: 'History', description: undefined })
    })
  })
})

describe('BookCopiesPage', () => {
  it('loads copies for the chosen book and filters by status', async () => {
    const user = userEvent.setup()
    mockGetCopies.mockResolvedValue([
      { copyId: 1, accessionNumber: 'ACC-1', status: 'AVAILABLE', acquiredDate: '2024-01-10' },
      { copyId: 2, accessionNumber: 'ACC-2', status: 'DAMAGED', acquiredDate: '2024-01-11' },
    ])
    render(<MemoryRouter><BookCopiesPage /></MemoryRouter>)

    await user.selectOptions(await screen.findByLabelText('Book'), '1')
    expect(await screen.findByText('ACC-1')).toBeInTheDocument()
    expect(screen.getByText('ACC-2')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Status filter'), 'AVAILABLE')
    expect(screen.queryByText('ACC-2')).not.toBeInTheDocument()
  })
})
