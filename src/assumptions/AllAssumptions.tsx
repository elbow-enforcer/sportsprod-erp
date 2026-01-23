/**
 * Consolidated Assumptions Page
 * All assumptions on one page, vertically oriented, printable/exportable
 */

import { useAssumptionsStore } from '../stores/assumptionsStore';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: 'currency' | 'percent' | 'number' | 'multiplier';
  min?: number;
  max?: number;
  step?: number;
}

function InputField({ label, value, onChange, type = 'number', min, max, step = 1 }: InputFieldProps) {
  const displayValue = type === 'percent' ? value * 100 : value;
  const prefix = type === 'currency' ? '$' : '';
  const suffix = type === 'percent' ? '%' : type === 'multiplier' ? 'x' : '';
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
        <input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value) || 0;
            onChange(type === 'percent' ? newValue / 100 : newValue);
          }}
          min={min}
          max={max}
          step={type === 'percent' ? 0.1 : step}
          className="w-24 text-right px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent print:border-none print:bg-transparent"
        />
        {suffix && <span className="text-gray-500 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:shadow-none print:border-gray-300">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

export function AllAssumptions() {
  const revenue = useAssumptionsStore((s) => s.revenue);
  const cogs = useAssumptionsStore((s) => s.cogs);
  const marketing = useAssumptionsStore((s) => s.marketing);
  const gna = useAssumptionsStore((s) => s.gna);
  const capital = useAssumptionsStore((s) => s.capital);
  const corporate = useAssumptionsStore((s) => s.corporate);
  const exit = useAssumptionsStore((s) => s.exit);
  const lastModified = useAssumptionsStore((s) => s.lastModified);
  
  const updateRevenue = useAssumptionsStore((s) => s.updateRevenue);
  const updateCOGS = useAssumptionsStore((s) => s.updateCOGS);
  const updateMarketing = useAssumptionsStore((s) => s.updateMarketing);
  const updateGNA = useAssumptionsStore((s) => s.updateGNA);
  const updateCapital = useAssumptionsStore((s) => s.updateCapital);
  const updateCorporate = useAssumptionsStore((s) => s.updateCorporate);
  const updateExit = useAssumptionsStore((s) => s.updateExit);
  const exportAsJSON = useAssumptionsStore((s) => s.exportAsJSON);
  const exportAsCSV = useAssumptionsStore((s) => s.exportAsCSV);
  const resetToDefaults = useAssumptionsStore((s) => s.resetToDefaults);

  const handleExportJSON = () => {
    const json = exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assumptions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assumptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Model Assumptions</h2>
          <p className="text-sm text-gray-500">
            Last modified: {new Date(lastModified).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            📊 CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            📄 JSON
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">Elbow Enforcer - Financial Model Assumptions</h1>
        <p className="text-gray-600">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Assumptions Grid - 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
        
        {/* Revenue */}
        <Section title="Revenue" icon="💰">
          <InputField
            label="Price per Unit"
            value={revenue.pricePerUnit}
            onChange={(v) => updateRevenue({ pricePerUnit: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="Annual Price Increase"
            value={revenue.annualPriceIncrease}
            onChange={(v) => updateRevenue({ annualPriceIncrease: v })}
            type="percent"
          />
          <InputField
            label="Discount Rate"
            value={revenue.discountRate}
            onChange={(v) => updateRevenue({ discountRate: v })}
            type="percent"
          />
        </Section>

        {/* COGS */}
        <Section title="Cost of Goods Sold" icon="📦">
          <InputField
            label="Unit Cost"
            value={cogs.unitCost}
            onChange={(v) => updateCOGS({ unitCost: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="Cost Reduction/Year"
            value={cogs.costReductionPerYear}
            onChange={(v) => updateCOGS({ costReductionPerYear: v })}
            type="percent"
          />
          <InputField
            label="Shipping per Unit"
            value={cogs.shippingPerUnit}
            onChange={(v) => updateCOGS({ shippingPerUnit: v })}
            type="currency"
            min={0}
          />
        </Section>

        {/* Marketing */}
        <Section title="Marketing" icon="📣">
          <InputField
            label="Base Budget"
            value={marketing.baseBudget}
            onChange={(v) => updateMarketing({ baseBudget: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="% of Revenue"
            value={marketing.percentOfRevenue}
            onChange={(v) => updateMarketing({ percentOfRevenue: v })}
            type="percent"
          />
          <InputField
            label="Target CAC"
            value={marketing.cacTarget}
            onChange={(v) => updateMarketing({ cacTarget: v })}
            type="currency"
            min={0}
          />
        </Section>

        {/* G&A */}
        <Section title="General & Administrative" icon="🏢">
          <InputField
            label="Base Headcount"
            value={gna.baseHeadcount}
            onChange={(v) => updateGNA({ baseHeadcount: v })}
            type="number"
            min={1}
          />
          <InputField
            label="Average Salary"
            value={gna.avgSalary}
            onChange={(v) => updateGNA({ avgSalary: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="Salary Growth Rate"
            value={gna.salaryGrowthRate}
            onChange={(v) => updateGNA({ salaryGrowthRate: v })}
            type="percent"
          />
          <InputField
            label="Benefits Multiplier"
            value={gna.benefitsMultiplier}
            onChange={(v) => updateGNA({ benefitsMultiplier: v })}
            type="multiplier"
            min={1}
            step={0.1}
          />
          <InputField
            label="Office & Ops"
            value={gna.officeAndOps}
            onChange={(v) => updateGNA({ officeAndOps: v })}
            type="currency"
            min={0}
          />
        </Section>

        {/* Capital */}
        <Section title="Capital" icon="🏦">
          <InputField
            label="Initial Investment"
            value={capital.initialInvestment}
            onChange={(v) => updateCapital({ initialInvestment: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="Working Capital %"
            value={capital.workingCapitalPercent}
            onChange={(v) => updateCapital({ workingCapitalPercent: v })}
            type="percent"
          />
          <InputField
            label="CapEx Year 1"
            value={capital.capexYear1}
            onChange={(v) => updateCapital({ capexYear1: v })}
            type="currency"
            min={0}
          />
          <InputField
            label="CapEx Growth Rate"
            value={capital.capexGrowthRate}
            onChange={(v) => updateCapital({ capexGrowthRate: v })}
            type="percent"
          />
        </Section>

        {/* Corporate */}
        <Section title="Corporate / Valuation" icon="📊">
          <InputField
            label="Tax Rate"
            value={corporate.taxRate}
            onChange={(v) => updateCorporate({ taxRate: v })}
            type="percent"
          />
          <InputField
            label="Discount Rate (WACC)"
            value={corporate.discountRate}
            onChange={(v) => updateCorporate({ discountRate: v })}
            type="percent"
          />
          <InputField
            label="Terminal Growth Rate"
            value={corporate.terminalGrowthRate}
            onChange={(v) => updateCorporate({ terminalGrowthRate: v })}
            type="percent"
          />
          <InputField
            label="Projection Years"
            value={corporate.projectionYears}
            onChange={(v) => updateCorporate({ projectionYears: v })}
            type="number"
            min={5}
            max={20}
          />
        </Section>

        {/* Exit */}
        <Section title="Exit / Terminal Value" icon="🚀">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <label className="text-sm text-gray-700">Valuation Method</label>
            <select
              value={exit.method}
              onChange={(e) => updateExit({ method: e.target.value as 'gordon' | 'exitMultiple' })}
              className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 print:border-none"
            >
              <option value="gordon">Gordon Growth</option>
              <option value="exitMultiple">Exit Multiple</option>
            </select>
          </div>
          <InputField
            label="EBITDA Multiple"
            value={exit.exitEbitdaMultiple}
            onChange={(v) => updateExit({ exitEbitdaMultiple: v })}
            type="multiplier"
            min={1}
            max={20}
            step={0.5}
          />
          <InputField
            label="Revenue Multiple"
            value={exit.exitRevenueMultiple}
            onChange={(v) => updateExit({ exitRevenueMultiple: v })}
            type="multiplier"
            min={0.5}
            max={10}
            step={0.5}
          />
          <InputField
            label="Exit Year"
            value={exit.exitYear}
            onChange={(v) => updateExit({ exitYear: v })}
            type="number"
            min={1}
            max={20}
          />
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <label className="text-sm text-gray-700">Use EBITDA Multiple</label>
            <input
              type="checkbox"
              checked={exit.useEbitdaMultiple}
              onChange={(e) => updateExit({ useEbitdaMultiple: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </Section>
      </div>

      {/* Summary Table for Print */}
      <div className="hidden print:block mt-8">
        <h2 className="text-lg font-bold mb-4">Summary</h2>
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Parameter</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-300 px-3 py-1">Revenue</td><td className="border border-gray-300 px-3 py-1">Price per Unit</td><td className="border border-gray-300 px-3 py-1 text-right">{formatCurrency(revenue.pricePerUnit)}</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1">COGS</td><td className="border border-gray-300 px-3 py-1">Unit Cost</td><td className="border border-gray-300 px-3 py-1 text-right">{formatCurrency(cogs.unitCost)}</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1">Marketing</td><td className="border border-gray-300 px-3 py-1">CAC Target</td><td className="border border-gray-300 px-3 py-1 text-right">{formatCurrency(marketing.cacTarget)}</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1">Corporate</td><td className="border border-gray-300 px-3 py-1">Discount Rate</td><td className="border border-gray-300 px-3 py-1 text-right">{formatPercent(corporate.discountRate)}</td></tr>
            <tr><td className="border border-gray-300 px-3 py-1">Exit</td><td className="border border-gray-300 px-3 py-1">EBITDA Multiple</td><td className="border border-gray-300 px-3 py-1 text-right">{exit.exitEbitdaMultiple}x</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
