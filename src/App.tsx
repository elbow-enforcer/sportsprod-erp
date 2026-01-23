import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './dashboard/Dashboard'
import { Projections } from './projections'
import { Costs } from './costs'
import { Revenue } from './revenue'
import { Marketing, LaunchPlan, EmailSequences, Campaigns, MarketingAnalytics, ReferralProgram } from './marketing'
import { Inventory } from './inventory'
import { Pricing } from './pricing'
import { AuthProvider, ProtectedRoute, LoginPage, RoleSelector, PermissionGate } from './auth'

// Placeholder pages for other routes
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Dev-only role selector */}
        {import.meta.env.DEV && <RoleSelector />}
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:dashboard" fallback={<AccessDenied />}>
                  <Layout title="Dashboard">
                    <Dashboard />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projections"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:projections" fallback={<AccessDenied />}>
                  <Layout title="Projections">
                    <Projections />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:revenue" fallback={<AccessDenied />}>
                  <Layout title="Revenue">
                    <Revenue />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/costs"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:costs" fallback={<AccessDenied />}>
                  <Layout title="Costs">
                    <Costs />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/capital"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:capital" fallback={<AccessDenied />}>
                  <Layout title="Capital">
                    <PlaceholderPage title="Capital" />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:inventory" fallback={<AccessDenied />}>
                  <Layout title="Inventory">
                    <Inventory />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Marketing">
                    <Marketing />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/launch"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Launch Plan">
                    <LaunchPlan />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/email"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Email Sequences">
                    <EmailSequences />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/campaigns"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Campaigns">
                    <Campaigns />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/analytics"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Marketing Analytics">
                    <MarketingAnalytics />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/referrals"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Referral Program">
                    <ReferralProgram />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <Layout title="Pricing">
                <Pricing />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
