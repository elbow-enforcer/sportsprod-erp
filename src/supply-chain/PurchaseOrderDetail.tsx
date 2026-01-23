import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSupplyChainStore } from './store';
import type { POLineItem, POStatus } from './types';
import { PO_STATUS_LABELS, PO_STATUS_COLORS } from './types';

interface LineItemForm {
  materialId: string;
  materialName: string;
  sku: string;
  quantityOrdered: number;
  unitPrice: number;
  unit: string;
}

export function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    getPOById,
    suppliers,
    createPurchaseOrder,
    updatePurchaseOrder,
    approvePurchaseOrder,
    submitPurchaseOrder,
    cancelPurchaseOrder,
    getReceivingByPOId,
  } = useSupplyChainStore();

  const isNew = id === 'new';
  const existingPO = isNew ? null : getPOById(id || '');
  const preselectedSupplier = searchParams.get('supplier');

  const [supplierId, setSupplierId] = useState(existingPO?.supplierId || preselectedSupplier || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(existingPO?.expectedDeliveryDate || '');
  const [notes, setNotes] = useState(existingPO?.notes || '');
  const [lineItems, setLineItems] = useState<LineItemForm[]>(
    existingPO?.lineItems.map((li) => ({
      materialId: li.materialId,
      materialName: li.materialName,
      sku: li.sku,
      quantityOrdered: li.quantityOrdered,
      unitPrice: li.unitPrice,
      unit: li.unit,
    })) || []
  );

  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [lineItemForm, setLineItemForm] = useState<LineItemForm>({
    materialId: '',
    materialName: '',
    sku: '',
    quantityOrdered: 1,
    unitPrice: 0,
    unit: 'units',
  });

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const receivingRecords = existingPO ? getReceivingByPOId(existingPO.id) : [];

  // Calculate totals
  const subtotal = lineItems.reduce((sum, li) => sum + li.quantityOrdered * li.unitPrice, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over $1000
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (selectedSupplier && !expectedDeliveryDate) {
      const date = new Date();
      date.setDate(date.getDate() + selectedSupplier.leadTimeDays);
      setExpectedDeliveryDate(date.toISOString().split('T')[0]);
    }
  }, [selectedSupplier, expectedDeliveryDate]);

  const handleAddLineItem = () => {
    if (editingLineIndex !== null) {
      const updated = [...lineItems];
      updated[editingLineIndex] = lineItemForm;
      setLineItems(updated);
      setEditingLineIndex(null);
    } else {
      setLineItems([...lineItems, lineItemForm]);
    }
    setLineItemForm({
      materialId: '',
      materialName: '',
      sku: '',
      quantityOrdered: 1,
      unitPrice: 0,
      unit: 'units',
    });
    setShowLineItemForm(false);
  };

  const handleEditLineItem = (index: number) => {
    setLineItemForm(lineItems[index]);
    setEditingLineIndex(index);
    setShowLineItemForm(true);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!supplierId || lineItems.length === 0) {
      alert('Please select a supplier and add at least one line item.');
      return;
    }

    const poLineItems: POLineItem[] = lineItems.map((li, index) => ({
      id: `li-${Date.now()}-${index}`,
      ...li,
      quantityReceived: 0,
    }));

    if (isNew) {
      const newId = createPurchaseOrder({
        supplierId,
        supplierName: selectedSupplier?.name || '',
        status: 'draft',
        lineItems: poLineItems,
        subtotal,
        tax,
        shipping,
        total,
        expectedDeliveryDate,
        notes,
      });
      navigate(`/supply-chain/purchase-orders/${newId}`);
    } else if (existingPO) {
      updatePurchaseOrder(existingPO.id, {
        supplierId,
        supplierName: selectedSupplier?.name || '',
        lineItems: poLineItems,
        subtotal,
        tax,
        shipping,
        total,
        expectedDeliveryDate,
        notes,
      });
    }
  };

  const handleStatusAction = (action: 'submit' | 'approve' | 'cancel') => {
    if (!existingPO) return;
    switch (action) {
      case 'submit':
        submitPurchaseOrder(existingPO.id);
        break;
      case 'approve':
        approvePurchaseOrder(existingPO.id, 'Current User');
        break;
      case 'cancel':
        if (window.confirm('Are you sure you want to cancel this purchase order?')) {
          cancelPurchaseOrder(existingPO.id);
        }
        break;
    }
  };

  const canEdit = isNew || existingPO?.status === 'draft';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/supply-chain/purchase-orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isNew ? 'New Purchase Order' : existingPO?.poNumber || 'Purchase Order'}
            </h2>
            {!isNew && existingPO && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${PO_STATUS_COLORS[existingPO.status]}`}
              >
                {PO_STATUS_LABELS[existingPO.status]}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {existingPO?.status === 'draft' && (
            <>
              <button
                onClick={() => handleStatusAction('submit')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Submit for Approval
              </button>
              <button
                onClick={() => handleStatusAction('cancel')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel PO
              </button>
            </>
          )}
          {existingPO?.status === 'submitted' && (
            <button
              onClick={() => handleStatusAction('approve')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve
            </button>
          )}
          {(existingPO?.status === 'approved' || existingPO?.status === 'partial') && (
            <button
              onClick={() => navigate(`/supply-chain/receiving?po=${existingPO.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Receive Items
            </button>
          )}
          {canEdit && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isNew ? 'Create PO' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Selection */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">Supplier Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            {selectedSupplier && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}</p>
                <p><strong>Lead Time:</strong> {selectedSupplier.leadTimeDays} days</p>
                <p><strong>Min Order:</strong> ${selectedSupplier.minimumOrderValue}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Line Items</h3>
              {canEdit && (
                <button
                  onClick={() => {
                    setShowLineItemForm(true);
                    setEditingLineIndex(null);
                    setLineItemForm({
                      materialId: '',
                      materialName: '',
                      sku: '',
                      quantityOrdered: 1,
                      unitPrice: 0,
                      unit: 'units',
                    });
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  + Add Item
                </button>
              )}
            </div>

            {lineItems.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Material</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-500">SKU</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Total</th>
                    {canEdit && <th className="text-right py-2 text-sm font-medium text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{li.materialName}</td>
                      <td className="py-3 text-gray-500">{li.sku}</td>
                      <td className="py-3 text-right">{li.quantityOrdered} {li.unit}</td>
                      <td className="py-3 text-right">${li.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">
                        ${(li.quantityOrdered * li.unitPrice).toLocaleString()}
                      </td>
                      {canEdit && (
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleEditLineItem(index)}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveLineItem(index)}
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-8">No line items added yet.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={3}
              placeholder="Additional notes or instructions..."
            />
          </div>

          {/* Receiving History */}
          {receivingRecords.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Receiving History</h3>
              {receivingRecords.map((rec) => (
                <div key={rec.id} className="border-b last:border-b-0 py-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      Received: {new Date(rec.receivedAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">By: {rec.receivedBy}</span>
                  </div>
                  <ul className="text-sm text-gray-600">
                    {rec.lineItems.map((li) => (
                      <li key={li.lineItemId}>
                        {li.materialName}: {li.quantityAccepted} accepted, {li.quantityRejected} rejected
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {existingPO && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{new Date(existingPO.createdAt).toLocaleString()}</p>
                </div>
                {existingPO.approvedBy && (
                  <div>
                    <p className="text-gray-500">Approved by</p>
                    <p>{existingPO.approvedBy}</p>
                  </div>
                )}
                {existingPO.actualDeliveryDate && (
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p>{existingPO.actualDeliveryDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Line Item Modal */}
      {showLineItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingLineIndex !== null ? 'Edit Line Item' : 'Add Line Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={lineItemForm.materialName}
                  onChange={(e) => setLineItemForm({ ...lineItemForm, materialName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={lineItemForm.sku}
                  onChange={(e) => setLineItemForm({ ...lineItemForm, sku: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={lineItemForm.quantityOrdered}
                    onChange={(e) =>
                      setLineItemForm({ ...lineItemForm, quantityOrdered: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={lineItemForm.unit}
                    onChange={(e) => setLineItemForm({ ...lineItemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="units">Units</option>
                    <option value="yards">Yards</option>
                    <option value="sq ft">Sq Ft</option>
                    <option value="spools">Spools</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($) *</label>
                <input
                  type="number"
                  value={lineItemForm.unitPrice}
                  onChange={(e) =>
                    setLineItemForm({ ...lineItemForm, unitPrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowLineItemForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLineItem}
                disabled={!lineItemForm.materialName || lineItemForm.quantityOrdered <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingLineIndex !== null ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
