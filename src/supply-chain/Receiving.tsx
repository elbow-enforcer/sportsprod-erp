/**
 * @file Receiving.tsx
 * @description Receiving workflow - receive against PO, quantity/quality inspection, auto-update inventory
 * @related-prd tasks/prd-supply-chain.md#US-3.1, US-3.2, US-3.3, US-3.4
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupplyChainStore } from './store';
import type { ReceivingLineItem, InspectionStatus } from './types';
import { PO_STATUS_LABELS, PO_STATUS_COLORS, INSPECTION_STATUS_LABELS } from './types';

export function Receiving() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPO = searchParams.get('po');

  const { purchaseOrders, getPendingReceiving, createReceivingRecord, getReceivingByPOId } =
    useSupplyChainStore();

  const pendingPOs = getPendingReceiving();
  const [selectedPOId, setSelectedPOId] = useState(preselectedPO || '');
  const selectedPO = purchaseOrders.find((po) => po.id === selectedPOId);
  const existingReceivings = selectedPO ? getReceivingByPOId(selectedPO.id) : [];

  const [receivedBy, setReceivedBy] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [lineItems, setLineItems] = useState<ReceivingLineItem[]>([]);

  useEffect(() => {
    if (selectedPO) {
      // Initialize line items from PO
      const items: ReceivingLineItem[] = selectedPO.lineItems
        .filter((li) => li.quantityReceived < li.quantityOrdered)
        .map((li) => ({
          lineItemId: li.id,
          materialName: li.materialName,
          sku: li.sku,
          quantityExpected: li.quantityOrdered - li.quantityReceived,
          quantityReceived: 0,
          quantityAccepted: 0,
          quantityRejected: 0,
          inspectionStatus: 'pending' as InspectionStatus,
          notes: '',
        }));
      setLineItems(items);
    }
  }, [selectedPO]);

  const updateLineItem = (index: number, updates: Partial<ReceivingLineItem>) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], ...updates };

    // Auto-calculate accepted/rejected
    if (updates.quantityReceived !== undefined || updates.quantityRejected !== undefined) {
      const received = updates.quantityReceived ?? updated[index].quantityReceived;
      const rejected = updates.quantityRejected ?? updated[index].quantityRejected;
      updated[index].quantityAccepted = Math.max(0, received - rejected);
    }

    // Auto-set inspection status
    if (updates.quantityReceived !== undefined || updates.quantityRejected !== undefined) {
      const { quantityReceived, quantityRejected, quantityExpected } = updated[index];
      if (quantityReceived === 0) {
        updated[index].inspectionStatus = 'pending';
      } else if (quantityRejected === 0 && quantityReceived === quantityExpected) {
        updated[index].inspectionStatus = 'passed';
      } else if (quantityRejected === quantityReceived) {
        updated[index].inspectionStatus = 'failed';
      } else {
        updated[index].inspectionStatus = 'partial';
      }
    }

    setLineItems(updated);
  };

  const handleSubmitReceiving = () => {
    if (!selectedPO || !receivedBy) {
      alert('Please select a PO and enter your name.');
      return;
    }

    const hasReceivedItems = lineItems.some((li) => li.quantityReceived > 0);
    if (!hasReceivedItems) {
      alert('Please enter received quantities for at least one item.');
      return;
    }

    createReceivingRecord({
      purchaseOrderId: selectedPO.id,
      poNumber: selectedPO.poNumber,
      supplierId: selectedPO.supplierId,
      supplierName: selectedPO.supplierName,
      receivedAt: Date.now(),
      receivedBy,
      lineItems: lineItems.filter((li) => li.quantityReceived > 0),
      inspectionStatus: lineItems.every((li) => li.inspectionStatus === 'passed')
        ? 'passed'
        : lineItems.some((li) => li.inspectionStatus === 'failed')
        ? 'failed'
        : 'partial',
      inspectionNotes,
      inventoryUpdated: true,
    });

    alert('Receiving record created successfully!');
    navigate('/supply-chain/purchase-orders');
  };

  const inspectionColors: Record<InspectionStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Receiving</h2>
          <p className="text-gray-500">Receive and inspect incoming shipments</p>
        </div>
      </div>

      {/* PO Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Select Purchase Order</h3>
        <select
          value={selectedPOId}
          onChange={(e) => setSelectedPOId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a purchase order to receive...</option>
          {pendingPOs.map((po) => (
            <option key={po.id} value={po.id}>
              {po.poNumber} - {po.supplierName} ({PO_STATUS_LABELS[po.status]})
            </option>
          ))}
        </select>
      </div>

      {selectedPO && (
        <>
          {/* PO Summary */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {selectedPO.poNumber} - {selectedPO.supplierName}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${PO_STATUS_COLORS[selectedPO.status]}`}
              >
                {PO_STATUS_LABELS[selectedPO.status]}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <p className="text-gray-500">Expected Delivery</p>
                <p className="font-medium">{selectedPO.expectedDeliveryDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Value</p>
                <p className="font-medium">${selectedPO.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Items</p>
                <p className="font-medium">{selectedPO.lineItems.length} line items</p>
              </div>
              <div>
                <p className="text-gray-500">Previous Receivings</p>
                <p className="font-medium">{existingReceivings.length}</p>
              </div>
            </div>
          </div>

          {/* Receiving Form */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">Receiving Details</h3>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received By *
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiving Date
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>

            {/* Line Items */}
            <h4 className="font-medium mb-4">Items to Receive</h4>
            {lineItems.length > 0 ? (
              <div className="space-y-4">
                {lineItems.map((li, index) => (
                  <div
                    key={li.lineItemId}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium">{li.materialName}</h5>
                        <p className="text-sm text-gray-500">SKU: {li.sku}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${inspectionColors[li.inspectionStatus]}`}
                      >
                        {INSPECTION_STATUS_LABELS[li.inspectionStatus]}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Expected</label>
                        <p className="font-medium">{li.quantityExpected}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty Received</label>
                        <input
                          type="number"
                          value={li.quantityReceived}
                          onChange={(e) =>
                            updateLineItem(index, {
                              quantityReceived: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          max={li.quantityExpected}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty Rejected</label>
                        <input
                          type="number"
                          value={li.quantityRejected}
                          onChange={(e) =>
                            updateLineItem(index, {
                              quantityRejected: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          max={li.quantityReceived}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty Accepted</label>
                        <p className="font-medium text-green-600">{li.quantityAccepted}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">
                        Inspection Notes
                      </label>
                      <input
                        type="text"
                        value={li.notes}
                        onChange={(e) => updateLineItem(index, { notes: e.target.value })}
                        placeholder="Optional notes about this item..."
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                All items have been fully received for this purchase order.
              </p>
            )}

            {/* Overall Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overall Inspection Notes
              </label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="General notes about this receiving..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => navigate('/supply-chain/purchase-orders')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReceiving}
              disabled={!receivedBy || lineItems.every((li) => li.quantityReceived === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Complete Receiving
            </button>
          </div>

          {/* Previous Receivings */}
          {existingReceivings.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Previous Receiving Records</h3>
              <div className="space-y-4">
                {existingReceivings.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {new Date(rec.receivedAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${inspectionColors[rec.inspectionStatus]}`}
                      >
                        {INSPECTION_STATUS_LABELS[rec.inspectionStatus]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Received by: {rec.receivedBy}</p>
                    <ul className="text-sm">
                      {rec.lineItems.map((li) => (
                        <li key={li.lineItemId} className="flex justify-between">
                          <span>{li.materialName}</span>
                          <span>
                            {li.quantityAccepted} accepted / {li.quantityRejected} rejected
                          </span>
                        </li>
                      ))}
                    </ul>
                    {rec.inspectionNotes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{rec.inspectionNotes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedPO && pendingPOs.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-4">No purchase orders pending receiving.</p>
          <button
            onClick={() => navigate('/supply-chain/purchase-orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Purchase Orders
          </button>
        </div>
      )}
    </div>
  );
}
