/**
 * Assumption Version History Store
 * Tracks snapshots of assumptions over time for audit trail and comparison
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AllAssumptions } from '../models/assumptions';
import { useAssumptionsStore } from './assumptionsStore';

export interface AssumptionVersion {
  id: string;
  timestamp: string;
  assumptions: AllAssumptions;
  note?: string;
  author?: string;
}

export interface AssumptionDiff {
  path: string;
  label: string;
  oldValue: unknown;
  newValue: unknown;
  category: string;
}

interface AssumptionHistoryState {
  versions: AssumptionVersion[];
  maxVersions: number;
}

interface AssumptionHistoryActions {
  saveVersion: (note?: string, author?: string) => string;
  deleteVersion: (id: string) => void;
  clearHistory: () => void;
  getVersion: (id: string) => AssumptionVersion | undefined;
  compareVersions: (id1: string, id2: string) => AssumptionDiff[];
  compareWithCurrent: (id: string) => AssumptionDiff[];
  loadVersion: (id: string) => void;
}

type AssumptionHistoryStore = AssumptionHistoryState & AssumptionHistoryActions;

// Generate unique ID
const generateId = () => `ver_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Deep comparison utility
function deepDiff(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  path: string = '',
  category: string = ''
): AssumptionDiff[] {
  const diffs: AssumptionDiff[] = [];

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Skip metadata fields
    if (key === 'lastModified' || key === 'version') continue;

    // Determine category from top-level key
    const currentCategory = category || key;

    if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
      diffs.push(...deepDiff(
        val1 as Record<string, unknown>,
        val2 as Record<string, unknown>,
        currentPath,
        currentCategory
      ));
    } else if (val1 !== val2) {
      diffs.push({
        path: currentPath,
        label: formatLabel(key),
        oldValue: val1,
        newValue: val2,
        category: formatLabel(currentCategory),
      });
    }
  }

  return diffs;
}

// Format camelCase to readable labels
function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    revenue: 'Revenue',
    cogs: 'COGS',
    marketing: 'Marketing',
    gna: 'G&A',
    capital: 'Capital',
    corporate: 'Corporate',
    exit: 'Exit',
    pricePerUnit: 'Price per Unit',
    annualPriceIncrease: 'Annual Price Increase',
    discountRate: 'Discount Rate',
    unitCost: 'Unit Cost',
    costReductionPerYear: 'Cost Reduction/Year',
    shippingPerUnit: 'Shipping per Unit',
    baseBudget: 'Base Budget',
    percentOfRevenue: '% of Revenue',
    cacTarget: 'Target CAC',
    baseHeadcount: 'Base Headcount',
    avgSalary: 'Average Salary',
    salaryGrowthRate: 'Salary Growth Rate',
    benefitsMultiplier: 'Benefits Multiplier',
    officeAndOps: 'Office & Ops',
    insurance: 'Insurance',
    initialInvestment: 'Initial Investment',
    workingCapitalPercent: 'Working Capital %',
    capexYear1: 'CapEx Year 1',
    capexGrowthRate: 'CapEx Growth Rate',
    entityType: 'Entity Type',
    modelingMode: 'Modeling Mode',
    taxRate: 'Tax Rate',
    terminalGrowthRate: 'Terminal Growth Rate',
    inflationRate: 'Inflation Rate',
    projectionYears: 'Projection Years',
    effectiveDate: 'Effective Date',
    investmentLockInDate: 'Investment Lock-in Date',
    method: 'Valuation Method',
    exitEbitdaMultiple: 'EBITDA Multiple',
    exitRevenueMultiple: 'Revenue Multiple',
    exitYear: 'Exit Year',
    useEbitdaMultiple: 'Use EBITDA Multiple',
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

export const useAssumptionHistoryStore = create<AssumptionHistoryStore>()(
  persist(
    (set, get) => ({
      versions: [],
      maxVersions: 50,

      saveVersion: (note?: string, author?: string) => {
        const assumptionsState = useAssumptionsStore.getState();
        const id = generateId();
        
        // Extract just the assumption data (not the actions)
        const assumptions: AllAssumptions = {
          revenue: assumptionsState.revenue,
          cogs: assumptionsState.cogs,
          marketing: assumptionsState.marketing,
          gna: assumptionsState.gna,
          capital: assumptionsState.capital,
          corporate: assumptionsState.corporate,
          exit: assumptionsState.exit,
          version: assumptionsState.version,
          lastModified: assumptionsState.lastModified,
        };

        const version: AssumptionVersion = {
          id,
          timestamp: new Date().toISOString(),
          assumptions,
          note,
          author,
        };

        set((state) => {
          const newVersions = [version, ...state.versions];
          // Keep only maxVersions
          if (newVersions.length > state.maxVersions) {
            newVersions.pop();
          }
          return { versions: newVersions };
        });

        return id;
      },

      deleteVersion: (id: string) => {
        set((state) => ({
          versions: state.versions.filter((v) => v.id !== id),
        }));
      },

      clearHistory: () => {
        set({ versions: [] });
      },

      getVersion: (id: string) => {
        return get().versions.find((v) => v.id === id);
      },

      compareVersions: (id1: string, id2: string) => {
        const v1 = get().getVersion(id1);
        const v2 = get().getVersion(id2);
        
        if (!v1 || !v2) return [];

        return deepDiff(
          v1.assumptions as unknown as Record<string, unknown>,
          v2.assumptions as unknown as Record<string, unknown>
        );
      },

      compareWithCurrent: (id: string) => {
        const version = get().getVersion(id);
        if (!version) return [];

        const assumptionsState = useAssumptionsStore.getState();
        const current: AllAssumptions = {
          revenue: assumptionsState.revenue,
          cogs: assumptionsState.cogs,
          marketing: assumptionsState.marketing,
          gna: assumptionsState.gna,
          capital: assumptionsState.capital,
          corporate: assumptionsState.corporate,
          exit: assumptionsState.exit,
          version: assumptionsState.version,
          lastModified: assumptionsState.lastModified,
        };

        return deepDiff(
          version.assumptions as unknown as Record<string, unknown>,
          current as unknown as Record<string, unknown>
        );
      },

      loadVersion: (id: string) => {
        const version = get().getVersion(id);
        if (!version) return;

        const {
          updateRevenue,
          updateCOGS,
          updateMarketing,
          updateGNA,
          updateCapital,
          updateCorporate,
          updateExit,
        } = useAssumptionsStore.getState();

        updateRevenue(version.assumptions.revenue);
        updateCOGS(version.assumptions.cogs);
        updateMarketing(version.assumptions.marketing);
        updateGNA(version.assumptions.gna);
        updateCapital(version.assumptions.capital);
        updateCorporate(version.assumptions.corporate);
        updateExit(version.assumptions.exit);
      },
    }),
    {
      name: 'sportsprod-assumption-history',
    }
  )
);
