/**
 * @file BidDetail.tsx
 * @description Detail view for a manufacturer quote with manual correction UI
 * @related-prd Issue #26 - Email ingestion for manufacturer quotes
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBidsStore } from './store';
import type { ParseConfidence, ToolingCost, PaymentTerms } from './types';
import {
  BID_STATUS_LABELS,
  BID_STATUS_COLORS,
  CONFIDENCE_COLORS,
  CONFIDENCE_LABELS,
} from './types';

/**
 * Editable field component with confidence indicator
 */
function EditableField<T>({
  label,
  value,
  confidence,
  originalText,
  manuallyEdited,
  onSave,
  renderValue,
  renderInput,
}: {
  label: string;
  value: T | null;
  confidence: ParseConfidence;
  originalText: string;
  manuallyEdited: boolean;
  onSave: (value: T) => void;
  // eslint-disable-next-line no-unused-vars
  renderValue: (value: T | null) => string;
  renderInput: (
    // eslint-disable-next-line no-unused-vars
    value: T | null,
    // eslint-disable-next-line no-unused-vars
    onChange: (value: T) => void
  ) => React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T | null>(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== null) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${CONFIDENCE_COLORS[confidence]}`}>
            {manuallyEdited ? '✓ Edited' : CONFIDENCE_LABELS[confidence]}
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {renderInput(editValue, setEditValue as (value: T) => void)}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditValue(value);
                setIsEditing(false);
              }}
              className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer group"
        >
          <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {renderValue(value)}
            <span className="ml-2 text-gray-400 text-sm opacity-0 group-hover:opacity-100">
              ✎ Edit
            </span>
          </div>
          {originalText && confidence !== 'manual' && (
            <div className="mt-1 text-xs text-gray-500 italic truncate" title={originalText}>
              Parsed from: "{originalText}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BidDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getQuoteById,
    updateParsedField,
    updateQuote,
    markAsReviewed,
    acceptQuote,
    rejectQuote,
  } = useBidsStore();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const quote = id ? getQuoteById(id) : undefined;

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
          <button
            onClick={() => navigate('/bids')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not parsed';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency,
    }).format(value);
  };

  const handleToolingCostSave = (tooling: ToolingCost) => {
    updateParsedField<ToolingCost>(quote.id, 'toolingCosts', {
      ...tooling,
      total: tooling.moldCost + tooling.setupCost + tooling.otherCosts,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/bids')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quotes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{quote.supplierName}</h1>
          <p className="text-gray-500">{quote.productDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${BID_STATUS_COLORS[quote.status]}`}>
            {BID_STATUS_LABELS[quote.status]}
          </span>
          {quote.status === 'parsed' && (
            <button
              onClick={() => markAsReviewed(quote.id, 'Current User')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mark Reviewed
            </button>
          )}
          {quote.status === 'reviewed' && (
            <>
              <button
                onClick={() => acceptQuote(quote.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Accept Quote
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overall Confidence Banner */}
      {quote.overallConfidence === 'low' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-800 font-medium">
              Low parsing confidence – please review and correct the extracted data below.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parsed Data (Left Column) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Extracted Quote Data</h2>
          <p className="text-sm text-gray-500">Click any field to edit. Changes are marked as manually verified.</p>

          <EditableField
            label="Unit Cost"
            value={quote.unitCost.value}
            confidence={quote.unitCost.confidence}
            originalText={quote.unitCost.originalText}
            manuallyEdited={quote.unitCost.manuallyEdited}
            onSave={(value) => updateParsedField<number>(quote.id, 'unitCost', value)}
            renderValue={formatCurrency}
            renderInput={(value, onChange) => (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={value ?? ''}
                  onChange={(e) => onChange(parseFloat(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          />

          <EditableField
            label="Minimum Order Quantity (MOQ)"
            value={quote.moq.value}
            confidence={quote.moq.confidence}
            originalText={quote.moq.originalText}
            manuallyEdited={quote.moq.manuallyEdited}
            onSave={(value) => updateParsedField<number>(quote.id, 'moq', value)}
            renderValue={(v) => (v ? v.toLocaleString() + ' units' : 'Not parsed')}
            renderInput={(value, onChange) => (
              <input
                type="number"
                value={value ?? ''}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          />

          <EditableField
            label="Lead Time"
            value={quote.leadTimeDays.value}
            confidence={quote.leadTimeDays.confidence}
            originalText={quote.leadTimeDays.originalText}
            manuallyEdited={quote.leadTimeDays.manuallyEdited}
            onSave={(value) => updateParsedField<number>(quote.id, 'leadTimeDays', value)}
            renderValue={(v) => (v ? `${v} days` : 'Not parsed')}
            renderInput={(value, onChange) => (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={value ?? ''}
                  onChange={(e) => onChange(parseInt(e.target.value, 10))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">days</span>
              </div>
            )}
          />

          <EditableField
            label="Tooling Costs"
            value={quote.toolingCosts.value}
            confidence={quote.toolingCosts.confidence}
            originalText={quote.toolingCosts.originalText}
            manuallyEdited={quote.toolingCosts.manuallyEdited}
            onSave={handleToolingCostSave}
            renderValue={(v) => {
              if (!v) return 'Not parsed';
              return `$${v.total.toLocaleString()} (Mold: $${v.moldCost.toLocaleString()}, Setup: $${v.setupCost.toLocaleString()})`;
            }}
            renderInput={(value, onChange) => {
              const v = value || { moldCost: 0, setupCost: 0, otherCosts: 0, total: 0 };
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-20">Mold:</label>
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={v.moldCost}
                      onChange={(e) => onChange({ ...v, moldCost: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-20">Setup:</label>
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={v.setupCost}
                      onChange={(e) => onChange({ ...v, setupCost: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-20">Other:</label>
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={v.otherCosts}
                      onChange={(e) => onChange({ ...v, otherCosts: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              );
            }}
          />

          <EditableField
            label="Payment Terms"
            value={quote.paymentTerms.value}
            confidence={quote.paymentTerms.confidence}
            originalText={quote.paymentTerms.originalText}
            manuallyEdited={quote.paymentTerms.manuallyEdited}
            onSave={(value) => updateParsedField<PaymentTerms>(quote.id, 'paymentTerms', value)}
            renderValue={(v) => v?.type || 'Not parsed'}
            renderInput={(value, onChange) => {
              const v = value || { type: '' };
              return (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={v.type}
                    onChange={(e) => onChange({ ...v, type: e.target.value })}
                    placeholder="e.g., Net 30, 50% deposit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Deposit %:</label>
                      <input
                        type="number"
                        value={v.depositPercent ?? ''}
                        onChange={(e) => onChange({ ...v, depositPercent: parseInt(e.target.value, 10) || undefined })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Net Days:</label>
                      <input
                        type="number"
                        value={v.netDays ?? ''}
                        onChange={(e) => onChange({ ...v, netDays: parseInt(e.target.value, 10) || undefined })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          />

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={quote.notes}
              onChange={(e) => updateQuote(quote.id, { notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about this quote..."
            />
          </div>
        </div>

        {/* Original Email (Right Column) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Original Email</h2>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">From:</span>
              <div className="text-gray-900">{quote.emailFrom}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Subject:</span>
              <div className="text-gray-900">{quote.emailSubject}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Received:</span>
              <div className="text-gray-900">
                {new Date(quote.emailReceivedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Body:</span>
              <pre className="mt-2 p-4 bg-white rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-auto max-h-96">
                {quote.emailBody}
              </pre>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            <h3 className="font-medium text-gray-900">Quote Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Currency:</span>
                <span className="ml-2 text-gray-900">{quote.currency}</span>
              </div>
              <div>
                <span className="text-gray-500">Valid Until:</span>
                <span className="ml-2 text-gray-900">{quote.validUntil || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(quote.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {quote.reviewedBy && (
                <>
                  <div>
                    <span className="text-gray-500">Reviewed By:</span>
                    <span className="ml-2 text-gray-900">{quote.reviewedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reviewed At:</span>
                    <span className="ml-2 text-gray-900">
                      {quote.reviewedAt ? new Date(quote.reviewedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Reject Quote</h2>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Price too high, lead time too long, etc."
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectQuote(quote.id, rejectReason);
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
