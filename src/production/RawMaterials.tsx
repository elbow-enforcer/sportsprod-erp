/**
 * Raw Materials Page
 * US-4.3: Raw Materials Page
 * 
 * View and manage raw material inventory with low stock alerts
 */

import { useState, useMemo } from 'react';
import { useProductionStore } from './store';
import { RawMaterial } from './types';

type SortField = 'name' | 'sku' | 'currentStock' | 'reorderPoint' | 'unitCost';
type SortDirection = 'asc' | 'desc';

export function RawMaterials() {
  const {
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    adjustStock,
    getLowStockMaterials,
  } = useProductionStore();

  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);

  // Form state
  const [formData, setFormData] = useState<Partial<RawMaterial>>({
    name: '',
    sku: '',
    unit: 'unit',
    unitCost: 0,
    currentStock: 0,
    reorderPoint: 0,
    supplierId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get low stock materials
  const lowStockMaterials = getLowStockMaterials();

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let result = [...rawMaterials];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.sku.toLowerCase().includes(term)
      );
    }

    // Low stock filter
    if (showLowStockOnly) {
      result = result.filter((m) => m.currentStock <= m.reorderPoint);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'currentStock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'reorderPoint':
          comparison = a.reorderPoint - b.reorderPoint;
          break;
        case 'unitCost':
          comparison = a.unitCost - b.unitCost;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [rawMaterials, searchTerm, showLowStockOnly, sortField, sortDirection]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = rawMaterials.reduce(
      (sum, m) => sum + m.currentStock * m.unitCost,
      0
    );
    return {
      totalItems: rawMaterials.length,
      lowStock: lowStockMaterials.length,
      totalValue,
    };
  }, [rawMaterials, lowStockMaterials]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      sku: '',
      unit: 'unit',
      unitCost: 0,
      currentStock: 0,
      reorderPoint: 0,
      supplierId: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormData({ ...material });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.sku?.trim()) errors.sku = 'SKU is required';
    if (!formData.unit?.trim()) errors.unit = 'Unit is required';
    if (formData.unitCost === undefined || formData.unitCost < 0) errors.unitCost = 'Valid cost required';
    if (formData.currentStock === undefined || formData.currentStock < 0) errors.currentStock = 'Valid stock required';
    if (formData.reorderPoint === undefined || formData.reorderPoint < 0) errors.reorderPoint = 'Valid reorder point required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingMaterial) {
      updateRawMaterial(editingMaterial.id, formData);
    } else {
      const newMaterial: RawMaterial = {
        id: `mat-${Date.now()}`,
        name: formData.name!,
        sku: formData.sku!,
        unit: formData.unit!,
        unitCost: formData.unitCost!,
        currentStock: formData.currentStock!,
        reorderPoint: formData.reorderPoint!,
        supplierId: formData.supplierId || '',
      };
      addRawMaterial(newMaterial);
    }

    setShowModal(false);
  };

  const handleDelete = (material: RawMaterial) => {
    if (window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
      deleteRawMaterial(material.id);
    }
  };

  const handleAdjustStock = () => {
    if (!adjustingMaterial || adjustmentAmount === 0) return;
    adjustStock(adjustingMaterial.id, adjustmentAmount);
    setAdjustingMaterial(null);
    setAdjustmentAmount(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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

  const getStockStatus = (material: RawMaterial) => {
    if (material.currentStock <= 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (material.currentStock <= material.reorderPoint) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-500 mt-1">Manage material inventory and stock levels</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:col-span-2">
          <p className="text-sm text-gray-500">Total Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-orange-800">Low Stock Alert</h3>
              <p className="text-sm text-orange-700 mt-1">
                {lowStockMaterials.length} material(s) below reorder point: {' '}
                {lowStockMaterials.slice(0, 3).map((m) => m.name).join(', ')}
                {lowStockMaterials.length > 3 && ` +${lowStockMaterials.length - 3} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-600">Low stock only</span>
          </label>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Material <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center gap-2">
                    SKU <SortIcon field="sku" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currentStock')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Stock <SortIcon field="currentStock" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reorderPoint')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Reorder At <SortIcon field="reorderPoint" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('unitCost')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Unit Cost <SortIcon field="unitCost" />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || showLowStockOnly
                      ? 'No materials match your filters'
                      : 'No raw materials yet. Add your first material to get started.'}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => {
                  const status = getStockStatus(material);
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{material.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{material.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {material.currentStock} {material.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        {material.reorderPoint} {material.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {formatCurrency(material.unitCost)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustingMaterial(material);
                              setAdjustmentAmount(0);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Adjust Stock"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(material)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(material)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingMaterial ? 'Edit Material' : 'Add Material'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.sku ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.sku && <p className="text-xs text-red-500 mt-1">{formErrors.sku}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.unit ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., kg, unit, roll"
                  />
                  {formErrors.unit && <p className="text-xs text-red-500 mt-1">{formErrors.unit}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($) *</label>
                  <input
                    type="number"
                    value={formData.unitCost || ''}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.unitCost ? 'border-red-500' : 'border-gray-300'}`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.unitCost && <p className="text-xs text-red-500 mt-1">{formErrors.unitCost}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    value={formData.currentStock || ''}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg ${formErrors.currentStock ? 'border-red-500' : 'border-gray-300'}`}
                    min="0"
                  />
                  {formErrors.currentStock && <p className="text-xs text-red-500 mt-1">{formErrors.currentStock}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point *</label>
                <input
                  type="number"
                  value={formData.reorderPoint || ''}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.reorderPoint ? 'border-red-500' : 'border-gray-300'}`}
                  min="0"
                />
                {formErrors.reorderPoint && <p className="text-xs text-red-500 mt-1">{formErrors.reorderPoint}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingMaterial ? 'Save Changes' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Adjust Stock</h2>
            <p className="text-gray-500 text-sm mb-4">{adjustingMaterial.name}</p>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold">{adjustingMaterial.currentStock} {adjustingMaterial.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment (+ to add, - to remove)
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg"
                />
              </div>
              <div className="text-center text-sm">
                <span className="text-gray-500">New Stock: </span>
                <span className="font-medium">
                  {Math.max(0, adjustingMaterial.currentStock + adjustmentAmount)} {adjustingMaterial.unit}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAdjustingMaterial(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustmentAmount === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
