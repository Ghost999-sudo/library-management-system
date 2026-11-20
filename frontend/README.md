# Library Management System — Frontend

React + Vite frontend for the Spring Boot Library Management System. Built incrementally;
**Phases 1–2 (setup and shared UI foundation) are complete**. Feature screens arrive in later phases.

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
  pages/          feature screens (Phases 3-10)
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

## Testing

Phase 1 smoke tests cover the route scaffold and role-based navigation. Phase 2 adds
tests for shared buttons, badges, tables, pagination, dialogs, alerts, form controls,
and formatting helpers. Run `npm.cmd test` before proceeding to each subsequent phase.
