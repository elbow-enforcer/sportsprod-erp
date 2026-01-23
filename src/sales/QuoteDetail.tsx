/**
 * @file QuoteDetail.tsx
 * @description Quote detail view showing line items, totals, and status actions.
 *              Supports quote approval workflow and conversion to sales orders.
 * @related-prd tasks/prd-sales-orders.md
 * @module sales
 * @implements US-2.2 Quote line items (products, qty, pricing)
 * @implements US-2.3 Quote approval and convert to order
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSalesStore } from './store';
import type { QuoteStatus } from './types';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
};

export function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuoteById, getCustomerById, updateQuoteStatus, convertQuoteToOrder } = useSalesStore();

  const quote = id ? getQuoteById(id) : undefined;
  const customer = quote ? getCustomerById(quote.customerId) : undefined;

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
          <Link to="/sales/quotes" className="text-blue-600 hover:text-blue-800">
            ← Back to Quotes
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

  const handleStatusChange = (newStatus: QuoteStatus) => {
    updateQuoteStatus(quote.id, newStatus);
  };

  const handleConvert = () => {
    const order = convertQuoteToOrder(quote.id);
    if (order) {
      navigate(`/sales/orders/${order.id}`);
    }
  };

  const isExpired = new Date(quote.validUntil) < new Date();
  const canConvert = quote.status === 'approved' && !isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/sales/quotes" className="hover:text-blue-600">Quotes</Link>
            <span>/</span>
            <span>{quote.quoteNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{quote.quoteNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Link to={`/sales/customers/${quote.customerId}`} className="text-blue-600 hover:text-blue-800">
              {quote.customerName}
            </Link>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[quote.status]}`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
            {isExpired && quote.status !== 'converted' && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quote.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Send Quote
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button
                onClick={() => handleStatusChange('approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Reject
              </button>
            </>
          )}
          {canConvert && (
            <button
              onClick={handleConvert}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Convert to Order
            </button>
          )}
          {quote.convertedToOrderId && (
            <Link
              to={`/sales/orders/${quote.convertedToOrderId}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              View Order
            </Link>
          )}
        </div>
      </div>

      {/* Quote Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Quote Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Quote Number</dt>
              <dd className="text-sm font-medium text-gray-900">{quote.quoteNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">{formatDate(quote.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Valid Until</dt>
              <dd className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {formatDate(quote.validUntil)}
              </dd>
            </div>
            {quote.approvedAt && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Approved</dt>
                <dd className="text-sm text-gray-900">{formatDate(quote.approvedAt)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Customer</h3>
          <p className="font-medium text-gray-900">{quote.customerName}</p>
          {customer && customer.contacts[0] && (
            <>
              <p className="text-sm text-gray-600 mt-1">
                {customer.contacts[0].firstName} {customer.contacts[0].lastName}
              </p>
              <p className="text-sm text-gray-500">{customer.contacts[0].email}</p>
            </>
          )}
          <Link
            to={`/sales/customers/${quote.customerId}`}
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            View Customer →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Totals</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Subtotal</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(quote.subtotal)}</dd>
            </div>
            {quote.taxAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Tax ({quote.taxRate}%)</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(quote.taxAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Shipping</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(quote.shippingCost)}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <dt className="text-sm font-medium text-gray-900">Total</dt>
              <dd className="text-lg font-bold text-gray-900">{formatCurrency(quote.total)}</dd>
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
              {quote.lineItems.map((item, index) => (
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
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={5} className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                  Subtotal
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(quote.subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <p className="text-sm text-gray-600">{quote.notes}</p>
        </div>
      )}
    </div>
  );
}
