/**
 * @file index.ts
 * @description Main export file for the Sales & Orders module.
 *              Re-exports all components, store, and types.
 * @related-prd tasks/prd-sales-orders.md
 * @module sales
 */

export { CustomerList } from './CustomerList';
export { CustomerDetail } from './CustomerDetail';
export { QuoteList } from './QuoteList';
export { QuoteDetail } from './QuoteDetail';
export { SalesOrderList } from './SalesOrderList';
export { SalesOrderDetail } from './SalesOrderDetail';
export { Fulfillment } from './Fulfillment';

export { useSalesStore } from './store';
export * from './types';
