/**
 * Zustand store for G&A personnel state management
 */

import { create } from 'zustand';
import type { Personnel, MonthlyAggregateCost } from '../models/gna';
import {
  calculateMonthlyAggregate,
  calculateAnnualCost,
  sumAnnualCost,
} from '../models/gna';

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return `personnel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface GnaState {
  // Personnel roster
  personnel: Personnel[];
  
  // CRUD operations
  addPersonnel: (person: Omit<Personnel, 'id'>) => string;
  updatePersonnel: (id: string, updates: Partial<Omit<Personnel, 'id'>>) => void;
  removePersonnel: (id: string) => void;
  
  // Bulk operations
  setPersonnel: (personnel: Personnel[]) => void;
  clearPersonnel: () => void;
  
  // Query helpers
  getPersonnelById: (id: string) => Personnel | undefined;
  getActivePersonnel: (date?: Date) => Personnel[];
  getEmployees: () => Personnel[];
  getContractors: () => Personnel[];
  
  // Cost calculations
  getMonthlyCost: (year: number, month: number, prorate?: boolean) => MonthlyAggregateCost;
  getAnnualCosts: (year: number, prorate?: boolean) => MonthlyAggregateCost[];
  getTotalAnnualCost: (year: number, prorate?: boolean) => number;
}

export const useGnaStore = create<GnaState>((set, get) => ({
  // Initial state
  personnel: [],
  
  // Add new personnel, returns the generated ID
  addPersonnel: (person) => {
    const id = generateId();
    const newPerson: Personnel = { ...person, id };
    set((state) => ({
      personnel: [...state.personnel, newPerson],
    }));
    return id;
  },
  
  // Update existing personnel
  updatePersonnel: (id, updates) => {
    set((state) => ({
      personnel: state.personnel.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  
  // Remove personnel by ID
  removePersonnel: (id) => {
    set((state) => ({
      personnel: state.personnel.filter((p) => p.id !== id),
    }));
  },
  
  // Replace all personnel
  setPersonnel: (personnel) => set({ personnel }),
  
  // Clear all personnel
  clearPersonnel: () => set({ personnel: [] }),
  
  // Get personnel by ID
  getPersonnelById: (id) => {
    return get().personnel.find((p) => p.id === id);
  },
  
  // Get active personnel as of a date (defaults to now)
  getActivePersonnel: (date = new Date()) => {
    return get().personnel.filter((p) => {
      if (p.startDate > date) return false;
      if (p.endDate && p.endDate < date) return false;
      return true;
    });
  },
  
  // Get all employees
  getEmployees: () => {
    return get().personnel.filter((p) => p.type === 'employee');
  },
  
  // Get all contractors
  getContractors: () => {
    return get().personnel.filter((p) => p.type === 'contractor');
  },
  
  // Get monthly cost aggregate
  getMonthlyCost: (year, month, prorate = true) => {
    return calculateMonthlyAggregate(get().personnel, year, month, prorate);
  },
  
  // Get all monthly costs for a year
  getAnnualCosts: (year, prorate = true) => {
    return calculateAnnualCost(get().personnel, year, prorate);
  },
  
  // Get total annual cost
  getTotalAnnualCost: (year, prorate = true) => {
    const annualCosts = calculateAnnualCost(get().personnel, year, prorate);
    return sumAnnualCost(annualCosts);
  },
}));
