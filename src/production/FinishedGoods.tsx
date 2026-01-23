/**
 * Finished Goods Output
 * US-5.3: Finished Goods Output
 * 
 * Track produced items with lot/batch tracking
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';
import { WorkOrderStatus } from './types';

export function FinishedGoods() {
  const {
    workOrders,
    productionRuns,
    billsOfMaterials,
    getBOMById,
  } = useProductionStore();

  // Get completed work orders (finished goods batches)
  const completedOrders = useMemo(() => {
    return workOrders
      .filter((wo) => wo.status === WorkOrderStatus.Complete)
      .map((wo) => {
        const bom = getBOMById(wo.bomId);
        const runs = productionRuns.filter((r) => r.workOrderId === wo.id);
        const totalProduced = runs.reduce((sum, r) => sum + r.quantityProduced, 0);
        const totalDefective = runs.reduce((sum, r) => sum + r.quantityDefective, 0);
        const goodUnits = totalProduced - totalDefective;
        
        return {
          ...wo,
          bom,
          runs,
          totalProduced,
          totalDefective,
          goodUnits,
          completedDate: wo.actualEnd || wo.updatedAt,
        };
      })
      .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
  }, [workOrders, productionRuns, getBOMById]);

  // Aggregate by product
  const inventoryByProduct = useMemo(() => {
    const aggregated: Record<string, {
      productId: string;
      productName: string;
      totalUnits: number;
      totalDefective: number;
      goodUnits: number;
      batches: number;
      latestBatch: string;
    }> = {};

    completedOrders.forEach((order) => {
      if (!order.bom) return;
      
      const key = order.bom.productId;
      if (!aggregated[key]) {
        aggregated[key] = {
          productId: key,
          productName: order.bom.productName,
          totalUnits: 0,
          totalDefective: 0,
          goodUnits: 0,
          batches: 0,
          latestBatch: order.completedDate,
        };
      }
      
      aggregated[key].totalUnits += order.totalProduced;
      aggregated[key].totalDefective += order.totalDefective;
      aggregated[key].goodUnits += order.goodUnits;
      aggregated[key].batches += 1;
      
      if (new Date(order.completedDate) > new Date(aggregated[key].latestBatch)) {
        aggregated[key].latestBatch = order.completedDate;
      }
    });

    return Object.values(aggregated).sort((a, b) => b.goodUnits - a.goodUnits);
  }, [completedOrders]);

  // Stats
  const stats = useMemo(() => {
    const totalGood = completedOrders.reduce((sum, o) => sum + o.goodUnits, 0);
    const totalDefective = completedOrders.reduce((sum, o) => sum + o.totalDefective, 0);
    const defectRate = totalGood + totalDefective > 0
      ? ((totalDefective / (totalGood + totalDefective)) * 100).toFixed(2)
      : '0.00';
    
    return {
      totalBatches: completedOrders.length,
      totalGood,
      totalDefective,
      defectRate,
      uniqueProducts: inventoryByProduct.length,
    };
  }, [completedOrders, inventoryByProduct]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finished Goods</h1>
          <p className="text-gray-500 mt-1">Track completed production output and inventory</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Completed Batches</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBatches}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Good Units</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalGood.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Defective Units</p>
          <p className="text-2xl font-bold text-red-600">{stats.totalDefective.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Defect Rate</p>
          <p className={`text-2xl font-bold ${parseFloat(stats.defectRate) > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.defectRate}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory by Product */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Product</h2>
          <div className="space-y-3">
            {inventoryByProduct.length === 0 ? (
              <p className="text-gray-500 text-sm">No finished goods yet</p>
            ) : (
              inventoryByProduct.map((product) => (
                <div key={product.productId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {product.productName}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {product.goodUnits.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>{product.batches} batch{product.batches !== 1 ? 'es' : ''}</span>
                    <span className="mx-2">|</span>
                    <span>Last: {formatDate(product.latestBatch)}</span>
                  </div>
                  {product.totalDefective > 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      {product.totalDefective} defective ({((product.totalDefective / product.totalUnits) * 100).toFixed(1)}%)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Batch/Lot History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Batch History</h2>
            <span className="text-xs text-gray-500">Work Order = Lot ID</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Lot ID</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-right">Good</th>
                  <th className="pb-2 font-medium text-right">Defect</th>
                  <th className="pb-2 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {completedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No completed work orders yet
                    </td>
                  </tr>
                ) : (
                  completedOrders.slice(0, 20).map((order) => (
                    <tr key={order.id}>
                      <td className="py-2">
                        <Link
                          to={`/production/work-orders/${order.id}`}
                          className="text-sm text-blue-600 hover:underline font-mono"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {order.bom?.productName || '-'}
                      </td>
                      <td className="py-2 text-sm text-green-600 font-medium text-right">
                        {order.goodUnits.toLocaleString()}
                      </td>
                      <td className="py-2 text-sm text-right">
                        {order.totalDefective > 0 ? (
                          <span className="text-red-600">{order.totalDefective}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-2 text-sm text-gray-500">
                        {formatDateTime(order.completedDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lot Details Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-800">Lot Tracking</h3>
            <p className="text-sm text-blue-700 mt-1">
              Each completed work order becomes a lot/batch ID. This enables traceability from raw materials 
              through production to finished goods. Use the Work Order ID as the lot number for any recalls 
              or quality investigations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
