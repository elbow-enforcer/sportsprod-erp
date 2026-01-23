/**
 * Investor Cohorts Store
 * Track different investor groups, instruments, and returns
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InstrumentType = 
  | 'common_equity'
  | 'preferred_equity'
  | 'convertible_note'
  | 'safe'
  | 'revenue_based'
  | 'term_loan';

export interface ConvertibleNoteTerms {
  valuationCap: number;
  discountRate: number;
  interestRate: number;
  maturityYears: number;
}

export interface SAFETerms {
  valuationCap: number;
  discountRate: number;
  proRata: boolean;
}

export interface RevenueBasedTerms {
  repaymentMultiple: number;  // e.g., 1.5x = repay $150k on $100k investment
  revenueSharePercent: number;  // e.g., 5% of revenue until paid
  repaymentCap: number;  // Maximum repayment amount
}

export interface TermLoanTerms {
  interestRate: number;
  termYears: number;
  amortizationYears: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
}

export interface EquityTerms {
  ownershipPercent: number;
  liquidationPreference: number;  // 1x, 2x, etc.
  participating: boolean;  // Participating preferred
}

export interface InvestorCohort {
  id: string;
  name: string;
  description?: string;
  
  // Investment details
  investmentDate: string;  // ISO date
  investmentAmount: number;
  instrumentType: InstrumentType;
  
  // Terms (varies by instrument)
  equityTerms?: EquityTerms;
  convertibleTerms?: ConvertibleNoteTerms;
  safeTerms?: SAFETerms;
  revenueBasedTerms?: RevenueBasedTerms;
  loanTerms?: TermLoanTerms;
  
  // Calculated returns (updated when model runs)
  calculatedIRR?: number;
  calculatedNPV?: number;
  calculatedMultiple?: number;
  
  // Metadata
  isHistorical: boolean;  // Past investment vs projected
  createdAt: string;
  updatedAt: string;
}

interface InvestorCohortsState {
  cohorts: InvestorCohort[];
}

interface InvestorCohortsActions {
  addCohort: (cohort: Omit<InvestorCohort, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCohort: (id: string, updates: Partial<InvestorCohort>) => void;
  deleteCohort: (id: string) => void;
  getCohort: (id: string) => InvestorCohort | undefined;
  getHistoricalCohorts: () => InvestorCohort[];
  getFutureCohorts: () => InvestorCohort[];
  updateCohortReturns: (id: string, irr: number, npv: number, multiple: number) => void;
}

type InvestorCohortsStore = InvestorCohortsState & InvestorCohortsActions;

function generateId(): string {
  return `cohort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sample historical cohort
const DEFAULT_COHORTS: InvestorCohort[] = [
  {
    id: 'cohort_seed_2024',
    name: '2024 Seed Round',
    description: 'Initial seed investment',
    investmentDate: '2024-01-15',
    investmentAmount: 200000,
    instrumentType: 'convertible_note',
    convertibleTerms: {
      valuationCap: 2000000,
      discountRate: 0.20,
      interestRate: 0.06,
      maturityYears: 2,
    },
    isHistorical: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useInvestorCohortsStore = create<InvestorCohortsStore>()(
  persist(
    (set, get) => ({
      cohorts: DEFAULT_COHORTS,

      addCohort: (cohortData) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newCohort: InvestorCohort = {
          ...cohortData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          cohorts: [...state.cohorts, newCohort],
        }));

        return id;
      },

      updateCohort: (id, updates) => {
        set((state) => ({
          cohorts: state.cohorts.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      deleteCohort: (id) => {
        set((state) => ({
          cohorts: state.cohorts.filter((c) => c.id !== id),
        }));
      },

      getCohort: (id) => {
        return get().cohorts.find((c) => c.id === id);
      },

      getHistoricalCohorts: () => {
        return get().cohorts.filter((c) => c.isHistorical);
      },

      getFutureCohorts: () => {
        return get().cohorts.filter((c) => !c.isHistorical);
      },

      updateCohortReturns: (id, irr, npv, multiple) => {
        set((state) => ({
          cohorts: state.cohorts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  calculatedIRR: irr,
                  calculatedNPV: npv,
                  calculatedMultiple: multiple,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },
    }),
    {
      name: 'sportsprod-investor-cohorts',
    }
  )
);

/**
 * Calculate returns for a specific cohort based on exit assumptions
 */
export function calculateCohortReturns(
  cohort: InvestorCohort,
  exitValue: number,
  exitDate: string,
  totalEquityAtExit: number
): { irr: number; npv: number; multiple: number } {
  const investmentDate = new Date(cohort.investmentDate);
  const exitDateObj = new Date(exitDate);
  const yearsHeld = (exitDateObj.getTime() - investmentDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  let proceeds = 0;
  
  switch (cohort.instrumentType) {
    case 'common_equity':
    case 'preferred_equity':
      // Equity: ownership % × exit value
      const ownership = cohort.equityTerms?.ownershipPercent || 0;
      proceeds = ownership * exitValue;
      break;
      
    case 'convertible_note':
      // Convert at cap or discount, whichever is better
      if (cohort.convertibleTerms) {
        const { valuationCap, discountRate, interestRate, maturityYears } = cohort.convertibleTerms;
        const principalPlusInterest = cohort.investmentAmount * Math.pow(1 + interestRate, Math.min(yearsHeld, maturityYears));
        const capPrice = valuationCap / totalEquityAtExit;
        const discountPrice = exitValue / totalEquityAtExit * (1 - discountRate);
        const conversionPrice = Math.min(capPrice, discountPrice);
        const shares = principalPlusInterest / conversionPrice;
        proceeds = shares * (exitValue / totalEquityAtExit);
      }
      break;
      
    case 'revenue_based':
      // Already repaid through revenue share (simplified)
      if (cohort.revenueBasedTerms) {
        proceeds = Math.min(
          cohort.investmentAmount * cohort.revenueBasedTerms.repaymentMultiple,
          cohort.revenueBasedTerms.repaymentCap
        );
      }
      break;
      
    case 'safe':
      // Similar to convertible, convert at cap or discount
      if (cohort.safeTerms) {
        const { valuationCap, discountRate } = cohort.safeTerms;
        const capOwnership = cohort.investmentAmount / valuationCap;
        const discountOwnership = cohort.investmentAmount / (exitValue * (1 - discountRate));
        const ownership = Math.max(capOwnership, discountOwnership);
        proceeds = ownership * exitValue;
      }
      break;
      
    case 'term_loan':
      // Principal + interest (simplified)
      if (cohort.loanTerms) {
        proceeds = cohort.investmentAmount * Math.pow(1 + cohort.loanTerms.interestRate, Math.min(yearsHeld, cohort.loanTerms.termYears));
      }
      break;
  }
  
  const multiple = proceeds / cohort.investmentAmount;
  const irr = Math.pow(multiple, 1 / yearsHeld) - 1;
  const npv = proceeds / Math.pow(1.12, yearsHeld) - cohort.investmentAmount; // Assume 12% discount
  
  return { irr, npv, multiple };
}
