/**
 * @file Fulfillment.tsx
 * @description Warehouse fulfillment center with pick list, packing workflow,
 *              and shipment creation. Manages the pick-pack-ship process.
 * @related-prd tasks/prd-sales-orders.md
 * @module sales
 * @implements US-4.1 Pick list generation
 * @implements US-4.2 Packing slip / shipping label
 * @implements US-4.3 Ship confirmation and tracking
 * @implements US-4.4 Delivery confirmation
 */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSalesStore } from './store';
import type { FulfillmentStatus, ShippingCarrier } from './types';

const STATUS_COLORS: Record<FulfillmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  picking: 'bg-blue-100 text-blue-800',
  packing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-cyan-100 text-cyan-800',
  shipped: 'bg-green-100 text-green-800',
};

const CARRIERS: { value: ShippingCarrier; label: string }[] = [
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'usps', label: 'USPS' },
  { value: 'dhl', label: 'DHL' },
  { value: 'freight', label: 'Freight' },
  { value: 'local', label: 'Local Delivery' },
];

export function Fulfillment() {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  
  const {
    fulfillments,
    orders,
    getOrderById,
    getFulfillmentByOrder,
    updateFulfillmentStatus,
    updatePickedQuantity,
    createShipment,
    updateOrderStatus,
  } = useSalesStore();

  const [selectedFulfillmentId, setSelectedFulfillmentId] = useState<string | null>(
    orderIdParam ? getFulfillmentByOrder(orderIdParam)?.id || null : null
  );
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    carrier: 'ups' as ShippingCarrier,
    service: 'Ground',
    trackingNumber: '',
    cost: 0,
  });

  const selectedFulfillment = selectedFulfillmentId 
    ? fulfillments.find(f => f.id === selectedFulfillmentId) 
    : null;
  const selectedOrder = selectedFulfillment 
    ? getOrderById(selectedFulfillment.orderId) 
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePickItem = (productId: string, quantity: number) => {
    if (!selectedFulfillment) return;
    updatePickedQuantity(selectedFulfillment.id, productId, quantity, 'Current User');
  };

  const handleStatusChange = (status: FulfillmentStatus) => {
    if (!selectedFulfillment) return;
    updateFulfillmentStatus(selectedFulfillment.id, status);
    
    if (status === 'ready') {
      updateOrderStatus(selectedFulfillment.orderId, 'ready_to_ship');
    }
  };

  const handleCreateShipment = () => {
    if (!selectedFulfillment || !selectedOrder) return;
    
    createShipment({
      orderId: selectedFulfillment.orderId,
      fulfillmentId: selectedFulfillment.id,
      carrier: shipmentForm.carrier,
      service: shipmentForm.service,
      trackingNumber: shipmentForm.trackingNumber || `TRACK-${Date.now()}`,
      status: 'label_created',
      shippedAt: new Date().toISOString(),
      cost: shipmentForm.cost,
    });

    setShowShipDialog(false);
    setShipmentForm({ carrier: 'ups', service: 'Ground', trackingNumber: '', cost: 0 });
  };

  const activeFulfillments = fulfillments.filter(f => f.status !== 'shipped');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fulfillment Center</h1>
          <p className="text-gray-500 mt-1">
            {activeFulfillments.length} orders awaiting fulfillment
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Fulfillment Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Fulfillment Queue</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {fulfillments.map((f) => {
              const order = getOrderById(f.orderId);
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFulfillmentId(f.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedFulfillmentId === f.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{f.orderNumber}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[f.status]}`}>
                      {f.status}
                    </span>
                  </div>
                  {order && (
                    <p className="text-sm text-gray-500 mt-1">{order.customerName}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {f.pickList.length} items
                  </p>
                </button>
              );
            })}
            {fulfillments.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No fulfillments in queue
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Details */}
        <div className="md:col-span-2 space-y-6">
          {selectedFulfillment && selectedOrder ? (
            <>
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedFulfillment.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedOrder.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[selectedFulfillment.status]}`}>
                      {selectedFulfillment.status}
                    </span>
                    {selectedOrder.priority !== 'standard' && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                        {selectedOrder.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Ship To</p>
                    <p className="text-gray-900">{selectedOrder.shippingAddress.line1}</p>
                    <p className="text-gray-900">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Order Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>

              {/* Pick List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Pick List</h3>
                  {selectedFulfillment.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange('picking')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Start Picking
                    </button>
                  )}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Ordered</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Picked</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFulfillment.pickList.map((item) => {
                      const isComplete = item.quantityPicked >= item.quantityOrdered;
                      return (
                        <tr key={item.productId} className={`border-b border-gray-100 ${isComplete ? 'bg-green-50' : ''}`}>
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 font-mono">{item.location}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.quantityOrdered}</td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              value={item.quantityPicked}
                              onChange={(e) => handlePickItem(item.productId, parseInt(e.target.value) || 0)}
                              min={0}
                              max={item.quantityOrdered}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                              disabled={selectedFulfillment.status === 'shipped'}
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isComplete ? (
                              <span className="text-green-600 text-sm">✓ Complete</span>
                            ) : (
                              <button
                                onClick={() => handlePickItem(item.productId, item.quantityOrdered)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                disabled={selectedFulfillment.status === 'shipped'}
                              >
                                Pick All
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Fulfillment Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedFulfillment.status === 'picking' && (
                    <button
                      onClick={() => handleStatusChange('packing')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Complete Picking → Packing
                    </button>
                  )}
                  {selectedFulfillment.status === 'packing' && (
                    <button
                      onClick={() => handleStatusChange('ready')}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                      Complete Packing → Ready to Ship
                    </button>
                  )}
                  {selectedFulfillment.status === 'ready' && (
                    <button
                      onClick={() => setShowShipDialog(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Create Shipment
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Print Packing Slip
                  </button>
                  <Link
                    to={`/sales/orders/${selectedFulfillment.orderId}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View Order
                  </Link>
                </div>
              </div>

              {/* Shipping Dialog */}
              {showShipDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Shipment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                        <select
                          value={shipmentForm.carrier}
                          onChange={(e) => setShipmentForm({ ...shipmentForm, carrier: e.target.value as ShippingCarrier })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {CARRIERS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <input
                          type="text"
                          value={shipmentForm.service}
                          onChange={(e) => setShipmentForm({ ...shipmentForm, service: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., Ground, 2-Day, Overnight"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={shipmentForm.trackingNumber}
                          onChange={(e) => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Auto-generated if blank"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
                        <input
                          type="number"
                          value={shipmentForm.cost}
                          onChange={(e) => setShipmentForm({ ...shipmentForm, cost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min={0}
                          step={0.01}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowShipDialog(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateShipment}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Create & Ship
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Select a fulfillment from the queue to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
