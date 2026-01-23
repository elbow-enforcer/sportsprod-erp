import { useState } from 'react';
import { useSupplyChainStore } from './store';
import type { Supplier, SupplierStatus } from './types';
import { DEFAULT_SUPPLIER } from './types';

interface SupplierFormData {
  name: string;
  code: string;
  status: SupplierStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  paymentTerms: string;
  leadTimeDays: number;
  minimumOrderValue: number;
  rating: number;
  notes: string;
}

export function SupplierList() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, getSupplierPerformance } = useSupplyChainStore();
  const [filter, setFilter] = useState<'all' | SupplierStatus>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({ ...DEFAULT_SUPPLIER });

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      code: supplier.code,
      status: supplier.status,
      contactName: supplier.contactName,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      leadTimeDays: supplier.leadTimeDays,
      minimumOrderValue: supplier.minimumOrderValue,
      rating: supplier.rating,
      notes: supplier.notes,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateSupplier(editingId, formData);
    } else {
      addSupplier(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...DEFAULT_SUPPLIER });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
    }
  };

  const statusColors: Record<SupplierStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-gray-500">Manage your supplier relationships</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ ...DEFAULT_SUPPLIER });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Supplier Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => {
          const perf = getSupplierPerformance(supplier.id);
          return (
            <div
              key={supplier.id}
              className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">Code: {supplier.code}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[supplier.status]}`}
                >
                  {supplier.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <span className="font-medium">Contact:</span> {supplier.contactName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {supplier.contactEmail}
                </p>
                <p>
                  <span className="font-medium">Terms:</span> {supplier.paymentTerms}
                </p>
                <p>
                  <span className="font-medium">Lead Time:</span> {supplier.leadTimeDays} days
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="border-t pt-4 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Orders</p>
                    <p className="font-semibold">{perf.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Value</p>
                    <p className="font-semibold">${perf.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">On-Time %</p>
                    <p className="font-semibold">{perf.onTimeDeliveryRate.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quality %</p>
                    <p className="font-semibold">{perf.qualityAcceptanceRate.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= supplier.rating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No suppliers found. Add your first supplier to get started.
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as SupplierStatus })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Time (days)
                </label>
                <input
                  type="number"
                  value={formData.leadTimeDays}
                  onChange={(e) =>
                    setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order ($)
                </label>
                <input
                  type="number"
                  value={formData.minimumOrderValue}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumOrderValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.code}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'} Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
