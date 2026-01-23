export interface DiscountTiers {
  individual: number;            // Default 0%
  pt: number;                    // Default 7.5%
  doctor: number;                // Default 12.5%
  wholesaler: number;            // Default 20%
}

export interface RevenueAssumptions {
  basePrice: number;             // Default $1,000 (base price for calculations)
  pricePerUnit: number;          // Default $1,000
  annualPriceIncrease: number;   // Default 0% (or 2-3%)
  discountRate: number;          // Default 5% (returns/discounts)
  discountTiers: DiscountTiers;  // Tiered discounts by account type
}

export interface COGSAssumptions {
  unitCost: number;              // Default $200 (total, kept for backwards compatibility)
  costReductionPerYear: number;  // Default 5% (scale economies)
  shippingPerUnit: number;       // Default $25 (outbound to customer)
  
  // Separated COGS line items
  manufacturingCost: number;     // Manufacturing cost per unit (Default $140)
  freightCost: number;           // Overseas freight/transport per unit (Default $35)
  packagingCost: number;         // Box, inserts, materials per unit (Default $15)
  dutiesCost: number;            // Import duties per unit (Default $10)
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
  insurance: number;             // Default $10,000 (GL, D&O, product liability)
}

export interface CapitalAssumptions {
  initialInvestment: number;     // Default $200,000
  workingCapitalPercent: number; // Default 10% of revenue
  capexYear1: number;            // Default $50,000
  capexGrowthRate: number;       // Default 10%
  
  // Historical/Startup Capital (Year 0 - 2024)
  startupYear: number;           // Default 2024 (Year 0)
  startupExpenses: number;       // Pre-revenue startup costs (~$150k)
  investorCapital: number;       // Total investor capital raised ($200-300k)
  firstManufacturingOrder: number; // Initial inventory purchase ($200k)
  
  // Re-tooling
  toolingCost: number;           // Default $50,000
  retoolingYears: number;        // Default 5 years
}

export type EntityType = 'c_corp' | 's_corp' | 'llc' | 'partnership' | 'sole_prop';
export type ModelingMode = 'nominal' | 'real';

export interface CorporateAssumptions {
  entityType: EntityType;        // Default C Corp
  modelingMode: ModelingMode;    // Default nominal
  taxRate: number;               // Default 25%
  discountRate: number;          // Default 12% (WACC)
  terminalGrowthRate: number;    // Default 3% (used in real mode)
  inflationRate: number;         // Default 2.5% (used in real mode)
  projectionYears: number;       // Default 10
  effectiveDate: string;         // ISO date for NPV calculation reference
  investmentLockInDate: string;  // ISO date when investment was locked in
}

export interface ExitAssumptions {
  method: 'gordon' | 'exitMultiple';  // Terminal value method
  exitEbitdaMultiple: number;    // Default 8x (range 4x-12x for scenarios)
  exitRevenueMultiple: number;   // Default 2x (range 1x-3x for scenarios)
  exitYear: number;              // Default = projectionYears (Year 10)
  useEbitdaMultiple: boolean;    // true = EBITDA multiple, false = Revenue multiple
}

export interface AllAssumptions {
  revenue: RevenueAssumptions;
  cogs: COGSAssumptions;
  marketing: MarketingAssumptions;
  gna: GNAAssumptions;
  capital: CapitalAssumptions;
  corporate: CorporateAssumptions;
  exit: ExitAssumptions;
  version: string;               // e.g., "v1.0"
  lastModified: string;          // ISO date
}
