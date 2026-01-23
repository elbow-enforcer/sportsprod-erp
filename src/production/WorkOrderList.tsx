/**
 * Work Order List Page
 * US-3.1: Work Order List Page
 * 
 * Lists all work orders with filtering, sorting, and bulk actions
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';
import { WorkOrder, WorkOrderStatus, WORK_ORDER_STATUS_COLORS, PRIORITY_COLORS } from './types';

type SortField = 'id' | 'product' | 'quantity' | 'status' | 'scheduledStart' | 'priority' | 'assignedTo';
type SortDirection = 'asc' | 'desc';

const STATUS_OPTIONS = Object.values(WorkOrderStatus);

export function WorkOrderList() {
  const { workOrders, billsOfMaterials, updateWorkOrderStatus } = useProductionStore();
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');
  
  // Sort state
  const [sortField, setSortField] = useState<SortField>('scheduledStart');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Get unique assignees
  const assignees = useMemo(() => {
    const unique = new Set<string>();
    workOrders.forEach((wo) => {
      if (wo.assignedTo) unique.add(wo.assignedTo);
    });
    return Array.from(unique).sort();
  }, [workOrders]);

  // Get BOM by ID
  const getBOM = (bomId: string) => billsOfMaterials.find((b) => b.id === bomId);

  // Filter and sort work orders
  const filteredWorkOrders = useMemo(() => {
    let result = [...workOrders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((wo) => wo.status === statusFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      result = result.filter((wo) => wo.assignedTo === assigneeFilter);
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    if (dateFilter === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter((wo) => {
        const start = new Date(wo.scheduledStart);
        return start >= today && start < tomorrow;
      });
    } else if (dateFilter === 'week') {
      result = result.filter((wo) => {
        const start = new Date(wo.scheduledStart);
        return start >= today && start < weekFromNow;
      });
    } else if (dateFilter === 'overdue') {
      result = result.filter((wo) => {
        if (wo.status === WorkOrderStatus.Complete || wo.status === WorkOrderStatus.Cancelled) {
          return false;
        }
        return new Date(wo.scheduledEnd) < today;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'product':
          const bomA = getBOM(a.bomId);
          const bomB = getBOM(b.bomId);
          comparison = (bomA?.productName || '').localeCompare(bomB?.productName || '');
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'scheduledStart':
          comparison = new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
          break;
        case 'priority':
          const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'assignedTo':
          comparison = (a.assignedTo || '').localeCompare(b.assignedTo || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [workOrders, statusFilter, assigneeFilter, dateFilter, sortField, sortDirection, billsOfMaterials]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWorkOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWorkOrders.map((wo) => wo.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk actions
  const handleBulkStart = () => {
    selectedIds.forEach((id) => {
      const wo = workOrders.find((w) => w.id === id);
      if (wo && (wo.status === WorkOrderStatus.Draft || wo.status === WorkOrderStatus.Scheduled)) {
        updateWorkOrderStatus(id, WorkOrderStatus.InProgress);
      }
    });
    setSelectedIds(new Set());
  };

  const handleBulkComplete = () => {
    selectedIds.forEach((id) => {
      const wo = workOrders.find((w) => w.id === id);
      if (wo && wo.status === WorkOrderStatus.InProgress) {
        updateWorkOrderStatus(id, WorkOrderStatus.Complete);
      }
    });
    setSelectedIds(new Set());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    return colorMap[WORK_ORDER_STATUS_COLORS[status]] || colorMap.gray;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      gray: 'text-gray-500',
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
    };
    return colorMap[PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]] || colorMap.gray;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Urgent') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    if (priority === 'High') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
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

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      total: workOrders.length,
      inProgress: workOrders.filter((wo) => wo.status === WorkOrderStatus.InProgress).length,
      scheduled: workOrders.filter((wo) => wo.status === WorkOrderStatus.Scheduled).length,
      overdue: workOrders.filter((wo) => {
        if (wo.status === WorkOrderStatus.Complete || wo.status === WorkOrderStatus.Cancelled) return false;
        return new Date(wo.scheduledEnd) < today;
      }).length,
    };
  }, [workOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-500 mt-1">Manage production jobs and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/production/kanban"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban View
          </Link>
          <Link
            to="/production/work-orders/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Work Order
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'overdue')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="md:ml-auto flex items-end gap-2">
              <span className="text-sm text-gray-500 mb-2">{selectedIds.size} selected</span>
              <button
                onClick={handleBulkStart}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
              >
                Start Selected
              </button>
              <button
                onClick={handleBulkComplete}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
              >
                Complete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Work Order Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredWorkOrders.length && filteredWorkOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    WO#
                    <SortIcon field="id" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('product')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <SortIcon field="product" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Qty
                    <SortIcon field="quantity" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('scheduledStart')}
                >
                  <div className="flex items-center gap-2">
                    Scheduled
                    <SortIcon field="scheduledStart" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Priority
                    <SortIcon field="priority" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('assignedTo')}
                >
                  <div className="flex items-center gap-2">
                    Assigned To
                    <SortIcon field="assignedTo" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No work orders match your filters
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map((wo) => {
                  const bom = getBOM(wo.bomId);
                  const isOverdue =
                    wo.status !== WorkOrderStatus.Complete &&
                    wo.status !== WorkOrderStatus.Cancelled &&
                    new Date(wo.scheduledEnd) < new Date();

                  return (
                    <tr key={wo.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(wo.id)}
                          onChange={() => toggleSelect(wo.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/production/work-orders/${wo.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {wo.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{bom?.productName || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {wo.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(wo.scheduledStart)}</div>
                        <div className="text-xs text-gray-500">to {formatDate(wo.scheduledEnd)}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${getPriorityColor(wo.priority)}`}>
                          {getPriorityIcon(wo.priority)}
                          {wo.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {wo.assignedTo || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/production/work-orders/${wo.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors inline-block"
                          title="View/Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredWorkOrders.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
            Showing {filteredWorkOrders.length} of {workOrders.length} work orders
          </div>
        )}
      </div>
    </div>
  );
}
