/**
 * Mock Data for Sales & Orders Module
 */

import type {
  Customer,
  Quote,
  SalesOrder,
  Fulfillment,
  Shipment,
  Address,
  ProductLineItem,
} from './types';

// ============================================================================
// Mock Addresses
// ============================================================================

const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    type: 'shipping',
    line1: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'USA',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'billing',
    line1: '456 Oak Avenue',
    city: 'Dallas',
    state: 'TX',
    postalCode: '75201',
    country: 'USA',
    isDefault: true,
  },
];

// ============================================================================
// Mock Customers
// ============================================================================

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Austin Sports Academy',
    type: 'team',
    status: 'active',
    contacts: [
      {
        id: 'cont-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@austinsports.com',
        phone: '512-555-0101',
        role: 'Athletic Director',
        isPrimary: true,
      },
    ],
    addresses: [mockAddresses[0]],
    paymentTerms: {
      netDays: 30,
      creditLimit: 50000,
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Pro Equipment Distributors',
    type: 'distributor',
    status: 'active',
    contacts: [
      {
        id: 'cont-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@proequip.com',
        phone: '214-555-0202',
        role: 'Purchasing Manager',
        isPrimary: true,
      },
      {
        id: 'cont-3',
        firstName: 'Mike',
        lastName: 'Brown',
        email: 'mike@proequip.com',
        phone: '214-555-0203',
        role: 'Warehouse Manager',
        isPrimary: false,
      },
    ],
    addresses: [mockAddresses[1]],
    paymentTerms: {
      netDays: 45,
      discountPercent: 2,
      discountDays: 10,
      creditLimit: 150000,
    },
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'cust-3',
    name: 'Houston Youth League',
    type: 'team',
    status: 'active',
    contacts: [
      {
        id: 'cont-4',
        firstName: 'Lisa',
        lastName: 'Martinez',
        email: 'lisa@houstonyouth.org',
        phone: '713-555-0303',
        role: 'League Coordinator',
        isPrimary: true,
      },
    ],
    addresses: [
      {
        id: 'addr-3',
        type: 'shipping',
        line1: '789 Sports Lane',
        city: 'Houston',
        state: 'TX',
        postalCode: '77001',
        country: 'USA',
        isDefault: true,
      },
    ],
    paymentTerms: {
      netDays: 30,
      creditLimit: 25000,
    },
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Valley Sports Retail',
    type: 'wholesale',
    status: 'active',
    contacts: [
      {
        id: 'cont-5',
        firstName: 'Robert',
        lastName: 'Chen',
        email: 'robert@valleysports.com',
        phone: '956-555-0404',
        role: 'Owner',
        isPrimary: true,
      },
    ],
    addresses: [
      {
        id: 'addr-4',
        type: 'shipping',
        line1: '321 Retail Plaza',
        city: 'McAllen',
        state: 'TX',
        postalCode: '78501',
        country: 'USA',
        isDefault: true,
      },
    ],
    paymentTerms: {
      netDays: 30,
      creditLimit: 75000,
    },
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'cust-5',
    name: 'Individual Customer - Demo',
    type: 'retail',
    status: 'pending',
    contacts: [
      {
        id: 'cont-6',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        isPrimary: true,
      },
    ],
    addresses: [],
    paymentTerms: {
      netDays: 0,
      creditLimit: 0,
    },
    createdAt: '2025-01-22T00:00:00Z',
    updatedAt: '2025-01-22T00:00:00Z',
  },
];

// ============================================================================
// Mock Line Items
// ============================================================================

const mockLineItems: ProductLineItem[] = [
  {
    productId: 'prod-1',
    productName: 'ProShot Basketball',
    sku: 'PSB-001',
    quantity: 50,
    unitPrice: 89.99,
    discount: 10,
    totalPrice: 4049.55,
  },
  {
    productId: 'prod-2',
    productName: 'Elite Training Cone Set',
    sku: 'ETC-010',
    quantity: 20,
    unitPrice: 34.99,
    discount: 0,
    totalPrice: 699.80,
  },
  {
    productId: 'prod-3',
    productName: 'Premium Soccer Ball',
    sku: 'PSB-020',
    quantity: 100,
    unitPrice: 45.00,
    discount: 15,
    totalPrice: 3825.00,
  },
];

// ============================================================================
// Mock Quotes
// ============================================================================

