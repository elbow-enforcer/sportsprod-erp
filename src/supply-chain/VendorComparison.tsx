/**
 * @file VendorComparison.tsx
 * @description Vendor comparison dashboard for comparing manufacturer quotes
 * Features: Apples-to-apples normalization, total landed cost, historical price tracking
 * @related-issue GitHub Issue #27
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useSupplyChainStore } from './store';
import type { NormalizedQuote, QuotePriceHistory } from './types';

// Color palette for vendors
const VENDOR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

// ============================================================================
// Sub-components
// ============================================================================

interface ComparisonTableProps {
  quotes: NormalizedQuote[];
}

function ComparisonTable({ quotes }: ComparisonTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No quotes available for this material. Request quotes from suppliers.
      </div>
    );
  }

  // Sort by total landed cost
  const sortedQuotes = [...quotes].sort(
    (a, b) => a.totalLandedCostPerUnit - b.totalLandedCostPerUnit
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              {sortedQuotes.map((quote, idx) => (
                <th
                  key={quote.quoteId}
                  className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    quote.isBestPrice
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: VENDOR_COLORS[idx % VENDOR_COLORS.length] }}
                    />
                    {quote.supplierName}
                    {quote.isBestPrice && (
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Best
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Unit Price Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                Unit Price
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center ${
                    quote.isBestPrice ? 'bg-green-50' : ''
                  }`}
                >
                  {formatCurrency(quote.unitPrice)}
                </td>
              ))}
            </tr>
            
            {/* Shipping Row */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                + Shipping/Unit
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center ${
                    quote.isBestPrice ? 'bg-green-50' : ''
                  }`}
                >
                  {formatCurrency(quote.shippingPerUnit)}
                </td>
              ))}
            </tr>
            
            {/* Duty Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                + Duties/Unit
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center ${
                    quote.isBestPrice ? 'bg-green-50' : ''
                  }`}
                >
                  {formatCurrency(quote.dutyPerUnit)}
                </td>
              ))}
            </tr>
            
            {/* Handling Row */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                + Handling/Unit
                <span className="ml-1 text-xs text-gray-500">(at MOQ)</span>
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center ${
                    quote.isBestPrice ? 'bg-green-50' : ''
                  }`}
                >
                  {formatCurrency(quote.handlingPerUnit)}
                </td>
              ))}
            </tr>
            
            {/* Total Landed Cost Row */}
            <tr className="border-t-2 border-gray-300">
              <td className="px-4 py-3 text-sm font-bold text-gray-900">
                Total Landed Cost/Unit
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center font-bold ${
                    quote.isBestPrice
                      ? 'bg-green-100 text-green-800'
                      : ''
                  }`}
                >
                  {formatCurrency(quote.totalLandedCostPerUnit)}
                  {quote.priceVariance > 0 && (
                    <span className="ml-2 text-xs text-red-600">
                      (+{quote.priceVariance.toFixed(1)}%)
                    </span>
                  )}
                </td>
              ))}
            </tr>
            
            {/* Divider */}
            <tr>
              <td colSpan={sortedQuotes.length + 1} className="h-2 bg-gray-100" />
            </tr>
            
            {/* MOQ Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                Minimum Order (MOQ)
              </td>
              {sortedQuotes.map((quote) => {
                const lowestMoq = Math.min(...sortedQuotes.map((q) => q.moq));
                return (
                  <td
                    key={quote.quoteId}
                    className={`px-4 py-3 text-sm text-center ${
                      quote.moq === lowestMoq ? 'text-green-700 font-medium' : ''
                    }`}
                  >
                    {quote.moq.toLocaleString()} units
                    {quote.moq === lowestMoq && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </td>
                );
              })}
            </tr>
            
            {/* Lead Time Row */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                Lead Time
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className={`px-4 py-3 text-sm text-center ${
                    quote.isBestLeadTime ? 'text-green-700 font-medium' : ''
                  }`}
                >
                  {quote.leadTimeDays} days
                  {quote.isBestLeadTime && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </td>
              ))}
            </tr>
            
            {/* Payment Terms Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                Payment Terms
              </td>
              {sortedQuotes.map((quote) => (
                <td
                  key={quote.quoteId}
                  className="px-4 py-3 text-sm text-center text-gray-600"
                >
                  {quote.paymentTerms}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CostBreakdownChartProps {
  quotes: NormalizedQuote[];
}

function CostBreakdownChart({ quotes }: CostBreakdownChartProps) {
  if (quotes.length === 0) return null;

  const chartData = quotes
    .sort((a, b) => a.totalLandedCostPerUnit - b.totalLandedCostPerUnit)
    .map((quote) => ({
      name: quote.supplierName.split(' ')[0], // Short name
      fullName: quote.supplierName,
      unitPrice: quote.unitPrice,
      shipping: quote.shippingPerUnit,
      duties: quote.dutyPerUnit,
      handling: quote.handlingPerUnit,
      total: quote.totalLandedCostPerUnit,
    }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Total Landed Cost Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0),
                String(name).charAt(0).toUpperCase() + String(name).slice(1),
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="unitPrice" name="Unit Price" stackId="a" fill="#3b82f6" />
            <Bar dataKey="shipping" name="Shipping" stackId="a" fill="#10b981" />
            <Bar dataKey="duties" name="Duties" stackId="a" fill="#f59e0b" />
            <Bar dataKey="handling" name="Handling" stackId="a" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface PriceTrendChartProps {
  materialId: string;
}

function PriceTrendChart({ materialId }: PriceTrendChartProps) {
  const getPriceHistory = useSupplyChainStore((s) => s.getPriceHistory);
  const history: QuotePriceHistory[] = getPriceHistory(materialId);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Price Trend Over Time
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No historical price data available
        </div>
      </div>
    );
  }

  // Group by supplier and format for chart
  const supplierMap = new Map<string, { name: string; color: string }>();
  history.forEach((h: QuotePriceHistory) => {
    if (!supplierMap.has(h.supplierId)) {
      supplierMap.set(h.supplierId, {
        name: h.supplierName,
        color: VENDOR_COLORS[supplierMap.size % VENDOR_COLORS.length],
      });
    }
  });

  // Create time series data points
  const timePoints: number[] = [...new Set(history.map((h: QuotePriceHistory) => h.quotedAt))].sort((a, b) => a - b);
  const chartData = timePoints.map((timestamp: number) => {
    const point: Record<string, number | string> = {
      date: formatShortDate(timestamp),
      timestamp: timestamp,
    };
    
    history
      .filter((h: QuotePriceHistory) => h.quotedAt === timestamp)
      .forEach((h: QuotePriceHistory) => {
        point[h.supplierId] = h.totalLandedCost;
      });
    
    return point;
  });

  const suppliers = Array.from(supplierMap.entries());

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Price Trend Over Time (Total Landed Cost)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(value, name) => {
                const supplier = supplierMap.get(String(name));
                return [formatCurrency(Number(value) || 0), supplier?.name || String(name)];
              }}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend
              formatter={(value) => {
                const supplier = supplierMap.get(value);
                return supplier?.name || value;
              }}
            />
            {suppliers.map(([supplierId, { color }]) => (
              <Line
                key={supplierId}
                type="monotone"
                dataKey={supplierId}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface QuoteAlertProps {
  quotes: NormalizedQuote[];
}

function QuoteAlerts({ quotes }: QuoteAlertProps) {
  const alerts: { type: 'success' | 'warning' | 'info'; message: string }[] = [];

  if (quotes.length === 0) return null;

  // Find best quote
  const bestQuote = quotes.find((q) => q.isBestPrice);
  if (bestQuote) {
    const savings = quotes
      .filter((q) => !q.isBestPrice)
      .map((q) => q.totalLandedCostPerUnit - bestQuote.totalLandedCostPerUnit);
    
    if (savings.length > 0) {
      const avgSavings = savings.reduce((a, b) => a + b, 0) / savings.length;
      alerts.push({
        type: 'success',
        message: `${bestQuote.supplierName} offers the best landed cost at ${formatCurrency(bestQuote.totalLandedCostPerUnit)}/unit (avg. ${formatCurrency(avgSavings)} less than alternatives)`,
      });
    }
  }

  // Check for lead time advantage
  const fastestQuote = quotes.reduce((a, b) =>
    a.leadTimeDays < b.leadTimeDays ? a : b
  );
  if (fastestQuote && !fastestQuote.isBestPrice) {
    alerts.push({
      type: 'info',
      message: `${fastestQuote.supplierName} has fastest delivery (${fastestQuote.leadTimeDays} days) but ${formatCurrency(fastestQuote.totalLandedCostPerUnit - (bestQuote?.totalLandedCostPerUnit || 0))} more per unit`,
    });
  }

  // Check for MOQ advantage
  const lowestMoq = Math.min(...quotes.map((q) => q.moq));
  const lowestMoqQuote = quotes.find((q) => q.moq === lowestMoq);
  if (lowestMoqQuote && !lowestMoqQuote.isBestPrice && lowestMoqQuote.moq < (bestQuote?.moq || Infinity)) {
    alerts.push({
      type: 'warning',
      message: `${lowestMoqQuote.supplierName} has lowest MOQ (${lowestMoq} units) - consider for small orders despite higher unit cost`,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-lg text-sm ${
            alert.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : alert.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <span className="mr-2">
            {alert.type === 'success' ? '✓' : alert.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          {alert.message}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function VendorComparison() {
  const getUniqueMaterials = useSupplyChainStore((s) => s.getUniqueMaterials);
  const getNormalizedQuotes = useSupplyChainStore((s) => s.getNormalizedQuotes);
  const vendorQuotes = useSupplyChainStore((s) => s.vendorQuotes);
  
  const materials: { id: string; name: string; sku: string }[] = getUniqueMaterials();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    materials[0]?.id || ''
  );

  const normalizedQuotes: NormalizedQuote[] = useMemo(
    () => getNormalizedQuotes(selectedMaterialId),
    [getNormalizedQuotes, selectedMaterialId]
  );

  const selectedMaterial = materials.find((m: { id: string; name: string; sku: string }) => m.id === selectedMaterialId);

  // Summary stats
  const totalQuotes = vendorQuotes.length;
  const pendingQuotes = vendorQuotes.filter((q: { status: string }) => q.status === 'pending').length;
  const uniqueSuppliers = new Set(vendorQuotes.map((q: { supplierId: string }) => q.supplierId)).size;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Total Quotes</div>
          <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Pending Review</div>
          <div className="text-2xl font-bold text-amber-600">{pendingQuotes}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Materials Quoted</div>
          <div className="text-2xl font-bold text-gray-900">{materials.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Active Suppliers</div>
          <div className="text-2xl font-bold text-blue-600">{uniqueSuppliers}</div>
        </div>
      </div>

      {/* Material Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label
              htmlFor="material-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Material to Compare
            </label>
            <select
              id="material-select"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="block w-full sm:w-80 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              {materials.map((material: { id: string; name: string; sku: string }) => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.sku})
                </option>
              ))}
            </select>
          </div>
          {selectedMaterial && (
            <div className="text-sm text-gray-500">
              Comparing {normalizedQuotes.length} quotes for{' '}
              <span className="font-medium text-gray-900">
                {selectedMaterial.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <QuoteAlerts quotes={normalizedQuotes} />

      {/* Comparison Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Quote Comparison
        </h2>
        <ComparisonTable quotes={normalizedQuotes} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostBreakdownChart quotes={normalizedQuotes} />
        <PriceTrendChart materialId={selectedMaterialId} />
      </div>

      {/* Legend / Help */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Understanding Total Landed Cost
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Total Landed Cost</strong> = Unit Price + Shipping + Duties + Handling
          </p>
          <p>
            This represents the true cost of goods when they arrive at your facility,
            enabling apples-to-apples comparison across vendors with different pricing
            structures.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            * Handling cost per unit is calculated based on MOQ (Minimum Order Quantity)
          </p>
        </div>
      </div>
    </div>
  );
}
