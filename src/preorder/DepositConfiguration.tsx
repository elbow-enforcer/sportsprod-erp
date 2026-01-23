/**
 * @file DepositConfiguration.tsx
 * @description Deposit options component with radio selection for pre-order deposits.
 * @related-prd Issue #20 - Pre-order Deposit Structure Options
 */

import {
  usePreorderStore,
  DEPOSIT_OPTIONS,
  getDepositAmount,
  getDepositPercent,
  type DepositOptionType,
} from '../stores/preorderStore';
import { INDUSTRY_INSIGHTS } from './benchmarkData';

export function DepositConfiguration() {
  const {
    selectedOption,
    customAmount,
    productPrice,
    setDepositOption,
    setCustomAmount,
  } = usePreorderStore();

  const depositAmount = getDepositAmount({ selectedOption, customAmount, productPrice });
  const depositPercent = getDepositPercent({ selectedOption, customAmount, productPrice });

  const handleOptionChange = (option: DepositOptionType) => {
    setDepositOption(option);
    if (option !== 'custom') {
      setCustomAmount(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Deposit Options</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select the deposit structure for pre-orders (Product price: ${productPrice.toLocaleString()})
        </p>
      </div>

      {/* Deposit Options Radio Selection */}
      <div className="space-y-3">
        {/* Full Payment */}
        <label
          className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'full'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="deposit-option"
            value="full"
            checked={selectedOption === 'full'}
            onChange={() => handleOptionChange('full')}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {DEPOSIT_OPTIONS.full.label}
              </span>
              <span className="text-lg font-bold text-green-600">
                ${DEPOSIT_OPTIONS.full.amount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pay the full amount upfront • Secure priority shipping • 100% commitment
            </p>
          </div>
        </label>

        {/* Partial Deposit */}
        <label
          className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'partial'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="deposit-option"
            value="partial"
            checked={selectedOption === 'partial'}
            onChange={() => handleOptionChange('partial')}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {DEPOSIT_OPTIONS.partial.label}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Recommended
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                ${DEPOSIT_OPTIONS.partial.amount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Reserve your unit with $200 deposit • Covers manufacturing costs • Pay remaining ${(productPrice - DEPOSIT_OPTIONS.partial.amount).toLocaleString()} before shipping
            </p>
          </div>
        </label>

        {/* Custom Amount */}
        <label
          className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'custom'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="deposit-option"
            value="custom"
            checked={selectedOption === 'custom'}
            onChange={() => handleOptionChange('custom')}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {DEPOSIT_OPTIONS.custom.label}
              </span>
              {selectedOption === 'custom' && customAmount !== null && (
                <span className="text-lg font-bold text-purple-600">
                  ${customAmount.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Choose your own deposit amount (minimum $50)
            </p>
            {selectedOption === 'custom' && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    min={50}
                    max={productPrice}
                    value={customAmount ?? ''}
                    onChange={(e) => setCustomAmount(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Enter amount"
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {customAmount !== null && (
                    <span className="text-sm text-gray-500">
                      ({Math.round((customAmount / productPrice) * 100)}% of total)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Selected deposit:</span>
          <span className="font-semibold text-gray-900">
            ${depositAmount.toLocaleString()} ({depositPercent}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Remaining balance:</span>
          <span className="font-semibold text-gray-900">
            ${(productPrice - depositAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Kickstarter Benchmark Note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-medium text-amber-900">Kickstarter Hardware Benchmark</h4>
            <p className="text-sm text-amber-800 mt-1">
              Typical hardware crowdfunding campaigns request <strong>20-40% deposits</strong> upfront. 
              Our recommended $200 partial deposit (20%) aligns with industry norms while covering 
              manufacturing costs and maximizing conversion rates.
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              {INDUSTRY_INSIGHTS.kickstarterNorms.points.slice(0, 3).map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositConfiguration;
