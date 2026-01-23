/**
 * @file store.ts
 * @description Zustand state management store for the Sales & Orders module.
 *              Manages customers, quotes, orders, fulfillments, and shipments
 *              with computed stats and CRUD actions.
 * @related-prd tasks/prd-sales-orders.md
 * @module sales
 */

import { create } from 'zustand';
import type {
  Customer,
  Quote,
  SalesOrder,
  Fulfillment,
  Shipment,
  SalesDashboardStats,
  QuoteStatus,
  OrderStatus,
  FulfillmentStatus,
  ProductLineItem,
} from './types';
import {
  mockCustomers,
  mockQuotes,
  mockOrders,
  mockFulfillments,
  mockShipments,
} from './mockData';

interface SalesStore {
  // Data
  customers: Customer[];
  quotes: Quote[];
  orders: SalesOrder[];
  fulfillments: Fulfillment[];
  shipments: Shipment[];

  // Computed stats
  stats: SalesDashboardStats;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // Quote actions
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  updateQuoteStatus: (id: string, status: QuoteStatus) => void;
  convertQuoteToOrder: (quoteId: string) => SalesOrder | null;
  getQuoteById: (id: string) => Quote | undefined;
  getQuotesByCustomer: (customerId: string) => Quote[];

  // Order actions
  addOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<SalesOrder>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrderById: (id: string) => SalesOrder | undefined;
  getOrdersByCustomer: (customerId: string) => SalesOrder[];

  // Fulfillment actions
  createFulfillment: (orderId: string) => Fulfillment | null;
  updateFulfillmentStatus: (id: string, status: FulfillmentStatus) => void;
  updatePickedQuantity: (fulfillmentId: string, productId: string, quantity: number, pickedBy: string) => void;
  getFulfillmentByOrder: (orderId: string) => Fulfillment | undefined;

