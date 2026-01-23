/**
 * @file BidList.tsx
 * @description List view for manufacturer quote bids with filtering and import
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBidsStore } from './store';
import type { BidStatus } from './types';
import {
  BID_STATUS_LABELS,
  BID_STATUS_COLORS,
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
} from './types';

export function BidList() {
  const navigate = useNavigate();
  const {
    getFilteredQuotes,
    getQuoteStats,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    importFromEmail,
    deleteQuote,
  } = useBidsStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importEmail, setImportEmail] = useState({
    subject: '',
    body: '',
    from: '',
  });

  const quotes = getFilteredQuotes();
  const stats = getQuoteStats();

  const handleImport = () => {
    if (!importEmail.subject && !importEmail.body) return;

    importFromEmail({
      ...importEmail,
      receivedAt: new Date().toISOString(),
    });

    setImportEmail({ subject: '', body: '', from: '' });
    setShowImportModal(false);
  };

  const formatCurrency = (value: number | null, currency: string = 'USD') => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manufacturer Quotes</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} total quotes • Parse and review bids from supplier emails
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Email
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(Object.keys(BID_STATUS_LABELS) as BidStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === status
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{stats.byStatus[status]}</div>
            <div className={`text-sm font-medium ${BID_STATUS_COLORS[status].replace('bg-', 'text-').replace('100', '700')}`}>
              {BID_STATUS_LABELS[status]}
            </div>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by supplier, product, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MOQ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/bids/${quote.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{quote.supplierName}</div>
                  <div className="text-sm text-gray-500">{quote.supplierEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {quote.productDescription}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${CONFIDENCE_COLORS[quote.unitCost.confidence]}`}>
                    {formatCurrency(quote.unitCost.value, quote.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${CONFIDENCE_COLORS[quote.moq.confidence]}`}>
                    {quote.moq.value?.toLocaleString() ?? '—'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${CONFIDENCE_COLORS[quote.leadTimeDays.confidence]}`}>
                    {quote.leadTimeDays.value ? `${quote.leadTimeDays.value} days` : '—'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${CONFIDENCE_COLORS[quote.overallConfidence]}`}>
                    {CONFIDENCE_LABELS[quote.overallConfidence]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${BID_STATUS_COLORS[quote.status]}`}>
                    {BID_STATUS_LABELS[quote.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quote.emailReceivedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this quote?')) {
                        deleteQuote(quote.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No quotes found. Import an email to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Import Quote Email</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From (Sender Email)
                </label>
                <input
                  type="text"
                  value={importEmail.from}
                  onChange={(e) => setImportEmail({ ...importEmail, from: e.target.value })}
                  placeholder="supplier@example.com or Name <email@example.com>"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={importEmail.subject}
                  onChange={(e) => setImportEmail({ ...importEmail, subject: e.target.value })}
                  placeholder="RE: Quote Request - Product Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Body
                </label>
                <textarea
                  value={importEmail.body}
                  onChange={(e) => setImportEmail({ ...importEmail, body: e.target.value })}
                  placeholder="Paste the full email content here..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <p className="text-sm text-gray-500">
                The parser will automatically extract unit cost, MOQ, lead time, tooling costs, and payment terms from the email.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importEmail.body}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
