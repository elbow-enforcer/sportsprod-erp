/**
 * Quality Control Page
 * US-4.2: Quality Control Page
 * 
 * Record QC checkpoints and pass/fail results
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';
import { 
  WorkOrderStatus, 
  QualityCheckpoint, 
  QualityCheckType,
  WORK_ORDER_STATUS_COLORS,
} from './types';

const CHECK_TYPES: { value: QualityCheckType; label: string; description: string }[] = [
  { value: 'visual_inspection', label: 'Visual Inspection', description: 'Check for surface defects, finish quality' },
  { value: 'dimensional_check', label: 'Dimensional Check', description: 'Verify measurements against specifications' },
  { value: 'weight_check', label: 'Weight Check', description: 'Confirm weight is within tolerance' },
  { value: 'material_test', label: 'Material Test', description: 'Verify material composition and quality' },
  { value: 'functionality_test', label: 'Functionality Test', description: 'Test product performance and function' },
  { value: 'safety_check', label: 'Safety Check', description: 'Verify safety standards compliance' },
];

export function QualityControl() {
  const {
    workOrders,
    billsOfMaterials,
    qualityCheckpoints,
    addQualityCheckpoint,
    updateWorkOrderStatus,
    getBOMById,
  } = useProductionStore();

  // Get work orders in QC status
  const qcWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => wo.status === WorkOrderStatus.QualityCheck);
  }, [workOrders]);

  // Form state
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [checkType, setCheckType] = useState<QualityCheckType>('visual_inspection');
  const [passed, setPassed] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Get selected work order
  const selectedWorkOrder = useMemo(() => {
    return workOrders.find((wo) => wo.id === selectedWorkOrderId);
  }, [selectedWorkOrderId, workOrders]);

  const selectedBOM = useMemo(() => {
    if (!selectedWorkOrder) return null;
    return getBOMById(selectedWorkOrder.bomId);
  }, [selectedWorkOrder, getBOMById]);

  // Get checkpoints for selected work order
  const workOrderCheckpoints = useMemo(() => {
    if (!selectedWorkOrderId) return [];
    return qualityCheckpoints
      .filter((qc) => qc.workOrderId === selectedWorkOrderId)
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  }, [selectedWorkOrderId, qualityCheckpoints]);

  // Calculate checkpoint status
  const checkpointStatus = useMemo(() => {
    const completed = workOrderCheckpoints.length;
    const passedCount = workOrderCheckpoints.filter((qc) => qc.passed).length;
    const failedCount = workOrderCheckpoints.filter((qc) => !qc.passed).length;
    return { completed, passedCount, failedCount };
  }, [workOrderCheckpoints]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedWorkOrderId) {
      newErrors.workOrder = 'Please select a work order';
    }
    if (!checkType) {
      newErrors.checkType = 'Please select a check type';
    }
    if (passed === null) {
      newErrors.passed = 'Please select Pass or Fail';
    }
    if (!checkedBy.trim()) {
      newErrors.checkedBy = 'Inspector name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validate()) return;

    const checkpoint: QualityCheckpoint = {
      id: `qc-${Date.now()}`,
      workOrderId: selectedWorkOrderId,
      checkType,
      passed: passed!,
      notes: notes || undefined,
      checkedBy,
      checkedAt: new Date().toISOString(),
    };

    addQualityCheckpoint(checkpoint);
    
    // Reset form
    setPassed(null);
    setNotes('');
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 2000);
  };

  // Handle complete QC (mark work order as complete)
  const handleCompleteQC = () => {
    if (!selectedWorkOrderId) return;
    
    // Check if there are any failed checkpoints
    const hasFailures = workOrderCheckpoints.some((qc) => !qc.passed);
    
    if (hasFailures) {
      if (!window.confirm('This work order has failed QC checkpoints. Are you sure you want to mark it as complete?')) {
        return;
      }
    }

    updateWorkOrderStatus(selectedWorkOrderId, WorkOrderStatus.Complete);
    setSelectedWorkOrderId('');
  };

  // Handle return to production
  const handleReturnToProduction = () => {
    if (!selectedWorkOrderId) return;
    updateWorkOrderStatus(selectedWorkOrderId, WorkOrderStatus.InProgress);
    setSelectedWorkOrderId('');
  };

  const getCheckTypeLabel = (type: QualityCheckType) => {
    return CHECK_TYPES.find((ct) => ct.value === type)?.label || type;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-gray-500 mt-1">Record QC checkpoints and manage quality workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {qcWorkOrders.length} orders in QC
          </span>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 font-medium">Checkpoint recorded successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Orders in QC */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Orders in QC</h2>
            
            {qcWorkOrders.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No work orders in QC queue</p>
            ) : (
              <div className="space-y-2">
                {qcWorkOrders.map((wo) => {
                  const bom = getBOMById(wo.bomId);
                  const woCheckpoints = qualityCheckpoints.filter((qc) => qc.workOrderId === wo.id);
                  const hasFailures = woCheckpoints.some((qc) => !qc.passed);
                  
                  return (
                    <button
                      key={wo.id}
                      onClick={() => setSelectedWorkOrderId(wo.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedWorkOrderId === wo.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{wo.id}</p>
                          <p className="text-xs text-gray-500">{bom?.productName}</p>
                          <p className="text-xs text-gray-400 mt-1">Qty: {wo.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">{woCheckpoints.length} checks</span>
                          {hasFailures && (
                            <p className="text-xs text-red-600 font-medium mt-1">Has failures</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* QC Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Work Order Info */}
          {selectedWorkOrder && selectedBOM && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedWorkOrder.id}</h2>
                  <p className="text-gray-500">{selectedBOM.productName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReturnToProduction}
                    className="px-3 py-1.5 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
                  >
                    Return to Production
                  </button>
                  <button
                    onClick={handleCompleteQC}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>

              {/* Checkpoint Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{checkpointStatus.completed}</p>
                  <p className="text-xs text-gray-500">Checkpoints</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{checkpointStatus.passedCount}</p>
                  <p className="text-xs text-gray-500">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{checkpointStatus.failedCount}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              </div>
            </div>
          )}

          {/* Record Checkpoint Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Checkpoint</h2>
            
            {!selectedWorkOrderId ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Select a work order from the left to record checkpoints</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={checkType}
                    onChange={(e) => setCheckType(e.target.value as QualityCheckType)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.checkType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {CHECK_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {CHECK_TYPES.find((ct) => ct.value === checkType)?.description}
                  </p>
                  {errors.checkType && <p className="mt-1 text-sm text-red-500">{errors.checkType}</p>}
                </div>

                {/* Pass/Fail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setPassed(true)}
                      className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                        passed === true
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassed(false)}
                      className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                        passed === false
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Fail
                    </button>
                  </div>
                  {errors.passed && <p className="mt-1 text-sm text-red-500">{errors.passed}</p>}
                </div>

                {/* Inspector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspector Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkedBy}
                    onChange={(e) => setCheckedBy(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.checkedBy ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., QC Inspector - John Doe"
                  />
                  {errors.checkedBy && <p className="mt-1 text-sm text-red-500">{errors.checkedBy}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {passed === false && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder={passed === false ? "Describe the issue found..." : "Optional notes..."}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Record Checkpoint
                </button>
              </div>
            )}
          </div>

          {/* Checkpoint History */}
          {selectedWorkOrderId && workOrderCheckpoints.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Checkpoint History</h2>
              <div className="space-y-3">
                {workOrderCheckpoints.map((qc) => (
                  <div
                    key={qc.id}
                    className={`p-4 rounded-lg border ${
                      qc.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {qc.passed ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`font-medium ${qc.passed ? 'text-green-800' : 'text-red-800'}`}>
                            {getCheckTypeLabel(qc.checkType)}
                          </span>
                        </div>
                        {qc.notes && (
                          <p className="mt-1 text-sm text-gray-600">{qc.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{qc.checkedBy}</p>
                        <p>{formatDateTime(qc.checkedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
