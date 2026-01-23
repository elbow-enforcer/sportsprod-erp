import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AllAssumptions,
  RevenueAssumptions,
  COGSAssumptions,
  MarketingAssumptions,
  GNAAssumptions,
  CapitalAssumptions,
  CorporateAssumptions,
  ExitAssumptions,
} from '../models/assumptions';
import { DEFAULT_ASSUMPTIONS } from '../models/assumptions';

interface AssumptionsActions {
  updateRevenue: (updates: Partial<RevenueAssumptions>) => void;
  updateCOGS: (updates: Partial<COGSAssumptions>) => void;
  updateMarketing: (updates: Partial<MarketingAssumptions>) => void;
  updateGNA: (updates: Partial<GNAAssumptions>) => void;
  updateCapital: (updates: Partial<CapitalAssumptions>) => void;
  updateCorporate: (updates: Partial<CorporateAssumptions>) => void;
  updateExit: (updates: Partial<ExitAssumptions>) => void;
  updateDiscountTiers: (updates: Partial<DiscountTiersAssumptions>) => void;
  updateTierDiscount: (accountType: AccountType, discount: number) => void;
  toggleWholesaler: () => void;
  resetRevenue: () => void;
  resetCOGS: () => void;
  resetMarketing: () => void;
  resetGNA: () => void;
  resetCapital: () => void;
  resetCorporate: () => void;
  resetExit: () => void;
  resetDiscountTiers: () => void;
  resetToDefaults: () => void;
  getDiscountForAccountType: (accountType: AccountType) => number;
  exportAsJSON: () => string;
  exportAsCSV: () => string;
}

type AssumptionsStore = AllAssumptions & AssumptionsActions;

