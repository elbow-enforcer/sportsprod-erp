/**
 * Work Order Detail Page
 * US-3.2: Work Order Detail Page
 * 
 * Create/edit work orders with full details and status workflow
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductionStore, calculateBOMCost, checkMaterialAvailability } from './store';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, WORK_ORDER_STATUS_COLORS } from './types';

const PRIORITY_OPTIONS: WorkOrderPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

// Define valid status transitions
const STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.Draft]: [WorkOrderStatus.Scheduled, WorkOrderStatus.Cancelled],
  [WorkOrderStatus.Scheduled]: [WorkOrderStatus.InProgress, WorkOrderStatus.Draft, WorkOrderStatus.Cancelled],
  [WorkOrderStatus.InProgress]: [WorkOrderStatus.QualityCheck, WorkOrderStatus.Cancelled],
  [WorkOrderStatus.QualityCheck]: [WorkOrderStatus.Complete, WorkOrderStatus.InProgress],
  [WorkOrderStatus.Complete]: [],
  [WorkOrderStatus.Cancelled]: [WorkOrderStatus.Draft],
};

export function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    workOrders,
    billsOfMaterials,
    rawMaterials,
    getWorkOrderById,
    getActiveBOMs,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
  } = useProductionStore();

  const isNew = id === 'new';
  const existingOrder = isNew ? null : getWorkOrderById(id || '');
  const activeBOMs = getActiveBOMs();

  // Form state
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    bomId: '',
    quantity: 1,
    status: WorkOrderStatus.Draft,
    scheduledStart: new Date().toISOString().split('T')[0],
    scheduledEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    assignedTo: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load existing work order
  useEffect(() => {
    if (existingOrder) {
      setFormData({
        ...existingOrder,
        scheduledStart: existingOrder.scheduledStart.split('T')[0],
        scheduledEnd: existingOrder.scheduledEnd.split('T')[0],
      });
    }
  }, [existingOrder]);

  // Get selected BOM
  const selectedBOM = useMemo(() => {
    return billsOfMaterials.find((b) => b.id === formData.bomId);
  }, [billsOfMaterials, formData.bomId]);

  // Calculate BOM costs
  const bomCosts = useMemo(() => {
    if (!selectedBOM) return null;
    return calculateBOMCost(selectedBOM, rawMaterials);
  }, [selectedBOM, rawMaterials]);

  // Check material availability
  const availability = useMemo(() => {
    if (!selectedBOM || !formData.quantity) return null;
    return checkMaterialAvailability(selectedBOM, formData.quantity, rawMaterials);
  }, [selectedBOM, formData.quantity, rawMaterials]);

  // Materials requirements preview
  const materialsPreview = useMemo(() => {
    if (!selectedBOM || !formData.quantity) return [];
    return selectedBOM.items.map((item) => {
      const material = rawMaterials.find((m) => m.id === item.materialId);
      const required = item.quantity * (formData.quantity || 0);
      const available = material?.currentStock || 0;
      return {
        materialId: item.materialId,
        name: material?.name || 'Unknown',
        unit: material?.unit || item.unit,
        required,
        available,
        shortage: Math.max(0, required - available),
      };
    });
  }, [selectedBOM, formData.quantity, rawMaterials]);

  // Unique assignees from existing work orders
  const assignees = useMemo(() => {
    const unique = new Set<string>();
    workOrders.forEach((wo) => {
      if (wo.assignedTo) unique.add(wo.assignedTo);
    });
    return Array.from(unique).sort();
  }, [workOrders]);

  // Handle form changes
  const handleChange = (field: keyof WorkOrder, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bomId) {
      newErrors.bomId = 'Please select a BOM';
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!formData.scheduledStart) {
      newErrors.scheduledStart = 'Start date is required';
    }
    if (!formData.scheduledEnd) {
      newErrors.scheduledEnd = 'End date is required';
    }
    if (formData.scheduledStart && formData.scheduledEnd) {
      if (new Date(formData.scheduledEnd) < new Date(formData.scheduledStart)) {
        newErrors.scheduledEnd = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    const orderData: WorkOrder = {
      id: isNew ? `wo-${Date.now()}` : id!,
      bomId: formData.bomId!,
      quantity: formData.quantity!,
      status: formData.status!,
      scheduledStart: new Date(formData.scheduledStart!).toISOString(),
      scheduledEnd: new Date(formData.scheduledEnd!).toISOString(),
      priority: formData.priority!,
      assignedTo: formData.assignedTo || undefined,
      notes: formData.notes || undefined,
      actualStart: existingOrder?.actualStart,
      actualEnd: existingOrder?.actualEnd,
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isNew) {
      createWorkOrder(orderData);
    } else {
      updateWorkOrder(id!, orderData);
    }

    setIsDirty(false);
    navigate('/production/work-orders');
  };

  // Handle status change
  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    if (!isNew && id) {
      updateWorkOrderStatus(id, newStatus);
      setFormData((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/production/work-orders');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
    };
    return colorMap[WORK_ORDER_STATUS_COLORS[status]] || colorMap.gray;
  };

  const availableTransitions = existingOrder
    ? STATUS_TRANSITIONS[existingOrder.status]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/production/work-orders" className="hover:text-blue-600">
              Work Orders
            </Link>
            <span>/</span>
            <span>{isNew ? 'Create New' : id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Create Work Order' : `Work Order: ${id}`}
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
            {isNew ? 'Create Work Order' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Section (for existing orders) */}
          {!isNew && existingOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`px-4 py-2 rounded-lg border-2 font-medium ${getStatusColor(existingOrder.status)}`}>
                  Current: {existingOrder.status}
                </div>
                {availableTransitions.length > 0 && (
                  <>
                    <span className="text-gray-400">→</span>
                    {availableTransitions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-80 ${getStatusColor(status)}`}
                      >
                        {status}
                      </button>
                    ))}
                  </>
                )}
              </div>
              {existingOrder.actualStart && (
                <p className="mt-3 text-sm text-gray-500">
                  Started: {new Date(existingOrder.actualStart).toLocaleString()}
                </p>
              )}
              {existingOrder.actualEnd && (
                <p className="text-sm text-gray-500">
                  Completed: {new Date(existingOrder.actualEnd).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BOM Selector */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill of Materials <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bomId || ''}
                  onChange={(e) => handleChange('bomId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.bomId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!isNew && existingOrder?.status !== WorkOrderStatus.Draft}
                >
                  <option value="">Select a BOM...</option>
                  {activeBOMs.map((bom) => (
                    <option key={bom.id} value={bom.id}>
                      {bom.productName} (v{bom.version})
                    </option>
                  ))}
                </select>
                {errors.bomId && <p className="mt-1 text-sm text-red-500">{errors.bomId}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority || 'Medium'}
                  onChange={(e) => handleChange('priority', e.target.value as WorkOrderPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Scheduled Start */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Start <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledStart || ''}
                  onChange={(e) => handleChange('scheduledStart', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.scheduledStart ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledStart && <p className="mt-1 text-sm text-red-500">{errors.scheduledStart}</p>}
              </div>

              {/* Scheduled End */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled End <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledEnd || ''}
                  onChange={(e) => handleChange('scheduledEnd', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.scheduledEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledEnd && <p className="mt-1 text-sm text-red-500">{errors.scheduledEnd}</p>}
              </div>

              {/* Assignee */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo || ''}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name or select from suggestions"
                  list="assignee-list"
                />
                <datalist id="assignee-list">
                  {assignees.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes about this work order..."
                />
              </div>
            </div>
          </div>

          {/* Materials Requirements */}
          {selectedBOM && formData.quantity && formData.quantity > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Materials Requirements</h2>
                {availability && !availability.available && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Insufficient Stock
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Material</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Required</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Available</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materialsPreview.map((mat) => (
                      <tr key={mat.materialId}>
                        <td className="py-2 text-sm text-gray-900">{mat.name}</td>
                        <td className="py-2 text-sm text-gray-600 text-right">
                          {mat.required.toFixed(2)} {mat.unit}
                        </td>
                        <td className="py-2 text-sm text-gray-600 text-right">
                          {mat.available.toFixed(2)} {mat.unit}
                        </td>
                        <td className="py-2 text-right">
                          {mat.shortage > 0 ? (
                            <span className="text-sm text-red-600 font-medium">
                              -{mat.shortage.toFixed(2)} short
                            </span>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">✓ OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          {selectedBOM && bomCosts && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Estimate</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Cost:</span>
                  <span className="font-medium">{formatCurrency(bomCosts.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">× {formData.quantity || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Estimate:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(bomCosts.totalCost * (formData.quantity || 0))}
                  </span>
                </div>
              </div>
              <Link
                to={`/production/bom/${selectedBOM.id}/costs`}
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                View detailed cost breakdown →
              </Link>
            </div>
          )}

          {/* Selected BOM Info */}
          {selectedBOM && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected BOM</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Product:</span>
                  <span className="ml-2 font-medium">{selectedBOM.productName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <span className="ml-2">{selectedBOM.version}</span>
                </div>
                <div>
                  <span className="text-gray-500">Components:</span>
                  <span className="ml-2">{selectedBOM.items.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Labor Hours:</span>
                  <span className="ml-2">{selectedBOM.laborHours}h</span>
                </div>
              </div>
              <Link
                to={`/production/bom/${selectedBOM.id}`}
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                Edit BOM →
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          {!isNew && existingOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/production/record"
                  className="block w-full px-4 py-2 text-center bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  Record Production
                </Link>
                <Link
                  to="/production/qc"
                  className="block w-full px-4 py-2 text-center bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  Quality Control
                </Link>
              </div>
            </div>
          )}

          {/* Timestamps */}
          {!isNew && existingOrder && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
              <p>Created: {new Date(existingOrder.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(existingOrder.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
