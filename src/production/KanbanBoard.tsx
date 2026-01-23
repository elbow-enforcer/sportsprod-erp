/**
 * Kanban Board
 * US-3.3: Kanban Board
 * 
 * Drag-and-drop kanban board for work order status management
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionStore } from './store';
import { WorkOrder, WorkOrderStatus, WORK_ORDER_STATUS_COLORS, PRIORITY_COLORS } from './types';

// Kanban columns configuration
const KANBAN_COLUMNS: { status: WorkOrderStatus; label: string; bgColor: string; borderColor: string }[] = [
  { status: WorkOrderStatus.Draft, label: 'Draft', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' },
  { status: WorkOrderStatus.Scheduled, label: 'Scheduled', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { status: WorkOrderStatus.InProgress, label: 'In Progress', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  { status: WorkOrderStatus.QualityCheck, label: 'Quality Check', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  { status: WorkOrderStatus.Complete, label: 'Complete', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
];

// Valid transitions for drag-drop
const VALID_DROP_TARGETS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.Draft]: [WorkOrderStatus.Scheduled],
  [WorkOrderStatus.Scheduled]: [WorkOrderStatus.InProgress, WorkOrderStatus.Draft],
  [WorkOrderStatus.InProgress]: [WorkOrderStatus.QualityCheck],
  [WorkOrderStatus.QualityCheck]: [WorkOrderStatus.Complete, WorkOrderStatus.InProgress],
  [WorkOrderStatus.Complete]: [],
  [WorkOrderStatus.Cancelled]: [WorkOrderStatus.Draft],
};

export function KanbanBoard() {
  const { workOrders, billsOfMaterials, updateWorkOrderStatus } = useProductionStore();
  
  // Drag state
  const [draggedOrder, setDraggedOrder] = useState<WorkOrder | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkOrderStatus | null>(null);

  // Filter out cancelled orders for kanban
  const activeOrders = useMemo(() => {
    return workOrders.filter((wo) => wo.status !== WorkOrderStatus.Cancelled);
  }, [workOrders]);

  // Group work orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<WorkOrderStatus, WorkOrder[]> = {
      [WorkOrderStatus.Draft]: [],
      [WorkOrderStatus.Scheduled]: [],
      [WorkOrderStatus.InProgress]: [],
      [WorkOrderStatus.QualityCheck]: [],
      [WorkOrderStatus.Complete]: [],
      [WorkOrderStatus.Cancelled]: [],
    };

    activeOrders.forEach((wo) => {
      grouped[wo.status].push(wo);
    });

    // Sort by priority within each column
    const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    Object.keys(grouped).forEach((status) => {
      grouped[status as WorkOrderStatus].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    });

    return grouped;
  }, [activeOrders]);

  // Get BOM by ID
  const getBOM = (bomId: string) => billsOfMaterials.find((b) => b.id === bomId);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, order: WorkOrder) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', order.id);
  };

  const handleDragOver = (e: React.DragEvent, status: WorkOrderStatus) => {
    e.preventDefault();
    if (!draggedOrder) return;

    const validTargets = VALID_DROP_TARGETS[draggedOrder.status];
    if (validTargets.includes(status)) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(status);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: WorkOrderStatus) => {
    e.preventDefault();
    if (!draggedOrder) return;

    const validTargets = VALID_DROP_TARGETS[draggedOrder.status];
    if (validTargets.includes(targetStatus)) {
      updateWorkOrderStatus(draggedOrder.id, targetStatus);
    }

    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Urgent: 'bg-red-500',
      High: 'bg-orange-500',
      Medium: 'bg-blue-500',
      Low: 'bg-gray-400',
    };
    return colors[priority] || colors.Low;
  };

  const isOverdue = (wo: WorkOrder) => {
    if (wo.status === WorkOrderStatus.Complete) return false;
    return new Date(wo.scheduledEnd) < new Date();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-500 mt-1">Drag and drop to update status</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/production/work-orders"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </Link>
          <Link
            to="/production/work-orders/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </Link>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {KANBAN_COLUMNS.map((column) => {
            const orders = ordersByStatus[column.status];
            const isValidTarget = draggedOrder && VALID_DROP_TARGETS[draggedOrder.status].includes(column.status);
            const isHighlighted = dragOverColumn === column.status;

            return (
              <div
                key={column.status}
                className={`flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all ${column.bgColor} ${
                  isHighlighted ? 'border-blue-500 ring-2 ring-blue-200' : column.borderColor
                } ${isValidTarget && !isHighlighted ? 'border-dashed' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{column.label}</h3>
                    <span className="px-2 py-0.5 bg-white/80 rounded-full text-sm text-gray-600">
                      {orders.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                  {orders.map((order) => {
                    const bom = getBOM(order.bomId);
                    const overdue = isOverdue(order);

                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-lg shadow-sm border p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                          draggedOrder?.id === order.id ? 'opacity-50 ring-2 ring-blue-400' : ''
                        } ${overdue ? 'border-red-300' : 'border-gray-200'}`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            to={`/production/work-orders/${order.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.id}
                          </Link>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`} title={order.priority} />
                        </div>

                        {/* Product Name */}
                        <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {bom?.productName || 'Unknown Product'}
                        </p>

                        {/* Quantity */}
                        <p className="text-xs text-gray-500 mb-2">
                          Qty: {order.quantity.toLocaleString()}
                        </p>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {overdue && '⚠ '}
                            Due: {formatDate(order.scheduledEnd)}
                          </span>
                          {order.assignedTo && (
                            <span className="text-gray-500 truncate ml-2" title={order.assignedTo}>
                              {order.assignedTo.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Priority Badge for Urgent/High */}
                        {(order.priority === 'Urgent' || order.priority === 'High') && (
                          <div className={`mt-2 text-xs font-medium px-2 py-0.5 rounded inline-block ${
                            order.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.priority}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty State */}
                  {orders.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm text-gray-400">
                      No orders
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="font-medium">Priority:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Low</span>
          </div>
          <span className="ml-4 text-red-600">⚠ = Overdue</span>
        </div>
      </div>
    </div>
  );
}
