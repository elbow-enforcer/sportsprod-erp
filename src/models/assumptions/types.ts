export interface RevenueAssumptions {
  pricePerUnit: number;          // Default $1,000
  annualPriceIncrease: number;   // Default 0% (or 2-3%)
  discountRate: number;          // Default 5% (returns/discounts)
}

export interface COGSAssumptions {
  unitCost: number;              // Default $200
  costReductionPerYear: number;  // Default 5% (scale economies)
  shippingPerUnit: number;       // Default $25
}

export interface MarketingAssumptions {
  baseBudget: number;            // Default $30,000
  percentOfRevenue: number;      // Default 15%
  cacTarget: number;             // Default $100
}

export interface GNAAssumptions {
  baseHeadcount: number;         // Default 3
  avgSalary: number;             // Default $80,000
  salaryGrowthRate: number;      // Default 3%
  benefitsMultiplier: number;    // Default 1.3 (30% benefits)
  officeAndOps: number;          // Default $50,000
}

export interface CapitalAssumptions {
  initialInvestment: number;     // Default $200,000
  workingCapitalPercent: number; // Default 10% of revenue
  capexYear1: number;            // Default $50,000
  capexGrowthRate: number;       // Default 10%
}

export interface CorporateAssumptions {
  taxRate: number;               // Default 25%
  discountRate: number;          // Default 12% (WACC)
  terminalGrowthRate: number;    // Default 3%
  projectionYears: number;       // Default 6
}

export interface AllAssumptions {
  revenue: RevenueAssumptions;
  cogs: COGSAssumptions;
  marketing: MarketingAssumptions;
  gna: GNAAssumptions;
  capital: CapitalAssumptions;
  corporate: CorporateAssumptions;
  version: string;               // e.g., "v1.0"
  lastModified: string;          // ISO date
}
