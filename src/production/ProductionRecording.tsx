/**
 * Production Recording Form
 * US-4.1: Production Recording Form
 * 
 * Record production output, defects, and material consumption
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProductionStore } from './store';
import { 
  WorkOrderStatus, 
  MaterialConsumption, 
  ProductionRun 
} from './types';

export function ProductionRecording() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWorkOrder = searchParams.get('workOrder');

  const {
    workOrders,
    billsOfMaterials,
    rawMaterials,
    recordProductionRun,
    updateWorkOrderStatus,
    getWorkOrderById,
    getBOMById,
  } = useProductionStore();

  // Get in-progress work orders
  const inProgressOrders = useMemo(() => {
    return workOrders.filter(
      (wo) => wo.status === WorkOrderStatus.InProgress || wo.status === WorkOrderStatus.QualityCheck
    );
  }, [workOrders]);

  // Form state
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(preselectedWorkOrder || '');
  const [quantityProduced, setQuantityProduced] = useState<number>(0);
  const [quantityDefective, setQuantityDefective] = useState<number>(0);
  const [materialsConsumed, setMaterialsConsumed] = useState<MaterialConsumption[]>([]);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16));
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Get selected work order and BOM
  const selectedWorkOrder = useMemo(() => {
    return getWorkOrderById(selectedWorkOrderId);
  }, [selectedWorkOrderId, getWorkOrderById]);

  const selectedBOM = useMemo(() => {
    if (!selectedWorkOrder) return null;
    return getBOMById(selectedWorkOrder.bomId);
  }, [selectedWorkOrder, getBOMById]);

  // Initialize material consumption when work order changes
  useEffect(() => {
    if (selectedBOM && selectedWorkOrder) {
      const materials = selectedBOM.items.map((item) => {
        const material = rawMaterials.find((m) => m.id === item.materialId);
        const expectedPerUnit = item.quantity;
        const expectedTotal = expectedPerUnit * quantityProduced;
        return {
          materialId: item.materialId,
          expectedQuantity: expectedTotal,
          actualQuantity: expectedTotal,
          variance: 0,
        };
      });
      setMaterialsConsumed(materials);

      // Set start time to work order's actual start if available
      if (selectedWorkOrder.actualStart) {
        setStartTime(selectedWorkOrder.actualStart.slice(0, 16));
      } else {
        setStartTime(new Date().toISOString().slice(0, 16));
      }
    }
  }, [selectedBOM, selectedWorkOrder, rawMaterials]);

  // Update expected quantities when produced quantity changes
  useEffect(() => {
    if (selectedBOM && quantityProduced > 0) {
      setMaterialsConsumed((prev) =>
        prev.map((mc) => {
          const bomItem = selectedBOM.items.find((i) => i.materialId === mc.materialId);
          const expectedPerUnit = bomItem?.quantity || 0;
          const expectedTotal = expectedPerUnit * quantityProduced;
          return {
            ...mc,
            expectedQuantity: expectedTotal,
            // Only update actual if it was equal to expected (auto-sync)
            actualQuantity: mc.actualQuantity === mc.expectedQuantity ? expectedTotal : mc.actualQuantity,
            variance: mc.actualQuantity - expectedTotal,
          };
        })
      );
    }
  }, [quantityProduced, selectedBOM]);

  // Handle material consumption change
  const handleMaterialChange = (index: number, actualQuantity: number) => {
    setMaterialsConsumed((prev) =>
      prev.map((mc, i) => {
        if (i !== index) return mc;
        return {
          ...mc,
          actualQuantity,
          variance: actualQuantity - mc.expectedQuantity,
        };
      })
    );
  };

  // Get material info
  const getMaterial = (materialId: string) => rawMaterials.find((m) => m.id === materialId);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedWorkOrderId) {
      newErrors.workOrder = 'Please select a work order';
    }
    if (!quantityProduced || quantityProduced <= 0) {
      newErrors.quantityProduced = 'Quantity produced must be greater than 0';
    }
    if (quantityDefective < 0) {
      newErrors.quantityDefective = 'Defective quantity cannot be negative';
    }
    if (quantityDefective > quantityProduced) {
      newErrors.quantityDefective = 'Defective quantity cannot exceed produced quantity';
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Check for insufficient stock
    materialsConsumed.forEach((mc) => {
      const material = getMaterial(mc.materialId);
      if (material && mc.actualQuantity > material.currentStock) {
        newErrors[`material-${mc.materialId}`] = `Insufficient stock (${material.currentStock} available)`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validate()) return;

    const productionRun: ProductionRun = {
      id: `run-${Date.now()}`,
      workOrderId: selectedWorkOrderId,
      quantityProduced,
      quantityDefective,
      materialsConsumed,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      operatorNotes: operatorNotes || undefined,
    };

    recordProductionRun(productionRun);
    setSuccess(true);

    // Reset form after short delay
    setTimeout(() => {
      setSelectedWorkOrderId('');
      setQuantityProduced(0);
      setQuantityDefective(0);
      setMaterialsConsumed([]);
      setOperatorNotes('');
      setSuccess(false);
    }, 2000);
  };

  // Handle mark for QC
  const handleMarkForQC = () => {
    if (!selectedWorkOrderId) return;
    if (!validate()) return;

    // Record the production run first
    const productionRun: ProductionRun = {
      id: `run-${Date.now()}`,
      workOrderId: selectedWorkOrderId,
      quantityProduced,
      quantityDefective,
      materialsConsumed,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      operatorNotes: operatorNotes || undefined,
    };

    recordProductionRun(productionRun);
    
    // Update status to QualityCheck
    updateWorkOrderStatus(selectedWorkOrderId, WorkOrderStatus.QualityCheck);
    
    navigate('/production/qc');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Calculate estimated material cost
  const estimatedMaterialCost = useMemo(() => {
    return materialsConsumed.reduce((total, mc) => {
      const material = getMaterial(mc.materialId);
      return total + (material?.unitCost || 0) * mc.actualQuantity;
    }, 0);
  }, [materialsConsumed, rawMaterials]);

  // Calculate defect rate
  const defectRate = quantityProduced > 0 
    ? ((quantityDefective / quantityProduced) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Production</h1>
          <p className="text-gray-500 mt-1">Log production output and material consumption</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 font-medium">Production recorded successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Order Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Order</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Work Order <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorkOrderId}
                onChange={(e) => setSelectedWorkOrderId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.workOrder ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a work order...</option>
                {inProgressOrders.map((wo) => {
                  const bom = getBOMById(wo.bomId);
                  return (
                    <option key={wo.id} value={wo.id}>
                      {wo.id} - {bom?.productName || 'Unknown'} (Qty: {wo.quantity})
                    </option>
                  );
                })}
              </select>
              {errors.workOrder && <p className="mt-1 text-sm text-red-500">{errors.workOrder}</p>}
            </div>

            {selectedWorkOrder && selectedBOM && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Product:</span>
                    <p className="font-medium">{selectedBOM.productName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order Qty:</span>
                    <p className="font-medium">{selectedWorkOrder.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">{selectedWorkOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <p className="font-medium">{selectedWorkOrder.priority}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Production Output */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Output</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Produced <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantityProduced || ''}
                  onChange={(e) => setQuantityProduced(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.quantityProduced ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.quantityProduced && (
                  <p className="mt-1 text-sm text-red-500">{errors.quantityProduced}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Defective Units
                </label>
                <input
                  type="number"
                  value={quantityDefective || ''}
                  onChange={(e) => setQuantityDefective(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.quantityDefective ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.quantityDefective && (
                  <p className="mt-1 text-sm text-red-500">{errors.quantityDefective}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* Material Consumption */}
          {materialsConsumed.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Consumption</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Material</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Expected</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2 w-32">Actual</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Variance</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materialsConsumed.map((mc, index) => {
                      const material = getMaterial(mc.materialId);
                      const hasError = errors[`material-${mc.materialId}`];
                      return (
                        <tr key={mc.materialId}>
                          <td className="py-2 text-sm text-gray-900">{material?.name || 'Unknown'}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">
                            {mc.expectedQuantity.toFixed(2)} {material?.unit}
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={mc.actualQuantity}
                              onChange={(e) => handleMaterialChange(index, parseFloat(e.target.value) || 0)}
                              className={`w-full px-2 py-1 border rounded text-sm text-right ${
                                hasError ? 'border-red-500' : 'border-gray-300'
                              }`}
                              min="0"
                              step="0.01"
                            />
                            {hasError && (
                              <p className="text-xs text-red-500 mt-1">{hasError}</p>
                            )}
                          </td>
                          <td className={`py-2 text-sm text-right font-medium ${
                            mc.variance > 0 ? 'text-red-600' : mc.variance < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {mc.variance > 0 ? '+' : ''}{mc.variance.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-gray-500 text-right">
                            {material?.currentStock.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional notes about this production run..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Good Units:</span>
                <span className="font-medium text-green-600">{quantityProduced - quantityDefective}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Defective:</span>
                <span className="font-medium text-red-600">{quantityDefective}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Defect Rate:</span>
                <span className={`font-medium ${parseFloat(defectRate) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {defectRate}%
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-sm">
                <span className="text-gray-600">Est. Material Cost:</span>
                <span className="font-medium">{formatCurrency(estimatedMaterialCost)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={success}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              Record Production
            </button>
            {selectedWorkOrder?.status === WorkOrderStatus.InProgress && (
              <button
                onClick={handleMarkForQC}
                disabled={success}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                Record & Send to QC
              </button>
            )}
            <button
              onClick={() => navigate('/production/work-orders')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
