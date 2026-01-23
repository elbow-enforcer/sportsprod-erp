import { useState, useCallback, useEffect, useRef } from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import type {
  RevenueAssumptions,
  COGSAssumptions,
  MarketingAssumptions,
  GNAAssumptions,
  CapitalAssumptions,
  CorporateAssumptions,
} from '../models/assumptions';

type TabId = 'revenue' | 'cogs' | 'marketing' | 'gna' | 'capital' | 'corporate';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'cogs', label: 'COGS', icon: '🏭' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'gna', label: 'G&A', icon: '🏢' },
  { id: 'capital', label: 'Capital', icon: '🏦' },
  { id: 'corporate', label: 'Corporate', icon: '📊' },
];

interface FieldConfig {
  key: string;
  label: string;
  tooltip: string;
  type: 'currency' | 'percent' | 'number';
  min?: number;
  max?: number;
  step?: number;
}

const revenueFields: FieldConfig[] = [
  { key: 'pricePerUnit', label: 'Price per Unit', tooltip: 'Base selling price for each product unit', type: 'currency', min: 0 },
  { key: 'annualPriceIncrease', label: 'Annual Price Increase', tooltip: 'Year-over-year price increase percentage', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'discountRate', label: 'Discount Rate', tooltip: 'Average discount applied (returns, promotions)', type: 'percent', min: 0, max: 1, step: 0.01 },
];

const cogsFields: FieldConfig[] = [
  { key: 'unitCost', label: 'Unit Cost', tooltip: 'Direct cost to produce one unit', type: 'currency', min: 0 },
  { key: 'costReductionPerYear', label: 'Annual Cost Reduction', tooltip: 'Expected cost reduction from scale economies', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'shippingPerUnit', label: 'Shipping per Unit', tooltip: 'Average shipping cost per unit sold', type: 'currency', min: 0 },
];

const marketingFields: FieldConfig[] = [
  { key: 'baseBudget', label: 'Base Budget', tooltip: 'Fixed annual marketing budget', type: 'currency', min: 0 },
  { key: 'percentOfRevenue', label: '% of Revenue', tooltip: 'Variable marketing spend as percentage of revenue', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'cacTarget', label: 'CAC Target', tooltip: 'Target customer acquisition cost', type: 'currency', min: 0 },
];

const gnaFields: FieldConfig[] = [
  { key: 'baseHeadcount', label: 'Base Headcount', tooltip: 'Initial number of employees', type: 'number', min: 1, step: 1 },
  { key: 'avgSalary', label: 'Average Salary', tooltip: 'Average annual salary per employee', type: 'currency', min: 0 },
  { key: 'salaryGrowthRate', label: 'Salary Growth Rate', tooltip: 'Annual salary increase percentage', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'benefitsMultiplier', label: 'Benefits Multiplier', tooltip: 'Total cost multiplier for benefits (1.3 = 30% benefits)', type: 'number', min: 1, max: 2, step: 0.05 },
  { key: 'officeAndOps', label: 'Office & Operations', tooltip: 'Annual office and operational costs', type: 'currency', min: 0 },
];

const capitalFields: FieldConfig[] = [
  { key: 'initialInvestment', label: 'Initial Investment', tooltip: 'Upfront capital required to start', type: 'currency', min: 0 },
  { key: 'workingCapitalPercent', label: 'Working Capital %', tooltip: 'Working capital as percentage of revenue', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'capexYear1', label: 'Year 1 CapEx', tooltip: 'Capital expenditure in first year', type: 'currency', min: 0 },
  { key: 'capexGrowthRate', label: 'CapEx Growth Rate', tooltip: 'Annual growth rate for capital expenditure', type: 'percent', min: 0, max: 1, step: 0.01 },
  // Historical/Startup Capital (Year 0)
  { key: 'startupYear', label: 'Startup Year', tooltip: 'Year 0 - Pre-revenue startup period', type: 'number', min: 2020, max: 2030, step: 1 },
  { key: 'startupExpenses', label: 'Startup Expenses', tooltip: 'Pre-revenue startup costs (legal, R&D, prototyping)', type: 'currency', min: 0 },
  { key: 'investorCapital', label: 'Investor Capital', tooltip: 'Total capital raised from investors', type: 'currency', min: 0 },
  { key: 'firstManufacturingOrder', label: 'First Mfg Order', tooltip: 'Initial inventory/manufacturing purchase', type: 'currency', min: 0 },
];

const corporateFields: FieldConfig[] = [
  { key: 'taxRate', label: 'Tax Rate', tooltip: 'Effective corporate tax rate', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'discountRate', label: 'Discount Rate (WACC)', tooltip: 'Weighted average cost of capital for DCF', type: 'percent', min: 0, max: 1, step: 0.01 },
  { key: 'terminalGrowthRate', label: 'Terminal Growth Rate', tooltip: 'Long-term growth rate for terminal value', type: 'percent', min: 0, max: 0.1, step: 0.005 },
  { key: 'projectionYears', label: 'Projection Years', tooltip: 'Number of years to project', type: 'number', min: 1, max: 20, step: 1 },
];

