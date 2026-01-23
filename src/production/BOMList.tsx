/**
 * BOM List Page
 * US-2.1: BOM List Page
 * 
 * Lists all Bills of Materials with sorting, filtering, and navigation
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore, calculateBOMCost } from './store';
import { BillOfMaterials } from './types';

type SortField = 'productName' | 'version' | 'itemsCount' | 'laborHours' | 'totalCost' | 'effectiveDate';
type SortDirection = 'asc' | 'desc';

export function BOMList() {
  const { billsOfMaterials, rawMaterials } = useProductionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Calculate costs for each BOM
  const bomsWithCosts = useMemo(() => {
    return billsOfMaterials.map((bom) => ({
      ...bom,
      costs: calculateBOMCost(bom, rawMaterials),
    }));
  }, [billsOfMaterials, rawMaterials]);

  // Filter and sort BOMs
  const filteredBOMs = useMemo(() => {
    let result = bomsWithCosts;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (bom) =>
          bom.productName.toLowerCase().includes(term) ||
          bom.productId.toLowerCase().includes(term) ||
          bom.version.toLowerCase().includes(term)
      );
    }

    // Filter by active status
    if (showActiveOnly) {
      result = result.filter((bom) => bom.isActive);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'productName':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version);
          break;
        case 'itemsCount':
          comparison = a.items.length - b.items.length;
          break;
        case 'laborHours':
          comparison = a.laborHours - b.laborHours;
          break;
        case 'totalCost':
          comparison = a.costs.totalCost - b.costs.totalCost;
          break;
        case 'effectiveDate':
          comparison = new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [bomsWithCosts, searchTerm, sortField, sortDirection, showActiveOnly]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills of Materials</h1>
          <p className="text-gray-500 mt-1">Manage product compositions and cost breakdowns</p>
        </div>
        <Link
          to="/production/bom/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New BOM
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Active Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Active only</span>
          </label>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total BOMs</p>
          <p className="text-2xl font-bold text-gray-900">{billsOfMaterials.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active BOMs</p>
          <p className="text-2xl font-bold text-green-600">
            {billsOfMaterials.filter((b) => b.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg. Components</p>
          <p className="text-2xl font-bold text-gray-900">
            {billsOfMaterials.length > 0
              ? (
                  billsOfMaterials.reduce((sum, b) => sum + b.items.length, 0) /
                  billsOfMaterials.length
                ).toFixed(1)
              : '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg. Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            {bomsWithCosts.length > 0
              ? formatCurrency(
                  bomsWithCosts.reduce((sum, b) => sum + b.costs.totalCost, 0) /
                    bomsWithCosts.length
                )
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <SortIcon field="productName" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('version')}
                >
                  <div className="flex items-center gap-2">
                    Version
                    <SortIcon field="version" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('itemsCount')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Components
                    <SortIcon field="itemsCount" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('laborHours')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Labor Hours
                    <SortIcon field="laborHours" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalCost')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Total Cost
                    <SortIcon field="totalCost" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('effectiveDate')}
                >
                  <div className="flex items-center gap-2">
                    Effective Date
                    <SortIcon field="effectiveDate" />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBOMs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || showActiveOnly
                      ? 'No BOMs match your filters'
                      : 'No Bills of Materials yet. Create your first BOM to get started.'}
                  </td>
                </tr>
              ) : (
                filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/production/bom/${bom.id}`}
                        className="text-gray-900 font-medium hover:text-blue-600"
                      >
                        {bom.productName}
                      </Link>
                      <p className="text-sm text-gray-500">{bom.productId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        v{bom.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{bom.items.length}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{bom.laborHours}h</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(bom.costs.totalCost)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(bom.effectiveDate)}</td>
                    <td className="px-6 py-4 text-center">
                      {bom.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/production/bom/${bom.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View/Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <Link
                          to={`/production/bom/${bom.id}/costs`}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Cost Breakdown"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredBOMs.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
            Showing {filteredBOMs.length} of {billsOfMaterials.length} BOMs
          </div>
        )}
      </div>
    </div>
  );
}
