import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import NetworkBackground from './components/NetworkBackground.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import OpportunitiesPage from './pages/OpportunitiesPage.jsx'
import OpportunityDetailPage from './pages/OpportunityDetailPage.jsx'
import InternshipsPage from './pages/InternshipsPage.jsx'
import InternshipDetailPage from './pages/InternshipDetailPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'
import TeamDetailPage from './pages/TeamDetailPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import StudiesPage from './pages/StudiesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        {/* Global animated network canvas — sits behind everything */}
        <NetworkBackground />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1628',
              color: '#f0f4ff',
              border: '1px solid rgba(79,209,255,0.12)',
              borderRadius: '12px',
              fontSize: '13px',
            },
          }}
        />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <Protected><DashboardPage /></Protected>
          } />
          <Route path="/opportunities" element={
            <Protected><OpportunitiesPage /></Protected>
          } />
          <Route path="/opportunities/:id" element={
            <Protected><OpportunityDetailPage /></Protected>
          } />
          <Route path="/internships" element={
            <Protected><InternshipsPage /></Protected>
          } />
          <Route path="/internships/:id" element={
            <Protected><InternshipDetailPage /></Protected>
          } />
          <Route path="/teams" element={
            <Protected><TeamsPage /></Protected>
          } />
          <Route path="/teams/:id" element={
            <Protected><TeamDetailPage /></Protected>
          } />
          <Route path="/applications" element={
            <Protected><ApplicationsPage /></Protected>
          } />
          <Route path="/studies" element={
            <Protected><StudiesPage /></Protected>
          } />
          <Route path="/profile" element={
            <Protected><ProfilePage /></Protected>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
