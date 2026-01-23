/**
 * Investor Cohorts Page
 * Manage investor groups, view returns per cohort
 */

import { useState } from 'react';
import { 
  useInvestorCohortsStore, 
  type InvestorCohort, 
  type InstrumentType,
  calculateCohortReturns 
} from '../stores/investorCohortsStore';
import { useAssumptionsStore } from '../stores/assumptionsStore';
import { useDCFValuation } from '../hooks';

const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  common_equity: 'Common Equity',
  preferred_equity: 'Preferred Equity',
  convertible_note: 'Convertible Note',
  safe: 'SAFE',
  revenue_based: 'Revenue-Based Loan',
  term_loan: 'Term Loan',
};

const INSTRUMENT_ICONS: Record<InstrumentType, string> = {
  common_equity: '📈',
  preferred_equity: '⭐',
  convertible_note: '📝',
  safe: '🔒',
  revenue_based: '💵',
  term_loan: '🏦',
};

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

interface CohortFormData {
  name: string;
  description: string;
  investmentDate: string;
  investmentAmount: number;
  instrumentType: InstrumentType;
  isHistorical: boolean;
  // Equity terms
  ownershipPercent: number;
  liquidationPreference: number;
  participating: boolean;
  // Convertible terms
  valuationCap: number;
  discountRate: number;
  interestRate: number;
  maturityYears: number;
  // Revenue-based terms
  repaymentMultiple: number;
  revenueSharePercent: number;
  repaymentCap: number;
  // Loan terms
  loanInterestRate: number;
  termYears: number;
}

const DEFAULT_FORM: CohortFormData = {
  name: '',
  description: '',
  investmentDate: new Date().toISOString().split('T')[0],
  investmentAmount: 100000,
  instrumentType: 'convertible_note',
  isHistorical: false,
  ownershipPercent: 0.05,
  liquidationPreference: 1,
  participating: false,
  valuationCap: 2000000,
  discountRate: 0.20,
  interestRate: 0.06,
  maturityYears: 2,
  repaymentMultiple: 1.5,
  revenueSharePercent: 0.05,
  repaymentCap: 200000,
  loanInterestRate: 0.08,
  termYears: 5,
};