export const useAssumptionsStore = create<AssumptionsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ASSUMPTIONS,

      updateRevenue: (updates) =>
        set((state) => ({
          revenue: { ...state.revenue, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCOGS: (updates) =>
        set((state) => ({
          cogs: { ...state.cogs, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateMarketing: (updates) =>
        set((state) => ({
          marketing: { ...state.marketing, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateGNA: (updates) =>
        set((state) => ({
          gna: { ...state.gna, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCapital: (updates) =>
        set((state) => ({
          capital: { ...state.capital, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateCorporate: (updates) =>
        set((state) => ({
          corporate: { ...state.corporate, ...updates },
          lastModified: new Date().toISOString(),
        })),

      resetRevenue: () =>
        set((state) => ({
          revenue: DEFAULT_ASSUMPTIONS.revenue,
          lastModified: new Date().toISOString(),
        })),

      resetCOGS: () =>
        set((state) => ({
          cogs: DEFAULT_ASSUMPTIONS.cogs,
          lastModified: new Date().toISOString(),
        })),

      resetMarketing: () =>
        set((state) => ({
          marketing: DEFAULT_ASSUMPTIONS.marketing,
          lastModified: new Date().toISOString(),
        })),

      resetGNA: () =>
        set((state) => ({
          gna: DEFAULT_ASSUMPTIONS.gna,
          lastModified: new Date().toISOString(),
        })),

      resetCapital: () =>
        set((state) => ({
          capital: DEFAULT_ASSUMPTIONS.capital,
          lastModified: new Date().toISOString(),
        })),

      resetCorporate: () =>
        set((state) => ({
          corporate: DEFAULT_ASSUMPTIONS.corporate,
          lastModified: new Date().toISOString(),
        })),

      updateExit: (updates) =>
        set((state) => ({
          exit: { ...state.exit, ...updates },
          lastModified: new Date().toISOString(),
        })),

      resetExit: () =>
        set((state) => ({
          exit: DEFAULT_ASSUMPTIONS.exit,
          lastModified: new Date().toISOString(),
        })),

      updateDiscountTiers: (updates) =>
        set((state) => ({
          discountTiers: { ...state.discountTiers, ...updates },
          lastModified: new Date().toISOString(),
        })),

      updateTierDiscount: (accountType, discount) =>
        set((state) => ({
          discountTiers: {
            ...state.discountTiers,
            tiers: state.discountTiers.tiers.map((tier) =>
              tier.accountType === accountType
                ? { ...tier, discount: Math.max(0, Math.min(100, discount)) }
                : tier
            ),
          },
          lastModified: new Date().toISOString(),
        })),

      toggleWholesaler: () =>
        set((state) => {
          const newEnabled = !state.discountTiers.wholesalerEnabled;
          return {
            discountTiers: {
              ...state.discountTiers,
              wholesalerEnabled: newEnabled,
              tiers: state.discountTiers.tiers.map((tier) =>
                tier.accountType === 'wholesaler'
                  ? { ...tier, enabled: newEnabled }
                  : tier
              ),
            },
            lastModified: new Date().toISOString(),
          };
        }),

      resetDiscountTiers: () =>
        set({
          discountTiers: DEFAULT_ASSUMPTIONS.discountTiers,
          lastModified: new Date().toISOString(),
        }),

      getDiscountForAccountType: (accountType) => {
        const state = get();
        const tier = state.discountTiers.tiers.find((t) => t.accountType === accountType);
        if (!tier || !tier.enabled) return 0;
        if (accountType === 'wholesaler' && !state.discountTiers.wholesalerEnabled) return 0;
        return tier.discount;
      },

      resetToDefaults: () =>
        set({
          ...DEFAULT_ASSUMPTIONS,
          lastModified: new Date().toISOString(),
        }),

      exportAsJSON: () => {
        const state = get();
        const exportData = {
          revenue: state.revenue,
          cogs: state.cogs,
          marketing: state.marketing,
          gna: state.gna,
          capital: state.capital,
          corporate: state.corporate,
          exit: state.exit,
          version: state.version,
          lastModified: state.lastModified,
        };
        return JSON.stringify(exportData, null, 2);
      },

      exportAsCSV: () => {
        const state = get();
        const rows: string[] = ['Category,Parameter,Value'];
        
        // Revenue
        rows.push(`Revenue,Price per Unit,$${state.revenue.pricePerUnit}`);
        rows.push(`Revenue,Annual Price Increase,${(state.revenue.annualPriceIncrease * 100).toFixed(1)}%`);
        rows.push(`Revenue,Discount Rate,${(state.revenue.discountRate * 100).toFixed(1)}%`);
        
        // COGS
        rows.push(`COGS,Unit Cost (Total),$${state.cogs.unitCost}`);
        rows.push(`COGS,Cost Reduction/Year,${(state.cogs.costReductionPerYear * 100).toFixed(1)}%`);
        rows.push(`COGS,Shipping per Unit,$${state.cogs.shippingPerUnit}`);
        rows.push(`COGS,Manufacturing Cost,$${state.cogs.manufacturingCost}`);
        rows.push(`COGS,Freight Cost,$${state.cogs.freightCost}`);
        rows.push(`COGS,Packaging Cost,$${state.cogs.packagingCost}`);
        rows.push(`COGS,Import Duties,$${state.cogs.dutiesCost}`);
        
        // Marketing
        rows.push(`Marketing,Base Budget,$${state.marketing.baseBudget}`);
        rows.push(`Marketing,% of Revenue,${(state.marketing.percentOfRevenue * 100).toFixed(1)}%`);
        rows.push(`Marketing,CAC Target,$${state.marketing.cacTarget}`);
        
        // G&A
        rows.push(`G&A,Base Headcount,${state.gna.baseHeadcount}`);
        rows.push(`G&A,Avg Salary,$${state.gna.avgSalary}`);
        rows.push(`G&A,Salary Growth Rate,${(state.gna.salaryGrowthRate * 100).toFixed(1)}%`);
        rows.push(`G&A,Benefits Multiplier,${state.gna.benefitsMultiplier}x`);
        rows.push(`G&A,Office & Ops,$${state.gna.officeAndOps}`);
        rows.push(`G&A,Insurance,$${state.gna.insurance}`);
        
        // Capital
        rows.push(`Capital,Initial Investment,$${state.capital.initialInvestment}`);
        rows.push(`Capital,Working Capital %,${(state.capital.workingCapitalPercent * 100).toFixed(1)}%`);
        rows.push(`Capital,CapEx Year 1,$${state.capital.capexYear1}`);
        rows.push(`Capital,CapEx Growth Rate,${(state.capital.capexGrowthRate * 100).toFixed(1)}%`);
        rows.push(`Capital,Startup Year,${state.capital.startupYear || 2024}`);
        rows.push(`Capital,Startup Expenses,$${state.capital.startupExpenses || 150000}`);
        rows.push(`Capital,Investor Capital,$${state.capital.investorCapital || 250000}`);
        rows.push(`Capital,First Mfg Order,$${state.capital.firstManufacturingOrder || 200000}`);
        
        // Corporate
        rows.push(`Corporate,Entity Type,${state.corporate.entityType}`);
        rows.push(`Corporate,Modeling Mode,${state.corporate.modelingMode}`);
        rows.push(`Corporate,Tax Rate,${(state.corporate.taxRate * 100).toFixed(1)}%`);
        rows.push(`Corporate,Discount Rate (WACC),${(state.corporate.discountRate * 100).toFixed(1)}%`);
        rows.push(`Corporate,Terminal Growth Rate,${(state.corporate.terminalGrowthRate * 100).toFixed(1)}%`);
        rows.push(`Corporate,Inflation Rate,${(state.corporate.inflationRate * 100).toFixed(1)}%`);
        rows.push(`Corporate,Projection Years,${state.corporate.projectionYears}`);
        
        // Exit
        rows.push(`Exit,Method,${state.exit.method}`);
        rows.push(`Exit,EBITDA Multiple,${state.exit.exitEbitdaMultiple}x`);
        rows.push(`Exit,Revenue Multiple,${state.exit.exitRevenueMultiple}x`);
        rows.push(`Exit,Exit Year,Year ${state.exit.exitYear}`);
        
        return rows.join('\n');
      },
    }),
    {
      name: 'sportsprod-assumptions',
    }
  )
);
