/**
 * BOM Detail/Edit Page
 * US-2.2: BOM Detail/Edit Page
 * 
 * View and edit a Bill of Materials with component management
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductionStore, calculateBOMCost } from './store';
import { BOMItem, BillOfMaterials } from './types';

export function BOMDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    billsOfMaterials,
    rawMaterials,
    getBOMById,
    addBOM,
    updateBOM,
  } = useProductionStore();

  const isNew = id === 'new';
  const existingBOM = isNew ? null : getBOMById(id || '');

  // Form state
  const [formData, setFormData] = useState<Partial<BillOfMaterials>>({
    productId: '',
    productName: '',
    version: '1.0',
    items: [],
    laborHours: 0,
    laborCostPerHour: 35,
    overheadCost: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load existing BOM data
  useEffect(() => {
    if (existingBOM) {
      setFormData({
        ...existingBOM,
        effectiveDate: existingBOM.effectiveDate.split('T')[0],
      });
    }
  }, [existingBOM]);

  // Calculate costs
  const costs = useMemo(() => {
    if (!formData.items?.length) {
      return { materialsCost: 0, laborCost: 0, overheadCost: 0, totalCost: 0 };
    }
    return calculateBOMCost(
      formData as BillOfMaterials,
      rawMaterials
    );
  }, [formData, rawMaterials]);

  // Get material by ID
  const getMaterial = (materialId: string) => {
    return rawMaterials.find((m) => m.id === materialId);
  };

  // Handle form field changes
  const handleChange = (field: keyof BillOfMaterials, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle component item changes
  const handleItemChange = (index: number, field: keyof BOMItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange('items', newItems);
  };

  // Add new component
  const addComponent = () => {
    const newItems = [...(formData.items || []), {
      materialId: '',
      quantity: 1,
      unit: '',
      notes: '',
    }];
    handleChange('items', newItems);
  };

  // Remove component
  const removeComponent = (index: number) => {
    const newItems = (formData.items || []).filter((_, i) => i !== index);
    handleChange('items', newItems);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId?.trim()) {
      newErrors.productId = 'Product ID is required';
    }
    if (!formData.productName?.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.version?.trim()) {
      newErrors.version = 'Version is required';
    }
    if (!formData.items?.length) {
      newErrors.items = 'At least one component is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.materialId) {
          newErrors[`item-${index}-material`] = 'Material is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item-${index}-quantity`] = 'Quantity must be positive';
        }
      });
    }
    if (formData.laborHours === undefined || formData.laborHours < 0) {
      newErrors.laborHours = 'Labor hours must be 0 or greater';
    }
    if (formData.laborCostPerHour === undefined || formData.laborCostPerHour < 0) {
      newErrors.laborCostPerHour = 'Labor cost must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    const bomData: BillOfMaterials = {
      id: isNew ? `bom-${Date.now()}` : id!,
      productId: formData.productId!,
      productName: formData.productName!,
      version: formData.version!,
      items: formData.items!,
      laborHours: formData.laborHours!,
      laborCostPerHour: formData.laborCostPerHour!,
      overheadCost: formData.overheadCost || 0,
      effectiveDate: formData.effectiveDate!,
      isActive: formData.isActive!,
    };

    if (isNew) {
      addBOM(bomData);
    } else {
      updateBOM(id!, bomData);
    }

    setIsDirty(false);
    navigate('/production/bom');
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/production/bom');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Version history (mock for existing BOMs)
  const versionHistory = useMemo(() => {
    if (isNew) return [];
    return billsOfMaterials
      .filter((b) => b.productId === formData.productId && b.id !== id)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
      .slice(0, 5);
  }, [billsOfMaterials, formData.productId, id, isNew]);

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
            <span>{isNew ? 'Create New' : formData.productName || 'Loading...'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Create New BOM' : `Edit: ${formData.productName}`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isNew ? 'Create BOM' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productId || ''}
                  onChange={(e) => handleChange('productId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.productId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., PROD-001"
                />
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-500">{errors.productId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName || ''}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.productName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Pro Series Baseball Bat"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-500">{errors.productName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => handleChange('version', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.version ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1.0"
                />
                {errors.version && (
                  <p className="mt-1 text-sm text-red-500">{errors.version}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate || ''}
                  onChange={(e) => handleChange('effectiveDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active BOM (available for work orders)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Components</h2>
              <button
                onClick={addComponent}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Component
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-500">{errors.items}</p>
            )}

            {/* Components Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Material</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2 w-24">Qty</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 w-20">Unit</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2 w-24">Unit Cost</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2 w-28">Line Total</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Notes</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(formData.items || []).map((item, index) => {
                    const material = getMaterial(item.materialId);
                    const lineTotal = (material?.unitCost || 0) * item.quantity;
                    return (
                      <tr key={index}>
                        <td className="py-2 pr-2">
                          <select
                            value={item.materialId}
                            onChange={(e) => {
                              const mat = getMaterial(e.target.value);
                              handleItemChange(index, 'materialId', e.target.value);
                              if (mat) {
                                handleItemChange(index, 'unit', mat.unit);
                              }
                            }}
                            className={`w-full px-2 py-1.5 border rounded text-sm ${
                              errors[`item-${index}-material`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select material...</option>
                            {rawMaterials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className={`w-full px-2 py-1.5 border rounded text-sm text-right ${
                              errors[`item-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-600">
                          {material?.unit || item.unit || '-'}
                        </td>
                        <td className="py-2 px-2 text-sm text-right text-gray-600">
                          {material ? formatCurrency(material.unitCost) : '-'}
                        </td>
                        <td className="py-2 px-2 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Optional notes"
                          />
                        </td>
                        <td className="py-2 pl-2">
                          <button
                            onClick={() => removeComponent(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {(formData.items || []).length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={4} className="py-2 text-right text-sm font-medium text-gray-600">
                        Materials Subtotal:
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-gray-900">
                        {formatCurrency(costs.materialsCost)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {(formData.items || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No components added yet.</p>
                <p className="text-sm">Click "Add Component" to start building your BOM.</p>
              </div>
            )}
          </div>

          {/* Labor & Overhead */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Labor & Overhead</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Hours
                </label>
                <input
                  type="number"
                  value={formData.laborHours || ''}
                  onChange={(e) => handleChange('laborHours', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.laborHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.25"
                />
                {errors.laborHours && (
                  <p className="mt-1 text-sm text-red-500">{errors.laborHours}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Cost ($/hour)
                </label>
                <input
                  type="number"
                  value={formData.laborCostPerHour || ''}
                  onChange={(e) => handleChange('laborCostPerHour', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.laborCostPerHour ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.01"
                />
                {errors.laborCostPerHour && (
                  <p className="mt-1 text-sm text-red-500">{errors.laborCostPerHour}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overhead Cost ($)
                </label>
                <input
                  type="number"
                  value={formData.overheadCost || ''}
                  onChange={(e) => handleChange('overheadCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Labor Total:</span>
                <span className="ml-2 font-medium">{formatCurrency(costs.laborCost)}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Overhead:</span>
                <span className="ml-2 font-medium">{formatCurrency(costs.overheadCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Materials:</span>
                <span className="font-medium">{formatCurrency(costs.materialsCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor:</span>
                <span className="font-medium">{formatCurrency(costs.laborCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overhead:</span>
                <span className="font-medium">{formatCurrency(costs.overheadCost)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(costs.totalCost)}</span>
              </div>
            </div>

            {/* Cost Breakdown Visual */}
            {costs.totalCost > 0 && (
              <div className="mt-4">
                <div className="h-4 rounded-full overflow-hidden bg-gray-100 flex">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(costs.materialsCost / costs.totalCost) * 100}%` }}
                    title={`Materials: ${((costs.materialsCost / costs.totalCost) * 100).toFixed(1)}%`}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(costs.laborCost / costs.totalCost) * 100}%` }}
                    title={`Labor: ${((costs.laborCost / costs.totalCost) * 100).toFixed(1)}%`}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${(costs.overheadCost / costs.totalCost) * 100}%` }}
                    title={`Overhead: ${((costs.overheadCost / costs.totalCost) * 100).toFixed(1)}%`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span>Materials</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Labor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span>Overhead</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          {!isNew && versionHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Version History</h2>
              <div className="space-y-3">
                {versionHistory.map((bom) => (
                  <Link
                    key={bom.id}
                    to={`/production/bom/${bom.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">v{bom.version}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bom.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bom.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Effective: {new Date(bom.effectiveDate).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Components:</span>
                <span className="font-medium">{formData.items?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Labor:</span>
                <span className="font-medium">{formData.laborHours || 0} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
