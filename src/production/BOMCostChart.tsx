/**
 * BOM Cost Breakdown Chart
 * US-2.3: BOM Cost Breakdown Chart
 * 
 * Visual breakdown of BOM costs with pie and bar charts
 */

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductionStore, calculateBOMCost } from './store';

export function BOMCostChart() {
  const { id } = useParams<{ id: string }>();
  const { getBOMById, rawMaterials } = useProductionStore();

  const bom = getBOMById(id || '');

  // Calculate costs
  const costs = useMemo(() => {
    if (!bom) return null;
    return calculateBOMCost(bom, rawMaterials);
  }, [bom, rawMaterials]);

  // Calculate material cost breakdown
  const materialBreakdown = useMemo(() => {
    if (!bom) return [];
    return bom.items
      .map((item) => {
        const material = rawMaterials.find((m) => m.id === item.materialId);
        const cost = (material?.unitCost || 0) * item.quantity;
        return {
          id: item.materialId,
          name: material?.name || 'Unknown',
          quantity: item.quantity,
          unit: material?.unit || item.unit,
          unitCost: material?.unitCost || 0,
          totalCost: cost,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [bom, rawMaterials]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (!bom || !costs) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">BOM not found</p>
        <Link to="/production/bom" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to BOM List
        </Link>
      </div>
    );
  }

  // Pie chart data
  const pieData = [
    { label: 'Materials', value: costs.materialsCost, color: '#3B82F6' },
    { label: 'Labor', value: costs.laborCost, color: '#10B981' },
    { label: 'Overhead', value: costs.overheadCost, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  // Calculate pie chart segments
  const pieSegments = useMemo(() => {
    let currentAngle = 0;
    return pieData.map((segment) => {
      const percentage = segment.value / costs.totalCost;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate SVG arc path
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      return {
        ...segment,
        percentage,
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      };
    });
  }, [pieData, costs.totalCost]);

  // Max material cost for bar chart scaling
  const maxMaterialCost = Math.max(...materialBreakdown.map((m) => m.totalCost), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/production/bom" className="hover:text-blue-600">
              Bills of Materials
            </Link>
            <span>/</span>
            <Link to={`/production/bom/${id}`} className="hover:text-blue-600">
              {bom.productName}
            </Link>
            <span>/</span>
            <span>Cost Breakdown</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Breakdown: {bom.productName}</h1>
          <p className="text-gray-500 mt-1">Version {bom.version}</p>
        </div>
        <Link
          to={`/production/bom/${id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit BOM
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Materials Cost</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(costs.materialsCost)}</p>
          <p className="text-xs text-gray-400">{formatPercent(costs.materialsCost, costs.totalCost)} of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Labor Cost</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(costs.laborCost)}</p>
          <p className="text-xs text-gray-400">{bom.laborHours}h × {formatCurrency(bom.laborCostPerHour)}/h</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Overhead</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(costs.overheadCost)}</p>
          <p className="text-xs text-gray-400">{formatPercent(costs.overheadCost, costs.totalCost)} of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(costs.totalCost)}</p>
          <p className="text-xs text-gray-400">{bom.items.length} components</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Cost Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h2>
          
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 100 100">
                {pieSegments.map((segment, index) => (
                  <path
                    key={index}
                    d={segment.path}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="0.5"
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  >
                    <title>{segment.label}: {formatCurrency(segment.value)} ({(segment.percentage * 100).toFixed(1)}%)</title>
                  </path>
                ))}
                {/* Center circle for donut effect */}
                <circle cx="50" cy="50" r="25" fill="white" />
                <text x="50" y="48" textAnchor="middle" className="text-xs font-bold fill-gray-900">
                  Total
                </text>
                <text x="50" y="58" textAnchor="middle" className="text-[10px] fill-gray-600">
                  {formatCurrency(costs.totalCost)}
                </text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6">
            {pieData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{formatPercent(item.value, costs.totalCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Material Costs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost by Material</h2>
          
          <div className="space-y-3">
            {materialBreakdown.map((material) => (
              <div key={material.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">{material.name}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(material.totalCost)}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end px-2"
                    style={{ width: `${(material.totalCost / maxMaterialCost) * 100}%` }}
                  >
                    {(material.totalCost / maxMaterialCost) > 0.3 && (
                      <span className="text-xs text-white font-medium">
                        {formatPercent(material.totalCost, costs.materialsCost)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                  <span>{material.quantity} {material.unit}</span>
                  <span>@ {formatCurrency(material.unitCost)}/{material.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {materialBreakdown.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No materials in this BOM
            </div>
          )}
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Margin Analysis</h2>
        <p className="text-sm text-gray-500 mb-4">
          Estimate your profit margin based on different selling prices.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1.25, 1.5, 2.0, 2.5].map((multiplier) => {
            const sellingPrice = costs.totalCost * multiplier;
            const grossProfit = sellingPrice - costs.totalCost;
            const marginPercent = ((grossProfit / sellingPrice) * 100).toFixed(1);
            return (
              <div
                key={multiplier}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {multiplier}× Markup
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(sellingPrice)}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Gross Profit:</span>
                    <span className="font-medium text-green-600">{formatCurrency(grossProfit)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Margin:</span>
                    <span className="font-medium text-green-600">{marginPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Cost Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Materials */}
              {materialBreakdown.map((material, index) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {index === 0 ? 'Materials' : ''}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{material.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">
                    {formatCurrency(material.unitCost)}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(material.totalCost)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">
                    {formatPercent(material.totalCost, costs.totalCost)}
                  </td>
                </tr>
              ))}
              {/* Materials Subtotal */}
              <tr className="bg-blue-50">
                <td className="px-6 py-2" colSpan={4}>
                  <span className="text-sm font-medium text-blue-900">Materials Subtotal</span>
                </td>
                <td className="px-6 py-2 text-sm font-bold text-blue-900 text-right">
                  {formatCurrency(costs.materialsCost)}
                </td>
                <td className="px-6 py-2 text-sm font-medium text-blue-700 text-right">
                  {formatPercent(costs.materialsCost, costs.totalCost)}
                </td>
              </tr>
              {/* Labor */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-500">Labor</td>
                <td className="px-6 py-3 text-sm text-gray-900">Production Labor</td>
                <td className="px-6 py-3 text-sm text-gray-600 text-right">{bom.laborHours} hours</td>
                <td className="px-6 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(bom.laborCostPerHour)}/hr
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(costs.laborCost)}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 text-right">
                  {formatPercent(costs.laborCost, costs.totalCost)}
                </td>
              </tr>
              {/* Overhead */}
              {costs.overheadCost > 0 && (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500">Overhead</td>
                  <td className="px-6 py-3 text-sm text-gray-900">Fixed Overhead</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">-</td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">-</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(costs.overheadCost)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 text-right">
                    {formatPercent(costs.overheadCost, costs.totalCost)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white">
                <td className="px-6 py-3" colSpan={4}>
                  <span className="text-sm font-bold">TOTAL COST</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-lg font-bold">{formatCurrency(costs.totalCost)}</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="text-sm font-medium">100%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
