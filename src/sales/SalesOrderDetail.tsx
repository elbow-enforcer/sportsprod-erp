/**
 * Sales Order Detail Component
 * US-3.2: Order line items with inventory check
 * US-3.3: Order status tracking
 * US-3.4: Order fulfillment workflow
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSalesStore } from './store';
import type { OrderStatus } from './types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  ready_to_ship: 'bg-cyan-100 text-cyan-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
];

export function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getOrderById,
    getCustomerById,
    getQuoteById,
    getFulfillmentByOrder,
    getShipmentByOrder,
    updateOrderStatus,
    createFulfillment,
  } = useSalesStore();

  const order = id ? getOrderById(id) : undefined;
  const customer = order ? getCustomerById(order.customerId) : undefined;
  const quote = order?.quoteId ? getQuoteById(order.quoteId) : undefined;
  const fulfillment = id ? getFulfillmentByOrder(id) : undefined;
  const shipment = id ? getShipmentByOrder(id) : undefined;

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link to="/sales/orders" className="text-blue-600 hover:text-blue-800">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  const handleStatusAdvance = () => {
    const nextIndex = currentStatusIndex + 1;
    if (nextIndex < STATUS_FLOW.length) {
      const nextStatus = STATUS_FLOW[nextIndex];
      if (nextStatus === 'processing' && !fulfillment) {
        createFulfillment(order.id);
      }
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(order.id, 'cancelled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/sales/orders" className="hover:text-blue-600">Orders</Link>
            <span>/</span>
            <span>{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Link to={`/sales/customers/${order.customerId}`} className="text-blue-600 hover:text-blue-800">
              {order.customerName}
            </Link>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
            {order.priority !== 'standard' && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                {order.priority.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <>
              {currentStatusIndex < STATUS_FLOW.length - 1 && (
                <button
                  onClick={handleStatusAdvance}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {order.status === 'pending' && 'Confirm Order'}
                  {order.status === 'confirmed' && 'Start Fulfillment'}
                  {order.status === 'processing' && 'Mark Ready to Ship'}
                  {order.status === 'ready_to_ship' && 'Mark Shipped'}
                  {order.status === 'shipped' && 'Mark Delivered'}
                </button>
              )}
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Order Progress</h3>
        <div className="flex items-center justify-between">
          {STATUS_FLOW.map((status, index) => {
            const isComplete = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isCancelled = order.status === 'cancelled';
            
            return (
              <div key={status} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCancelled
                        ? 'bg-red-100 text-red-600'
                        : isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>
                {index < STATUS_FLOW.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      isComplete ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Order Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Order Number</dt>
              <dd className="text-sm font-medium text-gray-900">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
            </div>
            {order.promisedShipDate && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Ship By</dt>
                <dd className="text-sm text-gray-900">{formatDate(order.promisedShipDate)}</dd>
              </div>
            )}
            {order.actualShipDate && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Shipped</dt>
                <dd className="text-sm text-green-600">{formatDate(order.actualShipDate)}</dd>
              </div>
            )}
            {quote && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">From Quote</dt>
                <dd>
                  <Link to={`/sales/quotes/${quote.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {quote.quoteNumber}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Shipping Address</h3>
          <div className="text-sm text-gray-900">
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-500">{order.shippingAddress.country}</p>
          </div>
          {shipment && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Tracking</p>
              <p className="text-sm font-medium text-blue-600">{shipment.trackingNumber}</p>
              <p className="text-xs text-gray-500 mt-1">
                {shipment.carrier.toUpperCase()} {shipment.service}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Order Total</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Subtotal</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(order.subtotal)}</dd>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Tax ({order.taxRate}%)</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(order.taxAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Shipping</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <dt className="text-sm font-medium text-gray-900">Total</dt>
              <dd className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Qty</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Unit Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Discount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lineItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.productName}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{item.sku}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {item.discount > 0 ? `${item.discount}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfillment Status */}
      {fulfillment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fulfillment</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              fulfillment.status === 'shipped' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {fulfillment.status}
            </span>
          </div>
          <Link
            to={`/sales/fulfillment?orderId=${order.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View Fulfillment Details →
          </Link>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
