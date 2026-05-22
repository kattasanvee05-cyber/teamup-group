import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import OpportunitiesPage from './pages/OpportunitiesPage.jsx'
import OpportunityDetailPage from './pages/OpportunityDetailPage.jsx'
import InternshipsPage from './pages/InternshipsPage.jsx'
import InternshipDetailPage from './pages/InternshipDetailPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import ClubsPage from './pages/ClubsPage.jsx'
import ClubChatPage from './pages/ClubChatPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import StudiesPage from './pages/StudiesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import CreatePage from './pages/CreatePage.jsx'

function PageTransition({ children }) {
  return <>{children}</>
}

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

function AnimatedRoutes() {
  return (
    <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

        <Route path="/dashboard" element={
          <Protected><PageTransition><DashboardPage /></PageTransition></Protected>
        } />
        <Route path="/opportunities" element={
          <Protected><PageTransition><OpportunitiesPage /></PageTransition></Protected>
        } />
        <Route path="/opportunities/:id" element={
          <Protected><PageTransition><OpportunityDetailPage /></PageTransition></Protected>
        } />
        <Route path="/internships" element={
          <Protected><PageTransition><InternshipsPage /></PageTransition></Protected>
        } />
        <Route path="/internships/:id" element={
          <Protected><PageTransition><InternshipDetailPage /></PageTransition></Protected>
        } />
        <Route path="/projects" element={
          <Protected><PageTransition><ProjectsPage /></PageTransition></Protected>
        } />
        <Route path="/projects/:id" element={
          <Protected><PageTransition><ProjectDetailPage /></PageTransition></Protected>
        } />
        <Route path="/clubs" element={
          <Protected><PageTransition><ClubsPage /></PageTransition></Protected>
        } />
        <Route path="/clubs/:id" element={
          <Protected><ClubChatPage /></Protected>
        } />
        <Route path="/applications" element={
          <Protected><PageTransition><ApplicationsPage /></PageTransition></Protected>
        } />
        <Route path="/studies" element={
          <Protected><PageTransition><StudiesPage /></PageTransition></Protected>
        } />
        <Route path="/profile" element={
          <Protected><PageTransition><ProfilePage /></PageTransition></Protected>
        } />
        <Route path="/create" element={
          <Protected><PageTransition><CreatePage /></PageTransition></Protected>
        } />

        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <AuthProvider>
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

          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
