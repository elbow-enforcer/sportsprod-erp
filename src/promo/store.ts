/**
 * @file store.ts
 * @description Zustand store for Promo Codes - basic CRUD
 * @related-issue Issue #2 - Promo Code System
 * @module promo
 */

import { create } from 'zustand';
import type { PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput } from './types';

// Mock data
const mockPromoCodes: PromoCode[] = [
  {
    id: 'promo-001',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    expiryDate: '2026-12-31',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'promo-002',
    code: 'FLAT50',
    discountType: 'fixed',
    discountValue: 50,
    expiryDate: '2026-06-30',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'promo-003',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
];

function generateId(): string {
  return `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface PromoStore {
  promoCodes: PromoCode[];
  
  // CRUD operations
  addPromoCode: (input: CreatePromoCodeInput) => PromoCode;
  updatePromoCode: (id: string, updates: UpdatePromoCodeInput) => void;
  deletePromoCode: (id: string) => void;
  getPromoCodeById: (id: string) => PromoCode | undefined;
}

export const usePromoStore = create<PromoStore>((set, get) => ({
  promoCodes: mockPromoCodes,

  addPromoCode: (input) => {
    const now = new Date().toISOString();
    const newPromo: PromoCode = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      promoCodes: [...state.promoCodes, newPromo],
    }));
    return newPromo;
  },

  updatePromoCode: (id, updates) => {
    set((state) => ({
      promoCodes: state.promoCodes.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  deletePromoCode: (id) => {
    set((state) => ({
      promoCodes: state.promoCodes.filter((p) => p.id !== id),
    }));
  },

  getPromoCodeById: (id) => get().promoCodes.find((p) => p.id === id),
}));
