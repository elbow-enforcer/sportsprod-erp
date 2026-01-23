import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './dashboard/Dashboard'
import { Projections } from './projections'
import { Costs } from './costs'
import { Revenue } from './revenue'
import { Marketing, LaunchPlan, EmailSequences, Campaigns, MarketingAnalytics, ReferralProgram, VideoPlaybook, VideoIdeasBank, CompetitorResearch, VideoBriefTemplate } from './marketing'
import { FPADashboard, QuickBooksConnect, AccountMapping, Historicals } from './fpa'
import { IncomeStatement, BalanceSheet, CashFlowStatement } from './financials'
import { Inventory } from './inventory'
import { Pricing } from './pricing'
import { AllAssumptions } from './assumptions'
import { Valuation, ValuationSummary } from './valuation'
import { InvestorCohorts } from './investors'
import { AuthProvider, ProtectedRoute, LoginPage, RoleSelector, PermissionGate } from './auth'
import { SupplierList, SupplierDetail, PurchaseOrderList, PurchaseOrderDetail, Receiving } from './supply-chain'
import { CustomerList, CustomerDetail, QuoteList, QuoteDetail, SalesOrderList, SalesOrderDetail, Fulfillment } from './sales'
import {
  ProductionDashboard,
  BOMList,
  BOMDetail,
  BOMCostChart,
  WorkOrderList,
  WorkOrderDetail,
  KanbanBoard,
  RawMaterials,
  ProductionRecording,
  QualityControl,
  MaterialConsumptionPage,
  FinishedGoods,
} from './production'

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
            path="/valuation/summary"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:dcf" fallback={<AccessDenied />}>
                  <Layout title="Valuation Summary">
                    <ValuationSummary />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/valuation"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:dcf" fallback={<AccessDenied />}>
                  <Layout title="DCF Valuation">
                    <Valuation />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assumptions"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:dcf" fallback={<AccessDenied />}>
                  <Layout title="Model Assumptions">
                    <AllAssumptions />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investors"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:dcf" fallback={<AccessDenied />}>
                  <Layout title="Investor Cohorts">
                    <InvestorCohorts />
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
            path="/marketing/playbook"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Video Playbook">
                    <VideoPlaybook />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/ideas"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Video Ideas Bank">
                    <VideoIdeasBank />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/brief"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:marketing" fallback={<AccessDenied />}>
                  <Layout title="Video Brief">
                    <VideoBriefTemplate />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials/income-statement"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:projections" fallback={<AccessDenied />}>
                  <Layout title="Income Statement">
                    <IncomeStatement />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials/balance-sheet"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:projections" fallback={<AccessDenied />}>
                  <Layout title="Balance Sheet">
                    <BalanceSheet />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials/cash-flow"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:projections" fallback={<AccessDenied />}>
                  <Layout title="Cash Flow Statement">
                    <CashFlowStatement />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpa"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:fpa" fallback={<AccessDenied />}>
                  <Layout title="FP&A Dashboard">
                    <FPADashboard />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpa/quickbooks"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:fpa" fallback={<AccessDenied />}>
                  <Layout title="QuickBooks Integration">
                    <QuickBooksConnect />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpa/mapping"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:fpa" fallback={<AccessDenied />}>
                  <Layout title="Account Mapping">
                    <AccountMapping />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpa/historicals"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:fpa" fallback={<AccessDenied />}>
                  <Layout title="Historical Financials">
                    <Historicals />
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
          <Route
            path="/supply-chain/suppliers"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:supply-chain" fallback={<AccessDenied />}>
                  <Layout title="Suppliers">
                    <SupplierList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply-chain/suppliers/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:supply-chain" fallback={<AccessDenied />}>
                  <Layout title="Supplier Detail">
                    <SupplierDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply-chain/purchase-orders"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:supply-chain" fallback={<AccessDenied />}>
                  <Layout title="Purchase Orders">
                    <PurchaseOrderList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply-chain/purchase-orders/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:supply-chain" fallback={<AccessDenied />}>
                  <Layout title="Purchase Order">
                    <PurchaseOrderDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/supply-chain/receiving"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:supply-chain" fallback={<AccessDenied />}>
                  <Layout title="Receiving">
                    <Receiving />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          
          {/* Sales & Orders Routes */}
          <Route
            path="/sales/customers"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Customers">
                    <CustomerList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/customers/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Customer Details">
                    <CustomerDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/quotes"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Quotes">
                    <QuoteList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/quotes/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Quote Details">
                    <QuoteDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Sales Orders">
                    <SalesOrderList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Order Details">
                    <SalesOrderDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/fulfillment"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:sales" fallback={<AccessDenied />}>
                  <Layout title="Fulfillment">
                    <Fulfillment />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          
          {/* Production Routes */}
          <Route
            path="/production"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Production Dashboard">
                    <ProductionDashboard />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/bom"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Bill of Materials">
                    <BOMList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/bom/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="BOM Detail">
                    <BOMDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/bom/:id/costs"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="BOM Cost Breakdown">
                    <BOMCostChart />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/work-orders"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Work Orders">
                    <WorkOrderList />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/work-orders/:id"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Work Order Detail">
                    <WorkOrderDetail />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/kanban"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Kanban Board">
                    <KanbanBoard />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/raw-materials"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Raw Materials">
                    <RawMaterials />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/recording"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Production Recording">
                    <ProductionRecording />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/quality"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Quality Control">
                    <QualityControl />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/consumption"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Material Consumption">
                    <MaterialConsumptionPage />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/finished-goods"
            element={
              <ProtectedRoute>
                <PermissionGate permission="view:production" fallback={<AccessDenied />}>
                  <Layout title="Finished Goods">
                    <FinishedGoods />
                  </Layout>
                </PermissionGate>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
