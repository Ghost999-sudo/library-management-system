import { api } from './api.js'

/** Books, copies, categories and authors. Reads are open to all roles; writes are staff-only. */
export const catalogService = {
  // Books
  getBooks(params = {}) {
    return api.get('/books', { params }).then(({ data }) => data)
  },
  searchBooks(keyword, params = {}) {
    return api.get('/books/search', { params: { keyword, ...params } }).then(({ data }) => data)
  },
  getBook(bookId) {
    return api.get(`/books/${bookId}`).then(({ data }) => data)
  },
  createBook(payload) {
    return api.post('/books', payload).then(({ data }) => data)
  },
  updateBook(bookId, payload) {
    return api.put(`/books/${bookId}`, payload).then(({ data }) => data)
  },
  deleteBook(bookId) {
    return api.delete(`/books/${bookId}`)
  },

  // Copies (always scoped to a book on reads)
  getCopies(bookId) {
    return api.get(`/books/${bookId}/copies`).then(({ data }) => data)
  },
  getAvailableCopies(bookId) {
    return api.get(`/books/${bookId}/copies/available`).then(({ data }) => data)
  },
  addCopy(bookId, payload) {
    return api.post(`/books/${bookId}/copies`, payload).then(({ data }) => data)
  },
  updateCopyStatus(copyId, status) {
    return api.patch(`/book-copies/${copyId}/status`, { status }).then(({ data }) => data)
  },

  // Categories
  getCategories(params = {}) {
    return api.get('/categories', { params }).then(({ data }) => data)
  },
  createCategory(payload) {
    return api.post('/categories', payload).then(({ data }) => data)
  },
  updateCategory(categoryId, payload) {
    return api.put(`/categories/${categoryId}`, payload).then(({ data }) => data)
  },
  deleteCategory(categoryId) {
    return api.delete(`/categories/${categoryId}`)
  },

  // Authors
  getAuthors(params = {}) {
    return api.get('/authors', { params }).then(({ data }) => data)
  },
  createAuthor(payload) {
    return api.post('/authors', payload).then(({ data }) => data)
  },
  updateAuthor(authorId, payload) {
    return api.put(`/authors/${authorId}`, payload).then(({ data }) => data)
  },
  deleteAuthor(authorId) {
    return api.delete(`/authors/${authorId}`)
  },
}
