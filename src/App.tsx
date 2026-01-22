import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './dashboard/Dashboard'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Dashboard">
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/projections"
          element={
            <Layout title="Projections">
              <PlaceholderPage title="Projections" />
            </Layout>
          }
        />
        <Route
          path="/revenue"
          element={
            <Layout title="Revenue">
              <PlaceholderPage title="Revenue" />
            </Layout>
          }
        />
        <Route
          path="/costs"
          element={
            <Layout title="Costs">
              <PlaceholderPage title="Costs" />
            </Layout>
          }
        />
        <Route
          path="/marketing"
          element={
            <Layout title="Marketing">
              <PlaceholderPage title="Marketing" />
            </Layout>
          }
        />
        <Route
          path="/capital"
          element={
            <Layout title="Capital">
              <PlaceholderPage title="Capital" />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