  // Shipment actions
  createShipment: (shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShipmentStatus: (id: string, status: Shipment['status']) => void;
  getShipmentByOrder: (orderId: string) => Shipment | undefined;

  // Utility
  recalculateStats: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  return `Q-${year}-${num}`;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  return `SO-${year}-${num}`;
}

function calculateStats(
  customers: Customer[],
  quotes: Quote[],
  orders: SalesOrder[]
): SalesDashboardStats {
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const openQuotes = quotes.filter(q => ['draft', 'sent'].includes(q.status));
  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status));
  
  const allOrderTotals = orders.map(o => o.total);
  const avgOrderValue = allOrderTotals.length > 0 
    ? allOrderTotals.reduce((a, b) => a + b, 0) / allOrderTotals.length 
    : 0;

  return {
    totalCustomers: customers.length,
    activeCustomers,
    openQuotes: openQuotes.length,
    quotesValue: openQuotes.reduce((sum, q) => sum + q.total, 0),
    pendingOrders: pendingOrders.length,
    ordersValue: pendingOrders.reduce((sum, o) => sum + o.total, 0),
    shipmentsToday: 0, // Would be calculated from actual dates
    avgOrderValue,
  };
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  // Initialize with mock data
  customers: mockCustomers,
  quotes: mockQuotes,
  orders: mockOrders,
  fulfillments: mockFulfillments,
  shipments: mockShipments,
  stats: calculateStats(mockCustomers, mockQuotes, mockOrders),

  // Customer actions
  addCustomer: (customer) => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: generateId('cust'),
      createdAt: now,
      updatedAt: now,
    };
    set(state => {
      const customers = [...state.customers, newCustomer];
      return { customers, stats: calculateStats(customers, state.quotes, state.orders) };
    });
  },

  updateCustomer: (id, updates) => {
    set(state => {
      const customers = state.customers.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      return { customers, stats: calculateStats(customers, state.quotes, state.orders) };
    });
  },

  deleteCustomer: (id) => {
    set(state => {
      const customers = state.customers.filter(c => c.id !== id);
      return { customers, stats: calculateStats(customers, state.quotes, state.orders) };
    });
  },

  getCustomerById: (id) => get().customers.find(c => c.id === id),

  // Quote actions
  addQuote: (quote) => {
    const now = new Date().toISOString();
    const newQuote: Quote = {
      ...quote,
      id: generateId('quote'),
      quoteNumber: generateQuoteNumber(),
      createdAt: now,
      updatedAt: now,
    };
    set(state => {
      const quotes = [...state.quotes, newQuote];
      return { quotes, stats: calculateStats(state.customers, quotes, state.orders) };
    });
  },

  updateQuote: (id, updates) => {
    set(state => {
      const quotes = state.quotes.map(q =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      );
      return { quotes, stats: calculateStats(state.customers, quotes, state.orders) };
    });
  },

  updateQuoteStatus: (id, status) => {
    set(state => {
      const quotes = state.quotes.map(q =>
        q.id === id
          ? {
              ...q,
              status,
              updatedAt: new Date().toISOString(),
              approvedAt: status === 'approved' ? new Date().toISOString() : q.approvedAt,
            }
          : q
      );
      return { quotes, stats: calculateStats(state.customers, quotes, state.orders) };
    });
  },

  convertQuoteToOrder: (quoteId) => {
    const quote = get().quotes.find(q => q.id === quoteId);
    if (!quote || quote.status !== 'approved') return null;

    const customer = get().getCustomerById(quote.customerId);
    if (!customer) return null;

    const shippingAddress = customer.addresses.find(a => a.type === 'shipping') || customer.addresses[0];
    const billingAddress = customer.addresses.find(a => a.type === 'billing') || shippingAddress;

    if (!shippingAddress || !billingAddress) return null;

    const now = new Date().toISOString();
    const newOrder: SalesOrder = {
      id: generateId('order'),
      orderNumber: generateOrderNumber(),
      customerId: quote.customerId,
      customerName: quote.customerName,
      quoteId: quote.id,
      status: 'pending',
      priority: 'standard',
      lineItems: quote.lineItems,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      shippingCost: quote.shippingCost,
      total: quote.total,
      shippingAddress,
      billingAddress,
      createdAt: now,
      updatedAt: now,
    };

    set(state => {
      const quotes = state.quotes.map(q =>
        q.id === quoteId
          ? { ...q, status: 'converted' as QuoteStatus, convertedToOrderId: newOrder.id, updatedAt: now }
          : q
      );
      const orders = [...state.orders, newOrder];
      return { quotes, orders, stats: calculateStats(state.customers, quotes, orders) };
    });

    return newOrder;
  },

  getQuoteById: (id) => get().quotes.find(q => q.id === id),
  getQuotesByCustomer: (customerId) => get().quotes.filter(q => q.customerId === customerId),

  // Order actions
  addOrder: (order) => {
    const now = new Date().toISOString();
    const newOrder: SalesOrder = {
      ...order,
      id: generateId('order'),
      orderNumber: generateOrderNumber(),
      createdAt: now,
      updatedAt: now,
    };
    set(state => {
      const orders = [...state.orders, newOrder];
      return { orders, stats: calculateStats(state.customers, state.quotes, orders) };
    });
  },

  updateOrder: (id, updates) => {
    set(state => {
      const orders = state.orders.map(o =>
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      );
      return { orders, stats: calculateStats(state.customers, state.quotes, orders) };
    });
  },

  updateOrderStatus: (id, status) => {
    set(state => {
      const orders = state.orders.map(o =>
        o.id === id
          ? {
              ...o,
              status,
              updatedAt: new Date().toISOString(),
              actualShipDate: status === 'shipped' ? new Date().toISOString() : o.actualShipDate,
              deliveredDate: status === 'delivered' ? new Date().toISOString() : o.deliveredDate,
            }
          : o
      );
      return { orders, stats: calculateStats(state.customers, state.quotes, orders) };
    });
  },

  getOrderById: (id) => get().orders.find(o => o.id === id),
  getOrdersByCustomer: (customerId) => get().orders.filter(o => o.customerId === customerId),

  // Fulfillment actions
  createFulfillment: (orderId) => {
    const order = get().getOrderById(orderId);
    if (!order) return null;

    const existingFulfillment = get().fulfillments.find(f => f.orderId === orderId);
    if (existingFulfillment) return existingFulfillment;

    const now = new Date().toISOString();
    const fulfillment: Fulfillment = {
      id: generateId('fulfill'),
      orderId,
      orderNumber: order.orderNumber,
      status: 'pending',
      pickList: order.lineItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        location: 'TBD', // Would come from inventory system
        quantityOrdered: item.quantity,
        quantityPicked: 0,
      })),
      createdAt: now,
      updatedAt: now,
    };

    set(state => ({
      fulfillments: [...state.fulfillments, fulfillment],
    }));

    return fulfillment;
  },

  updateFulfillmentStatus: (id, status) => {
    set(state => ({
      fulfillments: state.fulfillments.map(f =>
        f.id === id ? { ...f, status, updatedAt: new Date().toISOString() } : f
      ),
    }));
  },

  updatePickedQuantity: (fulfillmentId, productId, quantity, pickedBy) => {
    set(state => ({
      fulfillments: state.fulfillments.map(f =>
        f.id === fulfillmentId
          ? {
              ...f,
              pickList: f.pickList.map(item =>
                item.productId === productId
                  ? { ...item, quantityPicked: quantity, pickedBy, pickedAt: new Date().toISOString() }
                  : item
              ),
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    }));
  },

  getFulfillmentByOrder: (orderId) => get().fulfillments.find(f => f.orderId === orderId),

  // Shipment actions
  createShipment: (shipment) => {
    const now = new Date().toISOString();
    const newShipment: Shipment = {
      ...shipment,
      id: generateId('ship'),
      createdAt: now,
      updatedAt: now,
    };
    set(state => ({
      shipments: [...state.shipments, newShipment],
    }));

    // Update order status to shipped
    get().updateOrderStatus(shipment.orderId, 'shipped');
    get().updateFulfillmentStatus(shipment.fulfillmentId, 'shipped');
  },

  updateShipmentStatus: (id, status) => {
    set(state => {
      const shipments = state.shipments.map(s =>
        s.id === id
          ? {
              ...s,
              status,
              updatedAt: new Date().toISOString(),
              actualDelivery: status === 'delivered' ? new Date().toISOString() : s.actualDelivery,
            }
          : s
      );

      // If delivered, update order status
      const shipment = shipments.find(s => s.id === id);
      if (shipment && status === 'delivered') {
        const orders = state.orders.map(o =>
          o.id === shipment.orderId
            ? { ...o, status: 'delivered' as OrderStatus, deliveredDate: new Date().toISOString() }
            : o
        );
        return { shipments, orders, stats: calculateStats(state.customers, state.quotes, orders) };
      }

      return { shipments };
    });
  },

  getShipmentByOrder: (orderId) => get().shipments.find(s => s.orderId === orderId),

  recalculateStats: () => {
    set(state => ({
      stats: calculateStats(state.customers, state.quotes, state.orders),
    }));
  },
}));
