import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { NAVIGATION, ROLE_DASHBOARD, ROLES } from '../utils/constants.js'
import LoginPage from '../pages/auth/LoginPage.jsx'
import AdminDashboard from '../pages/dashboards/AdminDashboard.jsx'
import LibrarianDashboard from '../pages/dashboards/LibrarianDashboard.jsx'
import MemberDashboard from '../pages/dashboards/MemberDashboard.jsx'
import CataloguePage from '../pages/books/CataloguePage.jsx'
import BookListPage from '../pages/books/BookListPage.jsx'
import BookFormPage from '../pages/books/BookFormPage.jsx'
import BookDetailsPage from '../pages/books/BookDetailsPage.jsx'
import CategoriesPage from '../pages/catalog/CategoriesPage.jsx'
import AuthorsPage from '../pages/catalog/AuthorsPage.jsx'
import BookCopiesPage from '../pages/catalog/BookCopiesPage.jsx'
import MemberListPage from '../pages/members/MemberListPage.jsx'
import MemberFormPage from '../pages/members/MemberFormPage.jsx'
import MemberDetailsPage from '../pages/members/MemberDetailsPage.jsx'
import ProfilePage from '../pages/members/ProfilePage.jsx'
import LoanListPage from '../pages/loans/LoanListPage.jsx'
import IssueBookPage from '../pages/loans/IssueBookPage.jsx'
import OverdueLoansPage from '../pages/loans/OverdueLoansPage.jsx'
import MyLoansPage from '../pages/loans/MyLoansPage.jsx'
import FineListPage from '../pages/fines/FineListPage.jsx'
import FineDetailsPage from '../pages/fines/FineDetailsPage.jsx'
import MyFinesPage from '../pages/fines/MyFinesPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleBasedRoute from './RoleBasedRoute.jsx'

const dashboards = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.LIBRARIAN]: LibrarianDashboard,
  [ROLES.MEMBER]: MemberDashboard,
}

const staffCatalogRoutes = (prefix) => [
  { path: `${prefix}/books`, element: <BookListPage /> },
  { path: `${prefix}/books/new`, element: <BookFormPage /> },
  { path: `${prefix}/books/:bookId/edit`, element: <BookFormPage /> },
  { path: `${prefix}/books/:bookId`, element: <BookDetailsPage /> },
  { path: `${prefix}/categories`, element: <CategoriesPage /> },
  { path: `${prefix}/authors`, element: <AuthorsPage /> },
  { path: `${prefix}/book-copies`, element: <BookCopiesPage /> },
]

const staffLoanRoutes = (prefix) => [
  { path: `${prefix}/loans`, element: <LoanListPage /> },
  { path: `${prefix}/loans/issue`, element: <IssueBookPage /> },
  { path: `${prefix}/returns`, element: <LoanListPage mode="active" /> },
  { path: `${prefix}/overdue`, element: <OverdueLoansPage /> },
]

const staffFineRoutes = (prefix) => [
  { path: `${prefix}/fines`, element: <FineListPage /> },
  { path: `${prefix}/fines/:fineId`, element: <FineDetailsPage /> },
  { path: `${prefix}/payments`, element: <FineListPage mode="payments" /> },
]

const staffMemberRoutes = (prefix) => [
  { path: `${prefix}/members`, element: <MemberListPage /> },
  { path: `${prefix}/members/new`, element: <MemberFormPage /> },
  { path: `${prefix}/members/:memberId/edit`, element: <MemberFormPage /> },
  { path: `${prefix}/members/:memberId`, element: <MemberDetailsPage /> },
  { path: `${prefix}/profile`, element: <ProfilePage /> },
]

const featureRoutes = {
  [ROLES.ADMIN]: [...staffCatalogRoutes('/admin'), ...staffMemberRoutes('/admin'), ...staffLoanRoutes('/admin'), ...staffFineRoutes('/admin')],
  [ROLES.LIBRARIAN]: [...staffCatalogRoutes('/librarian'), ...staffMemberRoutes('/librarian'), ...staffLoanRoutes('/librarian'), ...staffFineRoutes('/librarian')],
  [ROLES.MEMBER]: [
    { path: '/member/catalogue', element: <CataloguePage /> },
    { path: '/member/loans', element: <MyLoansPage /> },
    { path: '/member/fines', element: <MyFinesPage /> },
    { path: '/member/profile', element: <ProfilePage /> },
  ],
}

const implementedPaths = new Set(
  Object.values(featureRoutes)
    .flat()
    .map((route) => route.path)
    .concat(Object.values(ROLE_DASHBOARD)),
)

const placeholderRoutes = Object.fromEntries(
  Object.entries(NAVIGATION).map(([role, sections]) => [
    role,
    sections
      .flatMap((section) => section.items)
      .filter((item) => item.to && !implementedPaths.has(item.to))
      .map((item) => ({ to: item.to, label: item.label })),
  ]),
)

/** Placeholder for sections implemented in later phases. */
function Placeholder({ title }) {
  return (
    <div>
      <PageHeader title={title} breadcrumbs={[{ label: title }]} />
      <p className="text-body text-text-secondary">
        This screen is planned for a later phase. The backend endpoint already exists.
      </p>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleBasedRoute />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {Object.values(ROLES).map((role) => {
            const Dashboard = dashboards[role]
            return (
              <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
                <Route path={ROLE_DASHBOARD[role]} element={<Dashboard />} />
                {featureRoutes[role].map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
                {placeholderRoutes[role].map(({ to, label }) => (
                  <Route key={to} path={to} element={<Placeholder title={label} />} />
                ))}
              </Route>
            )
          })}
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