function CohortCard({ cohort, onEdit, onDelete, exitValue, exitDate }: { 
  cohort: InvestorCohort; 
  onEdit: () => void;
  onDelete: () => void;
  exitValue: number;
  exitDate: string;
}) {
  // Calculate returns based on live DCF valuation
  const returns = calculateCohortReturns(cohort, exitValue, exitDate, 1_000_000);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${cohort.isHistorical ? 'border-green-200' : 'border-blue-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{INSTRUMENT_ICONS[cohort.instrumentType]}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
            <p className="text-xs text-gray-500">{INSTRUMENT_LABELS[cohort.instrumentType]}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${cohort.isHistorical ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {cohort.isHistorical ? 'Historical' : 'Projected'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">Investment</p>
          <p className="font-medium">{formatCurrency(cohort.investmentAmount)}</p>
        </div>
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-medium">{new Date(cohort.investmentDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Instrument-specific details */}
      <div className="text-xs text-gray-600 mb-3 bg-gray-50 rounded p-2">
        {cohort.instrumentType === 'convertible_note' && cohort.convertibleTerms && (
          <>
            Cap: {formatCurrency(cohort.convertibleTerms.valuationCap)} • 
            Discount: {formatPercent(cohort.convertibleTerms.discountRate)} • 
            Interest: {formatPercent(cohort.convertibleTerms.interestRate)}
          </>
        )}
        {cohort.instrumentType === 'safe' && cohort.safeTerms && (
          <>
            Cap: {formatCurrency(cohort.safeTerms.valuationCap)} • 
            Discount: {formatPercent(cohort.safeTerms.discountRate)}
          </>
        )}
        {(cohort.instrumentType === 'common_equity' || cohort.instrumentType === 'preferred_equity') && cohort.equityTerms && (
          <>
            Ownership: {formatPercent(cohort.equityTerms.ownershipPercent)}
            {cohort.equityTerms.liquidationPreference > 0 && ` • ${cohort.equityTerms.liquidationPreference}x Liq Pref`}
          </>
        )}
        {cohort.instrumentType === 'revenue_based' && cohort.revenueBasedTerms && (
          <>
            {cohort.revenueBasedTerms.repaymentMultiple}x Multiple • 
            {formatPercent(cohort.revenueBasedTerms.revenueSharePercent)} Rev Share
          </>
        )}
        {cohort.instrumentType === 'term_loan' && cohort.loanTerms && (
          <>
            {formatPercent(cohort.loanTerms.interestRate)} Interest • 
            {cohort.loanTerms.termYears} Year Term
          </>
        )}
      </div>

      {/* Estimated Returns */}
      <div className="border-t pt-3 mt-2">
        <p className="text-xs text-gray-500 mb-2">Estimated Returns (at {formatCurrency(exitValue)} exit)</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 rounded p-2">
            <p className="text-xs text-green-600">IRR</p>
            <p className="font-bold text-green-700">{formatPercent(returns.irr)}</p>
          </div>
          <div className="bg-blue-50 rounded p-2">
            <p className="text-xs text-blue-600">Multiple</p>
            <p className="font-bold text-blue-700">{returns.multiple.toFixed(2)}x</p>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <p className="text-xs text-purple-600">NPV</p>
            <p className="font-bold text-purple-700">{formatCurrency(returns.npv)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onEdit}
          className="flex-1 text-sm py-1.5 bg-gray-100 hover:bg-gray-200 rounded"
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-sm py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

function CohortForm({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData?: CohortFormData;
  onSave: (data: CohortFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CohortFormData>(initialData || DEFAULT_FORM);

  const updateForm = (updates: Partial<CohortFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Investor Cohort' : 'Add Investor Cohort'}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder="e.g., 2024 Seed Round"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Date</label>
          <input
            type="date"
            value={form.investmentDate}
            onChange={(e) => updateForm({ investmentDate: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount</label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">$</span>
            <input
              type="number"
              value={form.investmentAmount}
              onChange={(e) => updateForm({ investmentAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Type</label>
          <select
            value={form.instrumentType}
            onChange={(e) => updateForm({ instrumentType: e.target.value as InstrumentType })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INSTRUMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isHistorical}
            onChange={(e) => updateForm({ isHistorical: e.target.checked })}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">Historical investment (already made)</span>
        </label>
      </div>

      {/* Instrument-specific fields */}
      {(form.instrumentType === 'common_equity' || form.instrumentType === 'preferred_equity') && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Equity Terms</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ownership %</label>
              <input
                type="number"
                value={form.ownershipPercent * 100}
                onChange={(e) => updateForm({ ownershipPercent: (parseFloat(e.target.value) || 0) / 100 })}
                step="0.1"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            {form.instrumentType === 'preferred_equity' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Liquidation Pref (x)</label>
                  <input
                    type="number"
                    value={form.liquidationPreference}
                    onChange={(e) => updateForm({ liquidationPreference: parseFloat(e.target.value) || 1 })}
                    step="0.5"
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.participating}
                      onChange={(e) => updateForm({ participating: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700">Participating</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {form.instrumentType === 'convertible_note' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Convertible Note Terms</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Valuation Cap</label>
              <input
                type="number"
                value={form.valuationCap}
                onChange={(e) => updateForm({ valuationCap: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Discount Rate (%)</label>
              <input
                type="number"
                value={form.discountRate * 100}
                onChange={(e) => updateForm({ discountRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                value={form.interestRate * 100}
                onChange={(e) => updateForm({ interestRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Maturity (years)</label>
              <input
                type="number"
                value={form.maturityYears}
                onChange={(e) => updateForm({ maturityYears: parseFloat(e.target.value) || 2 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {form.instrumentType === 'safe' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">SAFE Terms</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Valuation Cap</label>
              <input
                type="number"
                value={form.valuationCap}
                onChange={(e) => updateForm({ valuationCap: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Discount Rate (%)</label>
              <input
                type="number"
                value={form.discountRate * 100}
                onChange={(e) => updateForm({ discountRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {form.instrumentType === 'revenue_based' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue-Based Loan Terms</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Repayment Multiple (x)</label>
              <input
                type="number"
                value={form.repaymentMultiple}
                onChange={(e) => updateForm({ repaymentMultiple: parseFloat(e.target.value) || 1.5 })}
                step="0.1"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Revenue Share (%)</label>
              <input
                type="number"
                value={form.revenueSharePercent * 100}
                onChange={(e) => updateForm({ revenueSharePercent: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Repayment Cap</label>
              <input
                type="number"
                value={form.repaymentCap}
                onChange={(e) => updateForm({ repaymentCap: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {form.instrumentType === 'term_loan' && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Term Loan Terms</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                value={form.loanInterestRate * 100}
                onChange={(e) => updateForm({ loanInterestRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Term (years)</label>
              <input
                type="number"
                value={form.termYears}
                onChange={(e) => updateForm({ termYears: parseFloat(e.target.value) || 5 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {initialData ? 'Update Cohort' : 'Add Cohort'}
        </button>
      </div>
    </div>
  );
}

export function InvestorCohorts() {
  const [showForm, setShowForm] = useState(false);
  const [editingCohort, setEditingCohort] = useState<InvestorCohort | null>(null);
  
  // Get live DCF valuation
  const dcf = useDCFValuation();
  
  const cohorts = useInvestorCohortsStore((s) => s.cohorts);
  const addCohort = useInvestorCohortsStore((s) => s.addCohort);
  const updateCohort = useInvestorCohortsStore((s) => s.updateCohort);
  const deleteCohort = useInvestorCohortsStore((s) => s.deleteCohort);

  const historicalCohorts = cohorts.filter(c => c.isHistorical);
  const futureCohorts = cohorts.filter(c => !c.isHistorical);

  const totalHistoricalInvestment = historicalCohorts.reduce((sum, c) => sum + c.investmentAmount, 0);
  const totalFutureInvestment = futureCohorts.reduce((sum, c) => sum + c.investmentAmount, 0);

  const handleSave = (data: CohortFormData) => {
    const cohortData = {
      name: data.name,
      description: data.description,
      investmentDate: data.investmentDate,
      investmentAmount: data.investmentAmount,
      instrumentType: data.instrumentType,
      isHistorical: data.isHistorical,
      equityTerms: (data.instrumentType === 'common_equity' || data.instrumentType === 'preferred_equity') ? {
        ownershipPercent: data.ownershipPercent,
        liquidationPreference: data.liquidationPreference,
        participating: data.participating,
      } : undefined,
      convertibleTerms: data.instrumentType === 'convertible_note' ? {
        valuationCap: data.valuationCap,
        discountRate: data.discountRate,
        interestRate: data.interestRate,
        maturityYears: data.maturityYears,
      } : undefined,
      safeTerms: data.instrumentType === 'safe' ? {
        valuationCap: data.valuationCap,
        discountRate: data.discountRate,
        proRata: false,
      } : undefined,
      revenueBasedTerms: data.instrumentType === 'revenue_based' ? {
        repaymentMultiple: data.repaymentMultiple,
        revenueSharePercent: data.revenueSharePercent,
        repaymentCap: data.repaymentCap,
      } : undefined,
      loanTerms: data.instrumentType === 'term_loan' ? {
        interestRate: data.loanInterestRate,
        termYears: data.termYears,
        amortizationYears: data.termYears,
        paymentFrequency: 'monthly' as const,
      } : undefined,
    };

    if (editingCohort) {
      updateCohort(editingCohort.id, cohortData);
    } else {
      addCohort(cohortData);
    }

    setShowForm(false);
    setEditingCohort(null);
  };

  const handleEdit = (cohort: InvestorCohort) => {
    setEditingCohort(cohort);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this investor cohort?')) {
      deleteCohort(id);
    }
  };

  const cohortToFormData = (cohort: InvestorCohort): CohortFormData => ({
    name: cohort.name,
    description: cohort.description || '',
    investmentDate: cohort.investmentDate,
    investmentAmount: cohort.investmentAmount,
    instrumentType: cohort.instrumentType,
    isHistorical: cohort.isHistorical,
    ownershipPercent: cohort.equityTerms?.ownershipPercent || 0.05,
    liquidationPreference: cohort.equityTerms?.liquidationPreference || 1,
    participating: cohort.equityTerms?.participating || false,
    valuationCap: cohort.convertibleTerms?.valuationCap || cohort.safeTerms?.valuationCap || 2000000,
    discountRate: cohort.convertibleTerms?.discountRate || cohort.safeTerms?.discountRate || 0.20,
    interestRate: cohort.convertibleTerms?.interestRate || 0.06,
    maturityYears: cohort.convertibleTerms?.maturityYears || 2,
    repaymentMultiple: cohort.revenueBasedTerms?.repaymentMultiple || 1.5,
    revenueSharePercent: cohort.revenueBasedTerms?.revenueSharePercent || 0.05,
    repaymentCap: cohort.revenueBasedTerms?.repaymentCap || 200000,
    loanInterestRate: cohort.loanTerms?.interestRate || 0.08,
    termYears: cohort.loanTerms?.termYears || 5,
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-700">Projected Exit Value</p>
          <p className="text-2xl font-bold text-purple-800">{formatCurrency(dcf.enterpriseValue)}</p>
          <p className="text-xs text-purple-600">Year {dcf.exitYear} Enterprise Value</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total Cohorts</p>
          <p className="text-2xl font-bold text-gray-900">{cohorts.length}</p>
          <p className="text-xs text-gray-500">{historicalCohorts.length} historical, {futureCohorts.length} projected</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-700">Historical Investment</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(totalHistoricalInvestment)}</p>
          <p className="text-xs text-green-600">{historicalCohorts.length} cohorts</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-700">Projected Investment</p>
          <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalFutureInvestment)}</p>
          <p className="text-xs text-blue-600">{futureCohorts.length} cohorts</p>
        </div>
      </div>

      {/* Add Cohort Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Investor Cohort
        </button>
      )}

      {/* Form */}
      {showForm && (
        <CohortForm
          initialData={editingCohort ? cohortToFormData(editingCohort) : undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCohort(null);
          }}
        />
      )}

      {/* Historical Cohorts */}
      {historicalCohorts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-green-600">●</span> Historical Investments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalCohorts.map(cohort => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onEdit={() => handleEdit(cohort)}
                onDelete={() => handleDelete(cohort.id)}
                exitValue={dcf.enterpriseValue}
                exitDate={dcf.exitDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Future Cohorts */}
      {futureCohorts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-blue-600">●</span> Projected Investments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {futureCohorts.map(cohort => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onEdit={() => handleEdit(cohort)}
                onDelete={() => handleDelete(cohort.id)}
                exitValue={dcf.enterpriseValue}
                exitDate={dcf.exitDate}
              />
            ))}
          </div>
        </div>
      )}

      {cohorts.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No investor cohorts yet</p>
          <p className="text-sm">Add your first cohort to track investor returns</p>
        </div>
      )}
    </div>
  );
}
