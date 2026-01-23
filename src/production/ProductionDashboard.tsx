/**
 * Production Dashboard
 * US-5.1: Production Dashboard
 * 
 * Overview of production metrics with KPIs, charts, and alerts
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';
import { 
  WorkOrderStatus, 
  WORK_ORDER_STATUS_COLORS,
  generateHistoricalProductionData,
  getProductionByProduct,
} from './index';

export function ProductionDashboard() {
  const {
    workOrders,
    billsOfMaterials,
    rawMaterials,
    productionRuns,
    qualityCheckpoints,
    alerts,
    getProductionStats,
    getLowStockMaterials,
    getOverdueWorkOrders,
    getBOMById,
  } = useProductionStore();

  const stats = getProductionStats();
  const lowStockMaterials = getLowStockMaterials();
  const overdueOrders = getOverdueWorkOrders();

  // Historical data for charts (mock)
  const historicalData = useMemo(() => generateHistoricalProductionData(), []);
  const productionByProduct = useMemo(() => getProductionByProduct(), []);

  // Recent work orders
  const recentOrders = useMemo(() => {
    return [...workOrders]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [workOrders]);

  // Orders by status for pie chart
  const ordersByStatus = useMemo(() => {
    const counts: Record<WorkOrderStatus, number> = {
      [WorkOrderStatus.Draft]: 0,
      [WorkOrderStatus.Scheduled]: 0,
      [WorkOrderStatus.InProgress]: 0,
      [WorkOrderStatus.QualityCheck]: 0,
      [WorkOrderStatus.Complete]: 0,
      [WorkOrderStatus.Cancelled]: 0,
    };
    workOrders.forEach((wo) => counts[wo.status]++);
    return counts;
  }, [workOrders]);

  // Active alerts
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    return colors[WORK_ORDER_STATUS_COLORS[status]] || colors.gray;
  };

  // Calculate total inventory value
  const totalInventoryValue = rawMaterials.reduce(
    (sum, m) => sum + m.currentStock * m.unitCost,
    0
  );

  // 7-day production trend
  const last7Days = historicalData.slice(-7);
  const avgDaily = last7Days.reduce((sum, d) => sum + d.unitsProduced, 0) / 7;
  const maxDaily = Math.max(...last7Days.map((d) => d.unitsProduced));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of manufacturing operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/production/work-orders/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Work Order
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl flex items-start gap-3 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : alert.severity === 'warning'
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <svg
                className={`w-5 h-5 flex-shrink-0 ${
                  alert.severity === 'critical'
                    ? 'text-red-600'
                    : alert.severity === 'warning'
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  alert.severity === 'critical' ? 'text-red-800' : 
                  alert.severity === 'warning' ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Work Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWorkOrders}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <Link to="/production/work-orders" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View all orders →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Units Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unitsProducedToday}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avg: {Math.round(avgDaily)} per day
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Defect Rate</p>
              <p className={`text-2xl font-bold ${stats.defectRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.defectRate}%
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.defectRate > 5 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <svg className={`w-6 h-6 ${stats.defectRate > 5 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/production/qc" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View QC →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">On-Time Rate</p>
              <p className={`text-2xl font-bold ${stats.onTimeRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                {stats.onTimeRate}%
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.onTimeRate >= 90 ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <svg className={`w-6 h-6 ${stats.onTimeRate >= 90 ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {overdueOrders.length} overdue
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Production Trend</h2>
          <div className="h-48 flex items-end gap-2">
            {last7Days.map((day, i) => {
              const height = maxDaily > 0 ? (day.unitsProduced / maxDaily) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%`, minHeight: day.unitsProduced > 0 ? '4px' : '0' }}
                    title={`${day.unitsProduced} units`}
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(ordersByStatus)
              .filter(([status]) => status !== WorkOrderStatus.Cancelled)
              .map(([status, count]) => {
                const total = workOrders.filter((wo) => wo.status !== WorkOrderStatus.Cancelled).length;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === WorkOrderStatus.Draft ? 'bg-gray-400' :
                          status === WorkOrderStatus.Scheduled ? 'bg-blue-500' :
                          status === WorkOrderStatus.InProgress ? 'bg-yellow-500' :
                          status === WorkOrderStatus.QualityCheck ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          <Link
            to="/production/kanban"
            className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            View Kanban board →
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Work Orders</h2>
            <Link to="/production/work-orders" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">WO#</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((wo) => {
                  const bom = getBOMById(wo.bomId);
                  return (
                    <tr key={wo.id}>
                      <td className="py-2">
                        <Link to={`/production/work-orders/${wo.id}`} className="text-sm text-blue-600 hover:underline">
                          {wo.id}
                        </Link>
                      </td>
                      <td className="py-2 text-sm text-gray-900">{bom?.productName || '-'}</td>
                      <td className="py-2 text-sm text-gray-600 text-right">{wo.quantity}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-500">{formatDate(wo.scheduledEnd)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats & Links */}
        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Materials:</span>
                <span className="font-medium">{rawMaterials.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Low Stock:</span>
                <span className={`font-medium ${lowStockMaterials.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {lowStockMaterials.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Value:</span>
                <span className="font-medium">{formatCurrency(totalInventoryValue)}</span>
              </div>
            </div>
            <Link
              to="/production/materials"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              Manage materials →
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/production/record"
                className="block w-full px-4 py-2 text-center bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                Record Production
              </Link>
              <Link
                to="/production/qc"
                className="block w-full px-4 py-2 text-center bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                Quality Control
              </Link>
              <Link
                to="/production/bom"
                className="block w-full px-4 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Manage BOMs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