export const mockQuotes: Quote[] = [
  {
    id: 'quote-1',
    quoteNumber: 'Q-2025-001',
    customerId: 'cust-1',
    customerName: 'Austin Sports Academy',
    status: 'sent',
    lineItems: [mockLineItems[0], mockLineItems[1]],
    subtotal: 4749.35,
    taxRate: 8.25,
    taxAmount: 391.82,
    shippingCost: 125.00,
    total: 5266.17,
    validUntil: '2025-02-15T00:00:00Z',
    notes: 'Bulk order for spring season',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-16T00:00:00Z',
  },
  {
    id: 'quote-2',
    quoteNumber: 'Q-2025-002',
    customerId: 'cust-2',
    customerName: 'Pro Equipment Distributors',
    status: 'approved',
    lineItems: [mockLineItems[2]],
    subtotal: 3825.00,
    taxRate: 0, // Wholesale exempt
    taxAmount: 0,
    shippingCost: 250.00,
    total: 4075.00,
    validUntil: '2025-02-28T00:00:00Z',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
    approvedAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'quote-3',
    quoteNumber: 'Q-2025-003',
    customerId: 'cust-3',
    customerName: 'Houston Youth League',
    status: 'draft',
    lineItems: [mockLineItems[0]],
    subtotal: 4049.55,
    taxRate: 8.25,
    taxAmount: 334.09,
    shippingCost: 75.00,
    total: 4458.64,
    validUntil: '2025-02-20T00:00:00Z',
    notes: 'Pending team count confirmation',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
];

// ============================================================================
// Mock Sales Orders
// ============================================================================

export const mockOrders: SalesOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'SO-2025-001',
    customerId: 'cust-2',
    customerName: 'Pro Equipment Distributors',
    quoteId: 'quote-2',
    status: 'processing',
    priority: 'standard',
    lineItems: [mockLineItems[2]],
    subtotal: 3825.00,
    taxRate: 0,
    taxAmount: 0,
    shippingCost: 250.00,
    total: 4075.00,
    shippingAddress: {
      id: 'addr-ship-1',
      type: 'shipping',
      line1: '456 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75201',
      country: 'USA',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-bill-1',
      type: 'billing',
      line1: '456 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75201',
      country: 'USA',
      isDefault: true,
    },
    requestedShipDate: '2025-01-25T00:00:00Z',
    promisedShipDate: '2025-01-26T00:00:00Z',
    createdAt: '2025-01-19T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'order-2',
    orderNumber: 'SO-2025-002',
    customerId: 'cust-4',
    customerName: 'Valley Sports Retail',
    status: 'confirmed',
    priority: 'rush',
    lineItems: [mockLineItems[0], mockLineItems[1]],
    subtotal: 4749.35,
    taxRate: 0,
    taxAmount: 0,
    shippingCost: 175.00,
    total: 4924.35,
    shippingAddress: {
      id: 'addr-ship-2',
      type: 'shipping',
      line1: '321 Retail Plaza',
      city: 'McAllen',
      state: 'TX',
      postalCode: '78501',
      country: 'USA',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-bill-2',
      type: 'billing',
      line1: '321 Retail Plaza',
      city: 'McAllen',
      state: 'TX',
      postalCode: '78501',
      country: 'USA',
      isDefault: true,
    },
    requestedShipDate: '2025-01-24T00:00:00Z',
    promisedShipDate: '2025-01-24T00:00:00Z',
    notes: 'Rush order - needs expedited shipping',
    createdAt: '2025-01-21T00:00:00Z',
    updatedAt: '2025-01-21T00:00:00Z',
  },
  {
    id: 'order-3',
    orderNumber: 'SO-2025-003',
    customerId: 'cust-1',
    customerName: 'Austin Sports Academy',
    status: 'shipped',
    priority: 'standard',
    lineItems: [mockLineItems[1]],
    subtotal: 699.80,
    taxRate: 8.25,
    taxAmount: 57.73,
    shippingCost: 35.00,
    total: 792.53,
    shippingAddress: {
      id: 'addr-ship-3',
      type: 'shipping',
      line1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-bill-3',
      type: 'billing',
      line1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      isDefault: true,
    },
    actualShipDate: '2025-01-18T00:00:00Z',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
  },
];

// ============================================================================
// Mock Fulfillments
// ============================================================================

export const mockFulfillments: Fulfillment[] = [
  {
    id: 'fulfill-1',
    orderId: 'order-1',
    orderNumber: 'SO-2025-001',
    status: 'picking',
    pickList: [
      {
        productId: 'prod-3',
        productName: 'Premium Soccer Ball',
        sku: 'PSB-020',
        location: 'A-1-3',
        quantityOrdered: 100,
        quantityPicked: 45,
        pickedBy: 'John D.',
        pickedAt: '2025-01-22T14:30:00Z',
      },
    ],
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-22T14:30:00Z',
  },
  {
    id: 'fulfill-2',
    orderId: 'order-2',
    orderNumber: 'SO-2025-002',
    status: 'pending',
    pickList: [
      {
        productId: 'prod-1',
        productName: 'ProShot Basketball',
        sku: 'PSB-001',
        location: 'B-2-1',
        quantityOrdered: 50,
        quantityPicked: 0,
      },
      {
        productId: 'prod-2',
        productName: 'Elite Training Cone Set',
        sku: 'ETC-010',
        location: 'C-1-5',
        quantityOrdered: 20,
        quantityPicked: 0,
      },
    ],
    createdAt: '2025-01-21T00:00:00Z',
    updatedAt: '2025-01-21T00:00:00Z',
  },
  {
    id: 'fulfill-3',
    orderId: 'order-3',
    orderNumber: 'SO-2025-003',
    status: 'shipped',
    pickList: [
      {
        productId: 'prod-2',
        productName: 'Elite Training Cone Set',
        sku: 'ETC-010',
        location: 'C-1-5',
        quantityOrdered: 20,
        quantityPicked: 20,
        pickedBy: 'Sarah M.',
        pickedAt: '2025-01-17T10:00:00Z',
      },
    ],
    packingSlipNumber: 'PS-2025-003',
    totalWeight: 15.5,
    dimensions: { length: 24, width: 18, height: 12 },
    createdAt: '2025-01-16T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
  },
];

// ============================================================================
// Mock Shipments
// ============================================================================

export const mockShipments: Shipment[] = [
  {
    id: 'ship-1',
    orderId: 'order-3',
    fulfillmentId: 'fulfill-3',
    carrier: 'ups',
    service: 'Ground',
    trackingNumber: '1Z999AA10123456784',
    status: 'in_transit',
    shippedAt: '2025-01-18T15:30:00Z',
    estimatedDelivery: '2025-01-23T00:00:00Z',
    cost: 35.00,
    createdAt: '2025-01-18T15:30:00Z',
    updatedAt: '2025-01-20T08:00:00Z',
  },
];
