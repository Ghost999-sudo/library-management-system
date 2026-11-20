# Library Management System — Frontend

React + Vite frontend for the Spring Boot Library Management System. Built incrementally;
**all phases are complete** (setup, shared UI, login/dashboards, catalog, members, loans,
fines, administration and reports).

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
  components/     common / layout / forms / tables / feedback / loans / fines / reports
  pages/          all feature screens implemented
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

## Member management (Phase 5)

- `pages/members/MemberListPage.jsx` — staff-only list with search and status filtering.
  The backend has no member search/filter parameters, so the first 200 members are loaded
  and filtered in the browser; the UI states this limitation rather than hiding it.
- `pages/members/MemberFormPage.jsx` — registration mirrors `CreateMemberRequest`
  (`username`, `email`, `password` plus membership fields). Editing uses
  `UpdateMemberRequest`, which deliberately excludes account fields.
- `pages/members/MemberDetailsPage.jsx` — read-only `MemberResponse` view with a
  confirmed status change via `PATCH /members/{memberId}/status`.
- `pages/members/ProfilePage.jsx` — staff see their safe `UserInfo` from auth state;
  MEMBER users additionally load their own record from `/members/me`.
- Never exposes password hashes; account fields are never sent on update.

## Loan management (Phase 6)

- `pages/loans/IssueBookPage.jsx` — staff select an ACTIVE member and a book, then an
  available copy from `/books/{bookId}/copies/available`. The request contains only
  `memberId` and `copyId`; the backend calculates issue/due dates and enforces borrowing
  limits, fine limits and copy availability.
- `pages/loans/LoanListPage.jsx` — all-loan history with search/status filtering, plus
  `mode="active"` for the Returns screen. Searching filters the first 200 loans locally;
  the UI states this limitation.
- `pages/loans/OverdueLoansPage.jsx` — server-paginated `/loans/overdue`, so overdue means
  genuinely past due on the backend, not a browser-clock guess.
- `pages/loans/MyLoansPage.jsx` — MEMBER-only `/loans/me`, no return action because returns
  are staff-only. The “overdue” label is marked as an estimate.
- `hooks/useReturnLoan.js` + `components/loans/` — one confirmed return workflow. The
  optional fine from `ReturnResponse.fine` is shown in the success toast.

## Borrow requests (member requests + librarian approval)

This is an additive workflow; the existing `loans` table and its `BORROWED`/`RETURNED`
enum are unchanged. Run `backend/src/main/resources/db/borrow_requests.sql` once before
starting the backend, because `ddl-auto=validate` requires the new table to exist.

- `pages/books/CataloguePage.jsx` — members open a book and choose “Request this book”.
  Only `bookId` is sent; the librarian selects the physical copy later.
- `pages/loans/MyBorrowRequestsPage.jsx` — MEMBER-only `/borrow-requests/me`, read-only.
  A pending request reserves nothing and starts no due date.
- `pages/loans/BorrowRequestsPage.jsx` — staff queue at `/{role}/loans/requests`.
  Approving opens a copy picker and uses `/borrow-requests/{id}/approve`; rejecting
  records an optional reason. Both decisions are final and locked server-side.
- `services/borrowRequestService.js` + `components/loans/BorrowRequestHelpers.jsx` —
  API calls and shared accessible table/dialog components.
- Backend endpoints: `POST /borrow-requests` (MEMBER), `GET /borrow-requests/me`
  (MEMBER), `GET /borrow-requests` (staff), `POST /borrow-requests/{id}/approve`
  (staff), `POST /borrow-requests/{id}/reject` (staff). All dates, the loan row and
  the copy status are still calculated by `LoanService`.

## Fine management (Phase 7)

- `pages/fines/FineListPage.jsx` — staff fine history with search/status filtering, plus
  `mode="payments"` for the Fine Payments screen. Searching filters the first 200 fines
  locally because the backend has no fine search/filter parameters; the UI states this.
