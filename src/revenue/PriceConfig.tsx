import React from 'react';
import { useAssumptionsStore } from '../stores/assumptionsStore';

export function PriceConfig() {
  const { revenue, updateRevenue } = useAssumptionsStore();

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateRevenue({ basePrice: value });
  };

  return (
    <div className="price-config">
      <label htmlFor="basePrice">
        Base Price ($)
        <input
          id="basePrice"
          type="number"
          value={revenue.basePrice}
          onChange={handleBasePriceChange}
          min={0}
          step={100}
        />
      </label>
    </div>
  );
}
