# Library Management System — Frontend

React + Vite frontend for the Spring Boot Library Management System. Built incrementally;
**Phases 1–4 (setup, shared UI, login/dashboards and catalog) are complete**. Remaining
feature screens arrive in later phases.

## Requirements

- Node.js v24.18.0 (verified)
- npm 11.16.0 (verified)

On Windows PowerShell, `npm.ps1` may be blocked by execution policy. Use `npm.cmd`
(or `cmd /c npm ...`) instead of `npm`.

## Setup

```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env    # then edit if the backend URL differs
npm.cmd run dev                # http://localhost:5173
```

Other commands:

```powershell
npm.cmd run build              # production build into dist/
npm.cmd run preview            # serve the production build
npm.cmd test                   # Vitest + React Testing Library
npm.cmd run test:watch
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Spring Boot REST API base URL |

Never put database credentials or JWT secrets in `VITE_` variables. The backend allows
`http://localhost:5173` by default (`CORS_ORIGIN` overrides it).

## Structure

```
src/
  styles/         design tokens + global styles
  utils/          constants, error normalisation, formatting helpers
  services/       axios client, auth storage, endpoint services
  context/        AuthContext
  routes/         AppRoutes, ProtectedRoute, RoleBasedRoute
  layouts/        AuthLayout, DashboardLayout
  components/     common / layout / forms / tables / feedback
  pages/          auth, dashboards, books + catalog complete; rest in Phases 5-10
  test/           test setup
```

## Phase 1 notes

- Design tokens in `src/styles/variables.css` come directly from the UI/UX documentation
  (palette, 4px spacing scale, type scale, Inter font).
- `src/services/api.js` centralises the base URL, Bearer header, and error handling.
  The backend returns a JWT in the login JSON; there is no refresh endpoint and tokens
  expire after 1 hour. On `401`, the session is cleared centrally.
- `src/services/authStorage.js` keeps the token in memory plus `sessionStorage` so it
  is cleared when the tab closes. It can be swapped for cookies without changing pages.
- Frontend route guards exist, but the backend remains the authority for authorization.
- The backend omits assessed/payment dates from DTOs and has no global copies or payments
  list endpoint; later phases will adapt to the real contract rather than invent endpoints.

## Shared UI foundation (Phase 2)

- **`components/common/`** — `Button`, `StatusBadge`, `SummaryCard`, `EmptyState`, `LoadingSkeleton`
- **`components/feedback/`** — `AlertMessage`, `ErrorState`, `ConfirmationDialog`, `ToastProvider`/`notify`, `LoadingSpinner`
- **`components/forms/`** — `FormField`, `FormInput`, `FormSelect`, `FormTextarea`, `PasswordInput`, `FormError`
- **`components/tables/`** — `DataTable`, `SearchInput`, `FilterBar`, `Pagination`
- **`components/layout/`** — `Sidebar`/`SidebarNav`, `Topbar`, `MobileNavigation`, `PageHeader`, `Breadcrumbs`
- **`hooks/`** — `useAsync`, `usePagination`
- **`utils/format.js`** — money/number/date formatting and due-date derivation (date-fns)
- Accessible by design: labelled controls, `aria-invalid`/`aria-describedby`, focus-trapped dialogs with Escape support, `sr-only` captions, visible focus rings, reduced-motion handling, and status text that never relies on colour alone.
- `DashboardLayout` wraps authenticated routes; `AuthLayout` is ready for the login screen in Phase 3.

## Login and dashboards (Phase 3)

- `pages/auth/LoginPage.jsx` — RHF + Zod validation, show/hide password, loading state,
  clear error alert, and redirect to the role dashboard (or the originally requested path).
  There is deliberately **no public registration** — staff create member accounts.
- `pages/dashboards/AdminDashboard.jsx` — all eight summary cards come from
  `GET /dashboard/summary`; recent loans, recent members and overdue records use real
  paged/sorted endpoints. Availability and fine summaries use the same response.
- `pages/dashboards/LibrarianDashboard.jsx` — five operational cards plus quick actions
  and recent/overdue loans.
- `pages/dashboards/MemberDashboard.jsx` — derives counts **only** from `/loans/me` and
  `/fines/me` (MEMBER-scoped). Due soon is a client-side convenience within 7 days;
  authoritative overdue status remains on the backend.
- Router guards enforce role prefixes; the backend remains the real authorization authority.
- Charts are intentionally deferred to Phase 10 so they can use real report data instead of
  invented statistics.

## Catalog (Phase 4)

- `pages/books/CataloguePage.jsx` — member-facing catalogue: backend keyword search and
  pagination, availability counts from real `copies[]`, book details dialog. Category
  selection filters within the current page because the backend has no category filter
  parameter; this is stated in the UI rather than silently misrepresenting the data.
- `pages/books/BookListPage.jsx`, `BookFormPage.jsx`, `BookDetailsPage.jsx` — staff book
  management. The form mirrors the backend DTOs exactly (`categoryId`, `authorIds[]`,
  `copies[]` with `accessionNumber`/`acquiredDate`); copies are only sent on create.
- `pages/catalog/CategoriesPage.jsx`, `AuthorsPage.jsx` — searchable tables with create,
  edit and confirmed delete; delete failures (e.g. still referenced by books) are surfaced.
- `pages/catalog/BookCopiesPage.jsx` — copies are always scoped to a selected book because
  there is no global copies endpoint; includes status filtering and backend-enforced status
  changes.
- All writes are staff-only in the UI, with the backend still authoritative.

## Testing

Phase 1 smoke tests cover the route scaffold and role-based navigation. Phase 2 adds
tests for shared buttons, badges, tables, pagination, dialogs, alerts, form controls,
and formatting helpers. Phase 3 adds login validation/redirect tests and dashboard data
tests. Phase 4 adds catalogue search, book-form payload, category CRUD and copy-filter
tests. Run `npm.cmd test` before proceeding to each subsequent phase.
