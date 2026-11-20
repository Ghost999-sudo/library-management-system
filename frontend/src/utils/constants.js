/** Roles, routes and status values that mirror the Spring Boot backend. */

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  MEMBER: 'MEMBER',
})

export const ROLE_DASHBOARD = Object.freeze({
  ADMIN: '/admin/dashboard',
  LIBRARIAN: '/librarian/dashboard',
  MEMBER: '/member/dashboard',
})

/** Role-based navigation from sections 5.1-5.3 of the frontend documentation. */
export const NAVIGATION = Object.freeze({
  ADMIN: [
    { label: 'Overview', items: [{ label: 'Dashboard', to: '/admin/dashboard' }] },
    {
      label: 'Library Management',
      items: [
        { label: 'Books', to: '/admin/books' },
        { label: 'Categories', to: '/admin/categories' },
        { label: 'Authors', to: '/admin/authors' },
        { label: 'Book Copies', to: '/admin/book-copies' },
        { label: 'Members', to: '/admin/members' },
        { label: 'Loans', to: '/admin/loans' },
        { label: 'Borrow Requests', to: '/admin/loans/requests' },
        { label: 'Returns', to: '/admin/returns' },
        { label: 'Fines', to: '/admin/fines' },
        { label: 'Fine Payments', to: '/admin/payments' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'Loan Reports', to: '/admin/reports/loans' },
        { label: 'Fine Reports', to: '/admin/reports/fines' },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'User Management', to: '/admin/users' },
        { label: 'Library Settings', to: '/admin/settings' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'Profile', to: '/admin/profile' }, { label: 'Logout', action: 'logout' }],
    },
  ],
  LIBRARIAN: [
    { label: 'Overview', items: [{ label: 'Dashboard', to: '/librarian/dashboard' }] },
    {
      label: 'Library Operations',
      items: [
        { label: 'Books', to: '/librarian/books' },
        { label: 'Categories', to: '/librarian/categories' },
        { label: 'Authors', to: '/librarian/authors' },
        { label: 'Book Copies', to: '/librarian/book-copies' },
        { label: 'Members', to: '/librarian/members' },
        { label: 'Loans', to: '/librarian/loans' },
        { label: 'Borrow Requests', to: '/librarian/loans/requests' },
        { label: 'Returns', to: '/librarian/returns' },
        { label: 'Overdue Books', to: '/librarian/overdue' },
        { label: 'Fines', to: '/librarian/fines' },
        { label: 'Fine Payments', to: '/librarian/payments' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'Loan Reports', to: '/librarian/reports/loans' },
        { label: 'Fine Reports', to: '/librarian/reports/fines' },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Profile', to: '/librarian/profile' },
        { label: 'Logout', action: 'logout' },
      ],
    },
  ],
  MEMBER: [
    {
      label: 'My Library',
      items: [
        { label: 'Dashboard', to: '/member/dashboard' },
        { label: 'Browse Books', to: '/member/catalogue' },
        { label: 'My Loans', to: '/member/loans' },
        { label: 'My Requests', to: '/member/requests' },
        { label: 'My Fines', to: '/member/fines' },
      ],
    },
    {
      label: 'Account',
      items: [{ label: 'My Profile', to: '/member/profile' }, { label: 'Logout', action: 'logout' }],
    },
  ],
})

export const BOOK_COPY_STATUS = Object.freeze(['AVAILABLE', 'BORROWED', 'DAMAGED', 'LOST'])
export const LOAN_STATUS = Object.freeze(['BORROWED', 'RETURNED'])
export const BORROW_REQUEST_STATUS = Object.freeze(['PENDING', 'APPROVED', 'REJECTED'])
export const FINE_STATUS = Object.freeze(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'WAIVED'])
export const USER_STATUS = Object.freeze(['ACTIVE', 'INACTIVE'])
export const MEMBER_STATUS = Object.freeze(['ACTIVE', 'INACTIVE'])
export const PAYMENT_METHODS = Object.freeze(['CASH', 'OTHER'])

/** Status tone used by StatusBadge in Phase 2. Text is always rendered too. */
export const STATUS_TONE = Object.freeze({
  AVAILABLE: 'success',
  BORROWED: 'info',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  OVERDUE: 'danger',
  DAMAGED: 'warning',
  LOST: 'danger',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  UNPAID: 'danger',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  WAIVED: 'neutral',
})
