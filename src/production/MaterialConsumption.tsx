/**
 * Material Consumption Tracking
 * US-5.2: Inventory Consumption Tracking
 * 
 * Track material usage from production with variance analysis
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';

export function MaterialConsumption() {
  const {
    productionRuns,
    rawMaterials,
    workOrders,
    billsOfMaterials,
    getBOMById,
    getWorkOrderById,
  } = useProductionStore();

  // Consumption history with details
  const consumptionHistory = useMemo(() => {
    return productionRuns
      .map((run) => {
        const workOrder = getWorkOrderById(run.workOrderId);
        const bom = workOrder ? getBOMById(workOrder.bomId) : null;
        
        return {
          ...run,
          workOrder,
          bom,
          totalExpected: run.materialsConsumed.reduce((sum, mc) => sum + mc.expectedQuantity, 0),
          totalActual: run.materialsConsumed.reduce((sum, mc) => sum + mc.actualQuantity, 0),
          totalVariance: run.materialsConsumed.reduce((sum, mc) => sum + mc.variance, 0),
        };
      })
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
  }, [productionRuns, getWorkOrderById, getBOMById]);

  // Aggregate consumption by material
  const consumptionByMaterial = useMemo(() => {
    const aggregated: Record<string, {
      materialId: string;
      name: string;
      unit: string;
      totalExpected: number;
      totalActual: number;
      totalVariance: number;
      occurrences: number;
    }> = {};

    productionRuns.forEach((run) => {
      run.materialsConsumed.forEach((mc) => {
        const material = rawMaterials.find((m) => m.id === mc.materialId);
        if (!aggregated[mc.materialId]) {
          aggregated[mc.materialId] = {
            materialId: mc.materialId,
            name: material?.name || 'Unknown',
            unit: material?.unit || 'unit',
            totalExpected: 0,
            totalActual: 0,
            totalVariance: 0,
            occurrences: 0,
          };
        }
        aggregated[mc.materialId].totalExpected += mc.expectedQuantity;
        aggregated[mc.materialId].totalActual += mc.actualQuantity;
        aggregated[mc.materialId].totalVariance += mc.variance;
        aggregated[mc.materialId].occurrences += 1;
      });
    });

    return Object.values(aggregated)
      .sort((a, b) => Math.abs(b.totalVariance) - Math.abs(a.totalVariance));
  }, [productionRuns, rawMaterials]);

  // Summary stats
  const stats = useMemo(() => {
    const total = consumptionByMaterial.reduce(
      (acc, m) => ({
        expected: acc.expected + m.totalExpected,
        actual: acc.actual + m.totalActual,
        variance: acc.variance + m.totalVariance,
      }),
      { expected: 0, actual: 0, variance: 0 }
    );

    const varianceRate = total.expected > 0 
      ? ((total.variance / total.expected) * 100).toFixed(2) 
      : '0.00';

    return {
      totalRuns: productionRuns.length,
      ...total,
      varianceRate,
    };
  }, [consumptionByMaterial, productionRuns]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Consumption</h1>
          <p className="text-gray-500 mt-1">Track material usage and variance from production</p>
        </div>
        <Link
          to="/production/record"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Production
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Production Runs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRuns}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Expected Consumption</p>
          <p className="text-2xl font-bold text-gray-900">{stats.expected.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Actual Consumption</p>
          <p className="text-2xl font-bold text-gray-900">{stats.actual.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Variance Rate</p>
          <p className={`text-2xl font-bold ${parseFloat(stats.varianceRate) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.varianceRate}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consumption by Material */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Material</h2>
          <div className="space-y-3">
            {consumptionByMaterial.length === 0 ? (
              <p className="text-gray-500 text-sm">No consumption data yet</p>
            ) : (
              consumptionByMaterial.slice(0, 10).map((material) => (
                <div key={material.materialId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {material.name}
                    </span>
                    <span className={`text-sm font-medium ${getVarianceColor(material.totalVariance)}`}>
                      {material.totalVariance > 0 ? '+' : ''}{material.totalVariance.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>Expected: {material.totalExpected.toFixed(2)}</span>
                    <span className="mx-2">|</span>
                    <span>Actual: {material.totalActual.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        material.totalVariance > 0 ? 'bg-red-400' : 
                        material.totalVariance < 0 ? 'bg-green-400' : 'bg-blue-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (material.totalActual / (material.totalExpected || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consumption History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Consumption History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Work Order</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Units</th>
                  <th className="pb-2 font-medium text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {consumptionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No production runs recorded yet
                    </td>
                  </tr>
                ) : (
                  consumptionHistory.slice(0, 15).map((run) => (
                    <tr key={run.id}>
                      <td className="py-2 text-sm text-gray-500">
                        {formatDateTime(run.endTime)}
                      </td>
                      <td className="py-2">
                        <Link
                          to={`/production/work-orders/${run.workOrderId}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {run.workOrderId}
                        </Link>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {run.bom?.productName || '-'}
                      </td>
                      <td className="py-2 text-sm text-gray-600 text-right">
                        {run.quantityProduced}
                      </td>
                      <td className="py-2 text-right">
                        <span className={`text-sm font-medium ${getVarianceColor(run.totalVariance)}`}>
                          {run.totalVariance > 0 ? '+' : ''}{run.totalVariance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Variance Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Variance Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">Under Budget</p>
            <p className="text-2xl font-bold text-green-800">
              {consumptionByMaterial.filter((m) => m.totalVariance < 0).length}
            </p>
            <p className="text-xs text-green-600">materials used less than expected</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">On Target</p>
            <p className="text-2xl font-bold text-blue-800">
              {consumptionByMaterial.filter((m) => Math.abs(m.totalVariance) < 0.01).length}
            </p>
            <p className="text-xs text-blue-600">materials within tolerance</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">Over Budget</p>
            <p className="text-2xl font-bold text-red-800">
              {consumptionByMaterial.filter((m) => m.totalVariance > 0).length}
            </p>
            <p className="text-xs text-red-600">materials used more than expected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
