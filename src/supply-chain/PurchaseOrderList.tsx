/**
 * @file PurchaseOrderList.tsx
 * @description Purchase order list with status filtering, quick actions, and summary stats
 * @related-prd tasks/prd-supply-chain.md#US-2.3
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplyChainStore } from './store';
import type { POStatus } from './types';
import { PO_STATUS_LABELS, PO_STATUS_COLORS } from './types';

export function PurchaseOrderList() {
  const navigate = useNavigate();
  const { purchaseOrders, suppliers, approvePurchaseOrder, cancelPurchaseOrder, submitPurchaseOrder } =
    useSupplyChainStore();
  const [statusFilter, setStatusFilter] = useState<'all' | POStatus>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredPOs = purchaseOrders
    .filter((po) => {
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || po.supplierId === supplierFilter;
      const matchesSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSupplier && matchesSearch;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  // Summary stats
  const stats = {
    draft: purchaseOrders.filter((po) => po.status === 'draft').length,
    submitted: purchaseOrders.filter((po) => po.status === 'submitted').length,
    pending: purchaseOrders.filter((po) => ['approved', 'ordered', 'partial'].includes(po.status)).length,
    total: purchaseOrders.reduce((sum, po) => sum + po.total, 0),
  };

  const handleQuickAction = (poId: string, action: 'submit' | 'approve' | 'cancel') => {
    switch (action) {
      case 'submit':
        submitPurchaseOrder(poId);
        break;
      case 'approve':
        approvePurchaseOrder(poId, 'Current User');
        break;
      case 'cancel':
        if (window.confirm('Are you sure you want to cancel this purchase order?')) {
          cancelPurchaseOrder(poId);
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-gray-500">Track and manage procurement</p>
        </div>
        <button
          onClick={() => navigate('/supply-chain/purchase-orders/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> New Purchase Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Draft Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Awaiting Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-green-600">${stats.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search PO number or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="ordered">Ordered</option>
          <option value="partial">Partial</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Suppliers</option>
          {suppliers
            .filter((s) => s.status === 'active')
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">PO Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Expected</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map((po) => (
                <tr key={po.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/supply-chain/purchase-orders/${po.id}`)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {po.poNumber}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/supply-chain/suppliers/${po.supplierId}`)}
                      className="hover:text-blue-600"
                    >
                      {po.supplierName}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${PO_STATUS_COLORS[po.status]}`}
                    >
                      {PO_STATUS_LABELS[po.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{po.lineItems.length} items</td>
                  <td className="py-3 px-4 text-right font-medium">${po.total.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{po.expectedDeliveryDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      {po.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleQuickAction(po.id, 'submit')}
                            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => handleQuickAction(po.id, 'cancel')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {po.status === 'submitted' && (
                        <button
                          onClick={() => handleQuickAction(po.id, 'approve')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                      )}
                      {(po.status === 'approved' || po.status === 'ordered' || po.status === 'partial') && (
                        <button
                          onClick={() => navigate(`/supply-chain/receiving?po=${po.id}`)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Receive
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/supply-chain/purchase-orders/${po.id}`)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPOs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No purchase orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
