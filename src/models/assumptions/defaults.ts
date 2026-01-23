import type {
  AllAssumptions,
  RevenueAssumptions,
  COGSAssumptions,
  MarketingAssumptions,
  GNAAssumptions,
  CapitalAssumptions,
  CorporateAssumptions,
} from './types';

export const DEFAULT_REVENUE: RevenueAssumptions = {
  pricePerUnit: 1000,
  annualPriceIncrease: 0,
  discountRate: 0.05,
};

export const DEFAULT_COGS: COGSAssumptions = {
  unitCost: 200,
  costReductionPerYear: 0.05,
  shippingPerUnit: 25,
};

export const DEFAULT_MARKETING: MarketingAssumptions = {
  baseBudget: 30000,
  percentOfRevenue: 0.15,
  cacTarget: 100,
};

export const DEFAULT_GNA: GNAAssumptions = {
  baseHeadcount: 3,
  avgSalary: 80000,
  salaryGrowthRate: 0.03,
  benefitsMultiplier: 1.3,
  officeAndOps: 50000,
};

export const DEFAULT_CAPITAL: CapitalAssumptions = {
  initialInvestment: 200000,
  workingCapitalPercent: 0.10,
  capexYear1: 50000,
  capexGrowthRate: 0.10,
};

export const DEFAULT_CORPORATE: CorporateAssumptions = {
  taxRate: 0.25,
  discountRate: 0.12,
  terminalGrowthRate: 0.03,
  projectionYears: 10,
};

export const DEFAULT_ASSUMPTIONS: AllAssumptions = {
  revenue: DEFAULT_REVENUE,
  cogs: DEFAULT_COGS,
  marketing: DEFAULT_MARKETING,
  gna: DEFAULT_GNA,
  capital: DEFAULT_CAPITAL,
  corporate: DEFAULT_CORPORATE,
  version: 'v1.0',
  lastModified: new Date().toISOString(),
};
