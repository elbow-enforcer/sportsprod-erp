/**
 * @file store.ts
 * @description Zustand store for QBO import state management
 * @related-issue #25 - QuickBooks actuals import
 */

/* global setTimeout */

import { create } from 'zustand'
import type {
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  ImportJob,
  ImportSchedule,
  QBOAccountMapping,
  QBOConnectionStatus,
} from './types'
import {
  mockProfitAndLossReport,
  mockBalanceSheetReport,
  mockCashFlowReport,
  mockImportJobs,
  mockImportSchedules,
  mockAccountMappings,
} from './mockData'

/* eslint-disable no-unused-vars */
interface QBOStore {
  // Connection
  connectionStatus: QBOConnectionStatus
  setConnectionStatus: (status: QBOConnectionStatus) => void

  // Reports
  profitAndLossReport: ProfitAndLossReport | null
  balanceSheetReport: BalanceSheetReport | null
  cashFlowReport: CashFlowReport | null
  setProfitAndLossReport: (report: ProfitAndLossReport | null) => void
  setBalanceSheetReport: (report: BalanceSheetReport | null) => void
  setCashFlowReport: (report: CashFlowReport | null) => void

  // Import Jobs
  importJobs: ImportJob[]
  addImportJob: (job: ImportJob) => void
  updateImportJob: (id: string, updates: Partial<ImportJob>) => void

  // Schedules
  importSchedules: ImportSchedule[]
  updateSchedule: (id: string, updates: Partial<ImportSchedule>) => void
  addSchedule: (schedule: ImportSchedule) => void

  // Mappings
  accountMappings: QBOAccountMapping[]
  updateMapping: (id: string, category: string | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  activeImport: 'profit_loss' | 'balance_sheet' | 'cash_flow' | null
  setActiveImport: (type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | null) => void
}
/* eslint-enable no-unused-vars */

export const useQBOStore = create<QBOStore>((set) => ({
  // Connection
  connectionStatus: {
    connected: true,
    companyName: 'SportsProd LLC',
    lastSync: '2026-01-22T18:30:00Z',
    tokenExpiry: '2026-02-22T18:30:00Z',
  },
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Reports
  profitAndLossReport: null,
  balanceSheetReport: null,
  cashFlowReport: null,
  setProfitAndLossReport: (report) => set({ profitAndLossReport: report }),
  setBalanceSheetReport: (report) => set({ balanceSheetReport: report }),
  setCashFlowReport: (report) => set({ cashFlowReport: report }),

  // Import Jobs
  importJobs: mockImportJobs,
  addImportJob: (job) =>
    set((state) => ({ importJobs: [job, ...state.importJobs] })),
  updateImportJob: (id, updates) =>
    set((state) => ({
      importJobs: state.importJobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
    })),

  // Schedules
  importSchedules: mockImportSchedules,
  updateSchedule: (id, updates) =>
    set((state) => ({
      importSchedules: state.importSchedules.map((sched) =>
        sched.id === id ? { ...sched, ...updates, updatedAt: new Date().toISOString() } : sched
      ),
    })),
  addSchedule: (schedule) =>
    set((state) => ({ importSchedules: [...state.importSchedules, schedule] })),

  // Mappings
  accountMappings: mockAccountMappings,
  updateMapping: (id, category) =>
    set((state) => ({
      accountMappings: state.accountMappings.map((mapping) =>
        mapping.id === id
          ? {
              ...mapping,
              modelCategory: category as QBOAccountMapping['modelCategory'],
              updatedAt: new Date().toISOString(),
            }
          : mapping
      ),
    })),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  activeImport: null,
  setActiveImport: (type) => set({ activeImport: type }),
}))

// ============================================================================
// SIMULATED API FUNCTIONS
// ============================================================================

export async function fetchProfitAndLoss(
  startDate: string,
  endDate: string
): Promise<ProfitAndLossReport> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))
  
  // In real implementation, this would call the QBO API
  return {
    ...mockProfitAndLossReport,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
  }
}

export async function fetchBalanceSheet(
  asOfDate: string
): Promise<BalanceSheetReport> {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  
  return {
    ...mockBalanceSheetReport,
    asOfDate,
    generatedAt: new Date().toISOString(),
  }
}

export async function fetchCashFlow(
  startDate: string,
  endDate: string
): Promise<CashFlowReport> {
  await new Promise((resolve) => setTimeout(resolve, 1300))
  
  return {
    ...mockCashFlowReport,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
  }
}

export async function importProfitAndLoss(
  startDate: string,
  endDate: string
): Promise<ImportJob> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  
  const job: ImportJob = {
    id: `job-${Date.now()}`,
    type: 'profit_loss',
    status: 'success',
    startDate,
    endDate,
    asOfDate: null,
    recordsImported: 48,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
  
  return job
}

export async function importBalanceSheet(
  asOfDate: string
): Promise<ImportJob> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  
  const job: ImportJob = {
    id: `job-${Date.now()}`,
    type: 'balance_sheet',
    status: 'success',
    startDate: null,
    endDate: null,
    asOfDate,
    recordsImported: 18,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
  
  return job
}

export async function importCashFlow(
  startDate: string,
  endDate: string
): Promise<ImportJob> {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  
  const job: ImportJob = {
    id: `job-${Date.now()}`,
    type: 'cash_flow',
    status: 'success',
    startDate,
    endDate,
    asOfDate: null,
    recordsImported: 11,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
  
  return job
}
