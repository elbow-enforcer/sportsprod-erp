/**
 * @file SupplierDetail.tsx
 * @description Supplier detail view with contact info, terms, performance metrics, and PO history
 * @related-prd tasks/prd-supply-chain.md#US-1.2, US-1.3
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useSupplyChainStore } from './store';
import { PO_STATUS_LABELS, PO_STATUS_COLORS } from './types';

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplierById, getSupplierPerformance, purchaseOrders } = useSupplyChainStore();

  const supplier = id ? getSupplierById(id) : undefined;
  const performance = id ? getSupplierPerformance(id) : null;
  const supplierPOs = purchaseOrders.filter((po) => po.supplierId === id);

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-500 mb-4">The requested supplier could not be found.</p>
        <button
          onClick={() => navigate('/supply-chain/suppliers')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/supply-chain/suppliers')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[supplier.status]}`}
              >
                {supplier.status}
              </span>
            </div>
            <p className="text-gray-500">Supplier Code: {supplier.code}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/supply-chain/purchase-orders/new?supplier=${id}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Purchase Order
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Contact Name</p>
              <p className="font-medium">{supplier.contactName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">
                {supplier.contactEmail ? (
                  <a href={`mailto:${supplier.contactEmail}`} className="text-blue-600 hover:underline">
                    {supplier.contactEmail}
                  </a>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">
                {supplier.contactPhone ? (
                  <a href={`tel:${supplier.contactPhone}`} className="text-blue-600 hover:underline">
                    {supplier.contactPhone}
                  </a>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-medium">{supplier.address || '-'}</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4">Terms & Conditions</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Payment Terms</p>
              <p className="font-medium">{supplier.paymentTerms}</p>
            </div>
            <div>
              <p className="text-gray-500">Lead Time</p>
              <p className="font-medium">{supplier.leadTimeDays} days</p>
            </div>
            <div>
              <p className="text-gray-500">Minimum Order Value</p>
              <p className="font-medium">${supplier.minimumOrderValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${star <= supplier.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4">Performance Metrics</h3>
          {performance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{performance.totalOrders}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${(performance.totalValue / 1000).toFixed(1)}K
                  </p>
                  <p className="text-sm text-gray-500">Total Value</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>On-Time Delivery</span>
                  <span className="font-medium">{performance.onTimeDeliveryRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${performance.onTimeDeliveryRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quality Acceptance</span>
                  <span className="font-medium">{performance.qualityAcceptanceRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${performance.qualityAcceptanceRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">Notes</h3>
          <p className="text-gray-600">{supplier.notes}</p>
        </div>
      )}

      {/* Purchase Order History */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Purchase Order History</h3>
        {supplierPOs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">PO Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Expected</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplierPOs.map((po) => (
                  <tr key={po.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{po.poNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PO_STATUS_COLORS[po.status]}`}>
                        {PO_STATUS_LABELS[po.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">${po.total.toLocaleString()}</td>
                    <td className="py-3 px-4">{po.expectedDeliveryDate}</td>
                    <td className="py-3 px-4">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/supply-chain/purchase-orders/${po.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No purchase orders found for this supplier.</p>
        )}
      </div>
    </div>
  );
}