- `pages/fines/FineDetailsPage.jsx` — staff-only detail view combining `GET /fines/{id}`
  and `GET /fines/{id}/payments`. There is no global payments collection, so receipts are
  only visible here, per fine.
- `pages/fines/MyFinesPage.jsx` — MEMBER-only `/fines/me`, read-only. The backend restricts
  `/fines/{id}` and payment endpoints to staff, so this screen uses only `FineResponse`
  fields (including the backend-calculated `outstandingAmount`); it never recalculates.
- `hooks/useRecordPayment.js` + `components/fines/` — one payment workflow sending exactly
  `{amount, paymentMethod, referenceNumber}` to `POST /fines/{id}/payments`. Amounts over
  the outstanding balance are blocked in the form and rejected by the backend; fine status
  transitions (`UNPAID` → `PARTIALLY_PAID` → `PAID`) remain backend-owned.

## Administration (Phase 8)

- `pages/admin/UserListPage.jsx` — ADMIN-only account list with search and role/status filters
  over the first 200 accounts (the backend has no user search parameters). Accounts are
  **deactivated, never deleted** because the backend exposes no delete endpoint; the UI says so.
- `pages/admin/UserFormPage.jsx` — create sends `{username, email, password, role}` to
  `POST /users`; update sends only `{email, role}` plus an optional password to `PUT /users/{id}`.
  Username is read-only when editing because `UpdateUserRequest` has no username field.
- `pages/admin/SettingsPage.jsx` — reads/writes the single settings row via `/settings`.
  All five policy values are sent together; validation mirrors the backend (positive limits,
  non-negative money and grace period). Only ADMIN sees the route because writes are
  ADMIN-only, even though staff may read settings through the API.
- No password hashes are ever read or rendered; `UserResponse` and `UserInfo` are safe subsets.

## Reports (Phase 9)

- `pages/reports/LoanReportsPage.jsx` — staff-only `GET /reports/loans?startDate=&endDate=`.
  Cards show the backend `totalLoans` plus borrowed/returned counts derived from the returned
  rows. The bar chart groups by **issue date**, which is the field the backend filters on.
- `pages/reports/FineReportsPage.jsx` — staff-only `GET /reports/fines?startDate=&endDate=`.
  Cards and charts use only backend totals (`totalFines`, `totalAssessed`, `totalCollected`)
  and the returned fines/payments. `FineReportItem` and `PaymentReportItem` do not expose
  assessed or payment dates, so the UI deliberately does **not** invent a daily breakdown.
- `components/reports/ReportControls.jsx` — labelled ISO date inputs defaulting to the last
  30 days, with client-side start/end validation mirroring the backend. An empty range is
  never requested.
- `recharts` was added only in this phase, and both report pages are `React.lazy` routes so
  the charting code stays out of the initial bundle. Charts disable animation and are
  accompanied by text summaries; the same data is always available in tables.

## Phase 11 — Final quality assurance

Automated checks added in this phase:

- `src/routes/routes.test.jsx` covers unauthenticated redirects, the auth-loading status,
  wrong-role redirects, and `/` dispatching ADMIN/LIBRARIAN/MEMBER to their own dashboards.
- `src/test/axe.js` + `src/test/axe.test.jsx` run `axe-core` against the login screen, a
  populated `DataTable`, and an open `ConfirmationDialog`. The contrast rule is disabled in
  jsdom because it has no layout/canvas; contrast is checked from the tokens instead:
  `text-warning-ink` (`#92400E`) is 7.09:1 on white and 6.46:1 on the 10% amber tint, and the
  scoped navy focus ring (`#DBEAFE` on `#172554`) is 12.04:1.
- Design-token alignment completed after the Phase 1 review: `--spacing-2xl` / `--spacing-3xl`,
  `--radius-input` / `--radius-card` / `--radius-modal` / `--radius-section`, the darker
  warning-ink colour, visible focus rings on all inputs, and self-deactivation/self-demotion
  safeguards for the signed-in administrator.

Manual QA checklist (needs a running backend and MariaDB; not covered by unit tests):

