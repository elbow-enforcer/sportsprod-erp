/**
 * @file CustomerDetail.tsx
 * @description Customer detail view with tabbed interface showing overview,
 *              contacts, addresses, payment terms, orders, and quotes.
 * @related-prd tasks/prd-sales-orders.md
 * @module sales
 * @implements US-1.2 Customer detail (contacts, addresses, terms)
 * @implements US-1.3 Customer order history
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSalesStore } from './store';
import type { CustomerType, CustomerStatus } from './types';

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  retail: 'Retail',
  wholesale: 'Wholesale',
  distributor: 'Distributor',
  team: 'Team/Org',
};

const STATUS_COLORS: Record<CustomerStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, getQuotesByCustomer, getOrdersByCustomer, updateCustomer, deleteCustomer } = useSalesStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'orders' | 'quotes'>('overview');

  const customer = id ? getCustomerById(id) : undefined;
  const quotes = id ? getQuotesByCustomer(id) : [];
  const orders = id ? getOrdersByCustomer(id) : [];

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <Link to="/sales/customers" className="text-blue-600 hover:text-blue-800">
            ← Back to Customers
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

  const totalOrderValue = orders.reduce((sum, o) => sum + o.total, 0);
  const primaryContact = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];

  const handleStatusChange = (newStatus: CustomerStatus) => {
    updateCustomer(customer.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteCustomer(customer.id);
      navigate('/sales/customers');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: `Contacts (${customer.contacts.length})` },
    { id: 'orders', label: `Orders (${orders.length})` },
    { id: 'quotes', label: `Quotes (${quotes.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/sales/customers" className="hover:text-blue-600">Customers</Link>
            <span>/</span>
            <span>{customer.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">{CUSTOMER_TYPE_LABELS[customer.type]}</span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[customer.status]}`}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={customer.status}
            onChange={(e) => handleStatusChange(e.target.value as CustomerStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <Link
            to={`/sales/quotes/new?customerId=${customer.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            New Quote
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalOrderValue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Credit Limit</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.paymentTerms.creditLimit)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Payment Terms</p>
          <p className="text-2xl font-bold text-gray-900">Net {customer.paymentTerms.netDays}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Customer Since</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(customer.updatedAt)}</dd>
              </div>
              {primaryContact && (
                <>
                  <div>
                    <dt className="text-sm text-gray-500">Primary Contact</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {primaryContact.firstName} {primaryContact.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">{primaryContact.email}</dd>
                  </div>
                  {primaryContact.phone && (
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="text-sm font-medium text-gray-900">{primaryContact.phone}</dd>
                    </div>
                  )}
                </>
              )}
              {customer.notes && (
                <div>
                  <dt className="text-sm text-gray-500">Notes</dt>
                  <dd className="text-sm text-gray-900">{customer.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
            {customer.addresses.length > 0 ? (
              <div className="space-y-4">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">{addr.line1}</p>
                    {addr.line2 && <p className="text-sm text-gray-900">{addr.line2}</p>}
                    <p className="text-sm text-gray-900">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-sm text-gray-500">{addr.country}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No addresses on file.</p>
            )}
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Net Days</dt>
                <dd className="text-sm font-medium text-gray-900">{customer.paymentTerms.netDays} days</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Credit Limit</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(customer.paymentTerms.creditLimit)}</dd>
              </div>
              {customer.paymentTerms.discountPercent && (
                <div>
                  <dt className="text-sm text-gray-500">Early Payment Discount</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {customer.paymentTerms.discountPercent}% if paid within {customer.paymentTerms.discountDays} days
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Primary</th>
              </tr>
            </thead>
            <tbody>
              {customer.contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{contact.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{contact.phone || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{contact.role || '-'}</td>
                  <td className="py-3 px-4">
                    {contact.isPrimary && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Yes</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/sales/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Quote #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valid Until</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{quote.quoteNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(quote.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(quote.validUntil)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/sales/quotes/${quote.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No quotes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