// Input field component with tooltip
function InputField({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: number;
  onChange: (key: string, value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(
    config.type === 'percent' ? (value * 100).toString() : value.toString()
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop changes (e.g., on reset)
  useEffect(() => {
    setLocalValue(config.type === 'percent' ? (value * 100).toString() : value.toString());
  }, [value, config.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue)) {
      const finalValue = config.type === 'percent' ? numValue / 100 : numValue;
      onChange(config.key, finalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const displayPrefix = config.type === 'currency' ? '$' : '';
  const displaySuffix = config.type === 'percent' ? '%' : '';

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          {config.label}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </label>
        {showTooltip && (
          <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
            {config.tooltip}
          </div>
        )}
      </div>
      <div className="relative">
        {displayPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {displayPrefix}
          </span>
        )}
        <input
          ref={inputRef}
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={config.min !== undefined ? (config.type === 'percent' ? config.min * 100 : config.min) : undefined}
          max={config.max !== undefined ? (config.type === 'percent' ? config.max * 100 : config.max) : undefined}
          step={config.step !== undefined ? (config.type === 'percent' ? config.step * 100 : config.step) : undefined}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
            displayPrefix ? 'pl-7' : ''
          } ${displaySuffix ? 'pr-8' : ''}`}
        />
        {displaySuffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {displaySuffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Section card component
function SectionCard({
  title,
  fields,
  values,
  onChange,
  onReset,
}: {
  title: string;
  fields: FieldConfig[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Reset to Default
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <InputField
            key={field.key}
            config={field}
            value={values[field.key] as number}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

export function Assumptions() {
  const [activeTab, setActiveTab] = useState<TabId>('revenue');
  const {
    revenue,
    cogs,
    marketing,
    gna,
    capital,
    corporate,
    version,
    lastModified,
    updateRevenue,
    updateCOGS,
    updateMarketing,
    updateGNA,
    updateCapital,
    updateCorporate,
    resetRevenue,
    resetCOGS,
    resetMarketing,
    resetGNA,
    resetCapital,
    resetCorporate,
    resetToDefaults,
    exportAsJSON,
  } = useAssumptionsStore();

  const handleExport = useCallback(() => {
    const json = exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assumptions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportAsJSON]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'revenue':
        return (
          <SectionCard
            title="Revenue Assumptions"
            fields={revenueFields}
            values={revenue as unknown as Record<string, number>}
            onChange={(key, value) => updateRevenue({ [key]: value } as Partial<RevenueAssumptions>)}
            onReset={resetRevenue}
          />
        );
      case 'cogs':
        return (
          <SectionCard
            title="Cost of Goods Sold (COGS)"
            fields={cogsFields}
            values={cogs as unknown as Record<string, number>}
            onChange={(key, value) => updateCOGS({ [key]: value } as Partial<COGSAssumptions>)}
            onReset={resetCOGS}
          />
        );
      case 'marketing':
        return (
          <SectionCard
            title="Marketing Assumptions"
            fields={marketingFields}
            values={marketing as unknown as Record<string, number>}
            onChange={(key, value) => updateMarketing({ [key]: value } as Partial<MarketingAssumptions>)}
            onReset={resetMarketing}
          />
        );
      case 'gna':
        return (
          <SectionCard
            title="General & Administrative (G&A)"
            fields={gnaFields}
            values={gna as unknown as Record<string, number>}
            onChange={(key, value) => updateGNA({ [key]: value } as Partial<GNAAssumptions>)}
            onReset={resetGNA}
          />
        );
      case 'capital':
        return (
          <SectionCard
            title="Capital Requirements"
            fields={capitalFields}
            values={capital as unknown as Record<string, number>}
            onChange={(key, value) => updateCapital({ [key]: value } as Partial<CapitalAssumptions>)}
            onReset={resetCapital}
          />
        );
      case 'corporate':
        return (
          <SectionCard
            title="Corporate / Valuation"
            fields={corporateFields}
            values={corporate as unknown as Record<string, number>}
            onChange={(key, value) => updateCorporate({ [key]: value } as Partial<CorporateAssumptions>)}
            onReset={resetCorporate}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Model Assumptions</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {version}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Last modified: {formatDate(lastModified)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset All to Defaults
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Assumptions
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-gray-50">
          {renderTabContent()}
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">About Assumptions</h4>
            <p className="text-sm text-blue-700 mt-1">
              These assumptions drive all financial projections, DCF valuations, and scenario analyses. 
              Changes are auto-saved and will be reflected across all models. Export your assumptions 
              to share with stakeholders or create backups before making significant changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