1. Responsive smoke test at 375 px, 768 px and 1440 px: sidebar/mobile navigation, no
   horizontal overflow, readable tables, and ~44×44 px touch targets.
2. Keyboard-only pass from login: logical tab order, visible focus on every control (including
   the navy sidebar), dialog focus trap/restore, and Escape/Enter behaviour.
3. Screen-reader spot check: form labels and errors, table captions, status text that does not
   rely on colour alone, and landmark headings on each dashboard.
4. Run axe DevTools (with the colour-contrast rule enabled) against the built app, because
   jsdom cannot measure real contrast or layout.
5. Integration pass with real data for each role: confirm menus and URLs match the role,
   confirm the backend rejects cross-role writes with 403, and confirm no `password_hash` is
   ever returned or rendered.
6. Workflow pass: settings save confirmation, issue/return with backend-calculated dates and
   fines, payment recording, self-account safeguards, and report date-range requests.
7. Reduced-motion check: confirm charts and transitions stop when the OS setting is enabled.

Integration preconditions: a running Spring Boot backend, a persistent `JWT_SECRET`, at least
one ADMIN account, and the existing schema validated by `ddl-auto=validate`. Never reset or
drop tables for QA.

### Manual QA results (Phase 1 findings 6–10)

- Finding 6 — backend-limited search/filters: verified in the running UI. Users, members, loans
  and fines each disclose that search/filtering applies only to the first 200 records returned by
  the backend. No client-side-only filters were invented.
- Finding 7 — loan date filters: not added. The UI offers search and status only; issue/due/return
  dates are displayed from `LoanResponse` but are not advertised as filter inputs.
- Finding 8 — fine dates: not added. `FineResponse` exposes no assessed/payment dates, so the list
  shows amounts and status only; payment history comes from the dedicated payment endpoint.
- Finding 9 — wording/role placement: accepted difference. The shell renders “Library Portal”
  with the username and role in the header. Exact replacement wording was not supplied, so the
  current text was left unchanged.
- Finding 10 — integration/browser: login, role dashboards, settings, list pages and API calls were
  smoke-tested against the local backend with seeded QA data. Lighthouse reported accessibility
  1.0 on the login screen and the automated axe suite passes. A `POST /books` 500 was traced to
  `MultipleBagFetchException` in `BookRepository.findByIdWithDetails`; the query now eagerly fetches
  only `category` and `BookResponse` initialises the two lazy collections inside the service
  transaction. Live recheck: `GET /books` 200, `GET /books/2` 200, `POST /books` 201, `GET` of the
  created book 200, and cleanup `DELETE` 200. The observed 409s on `DELETE /books/2` and
  `DELETE /categories/1` are expected `BusinessRuleException` guards because dependent copies,
  author links, loan history and books still exist.
- Verification after these changes: backend `mvnw.cmd clean test` → 79 tests passed; frontend
  `npm.cmd test` → 69 tests passed; frontend `npm.cmd run build` → successful.

## Testing

Phase 1 smoke tests cover the route scaffold and role-based navigation. Phase 2 adds
tests for shared buttons, badges, tables, pagination, dialogs, alerts, form controls,
and formatting helpers. Phase 3 adds login validation/redirect tests and dashboard data
tests. Phase 4 adds catalogue search, book-form payload, category CRUD and copy-filter
tests. Phase 5 adds member search, create/update payload, status-change and profile-scope
tests. Phase 6 adds loan rendering, issue payload, return workflow and member scope tests.
Phase 7 adds fine rendering, payment payload validation, backend-scoped member fines and
staff-only detail/payment tests. Phase 8 adds user create/update payload, status-change and
settings validation tests. Phase 9 adds report request parameters, date-range validation and
rendered report totals tests (charts are mocked so assertions stay on the data). Phase 11 adds
route-guard tests, `axe-core` checks, self-safeguard tests and settings-confirmation tests.
Run `npm.cmd test` before proceeding to each subsequent phase.
