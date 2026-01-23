/**
 * Sales & Order Management Module Types
 * US-1.1: Type Definitions for Customers, Quotes, Orders, Shipping
 */

// ============================================================================
// Customers
// ============================================================================

export type CustomerType = 'retail' | 'wholesale' | 'distributor' | 'team';

export type CustomerStatus = 'active' | 'inactive' | 'pending';

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface PaymentTerms {
  netDays: number; // Net 30, Net 60, etc.
  discountPercent?: number;
  discountDays?: number; // e.g., 2/10 Net 30
  creditLimit: number;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  contacts: Contact[];
  addresses: Address[];
  paymentTerms: PaymentTerms;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Products (simplified for sales context)
// ============================================================================

export interface ProductLineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage
  totalPrice: number;
}

// ============================================================================
// Quotes
// ============================================================================

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  status: QuoteStatus;
  lineItems: ProductLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  convertedToOrderId?: string;
}

// ============================================================================
// Sales Orders
// ============================================================================

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'standard' | 'rush' | 'priority';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  quoteId?: string;
  status: OrderStatus;
  priority: OrderPriority;
  lineItems: ProductLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  requestedShipDate?: string;
  promisedShipDate?: string;
  actualShipDate?: string;
  deliveredDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Fulfillment
// ============================================================================

export type FulfillmentStatus = 'pending' | 'picking' | 'packing' | 'ready' | 'shipped';

export interface PickListItem {
  productId: string;
  productName: string;
  sku: string;
  location: string;
  quantityOrdered: number;
  quantityPicked: number;
  pickedBy?: string;
  pickedAt?: string;
}

export interface Fulfillment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: FulfillmentStatus;
  pickList: PickListItem[];
  packingSlipNumber?: string;
  totalWeight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Shipping
// ============================================================================

export type ShippingCarrier = 'ups' | 'fedex' | 'usps' | 'dhl' | 'freight' | 'local';

export type ShipmentStatus = 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

export interface Shipment {
  id: string;
  orderId: string;
  fulfillmentId: string;
  carrier: ShippingCarrier;
  service: string; // e.g., "Ground", "2-Day", "Overnight"
  trackingNumber: string;
  status: ShipmentStatus;
  labelUrl?: string;
  shippedAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  signedBy?: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface SalesDashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  openQuotes: number;
  quotesValue: number;
  pendingOrders: number;
  ordersValue: number;
  shipmentsToday: number;
  avgOrderValue: number;
}
