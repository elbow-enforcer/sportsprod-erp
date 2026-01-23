/**
 * Budget Allocation Config
 * Simple component for configuring marketing budget by channel
 */

import { useState } from 'react';
import { useMarketingStore } from '../stores/marketingStore';

export function BudgetAllocationConfig() {
  const {
    totalBudget,
    setTotalBudget,
    channels,
    getChannelBudgets,
    setChannelBudget,
  } = useMarketingStore();

  const [editingTotal, setEditingTotal] = useState(false);
  const [tempTotal, setTempTotal] = useState(totalBudget.toString());

  const channelBudgets = getChannelBudgets();
  const activeChannels = channels.filter((ch) => ch.isActive);
  const allocatedTotal = channelBudgets.reduce((sum, cb) => sum + cb.budget, 0);
  const remaining = totalBudget - allocatedTotal;

  const handleTotalSave = () => {
    const value = parseFloat(tempTotal) || 0;
    setTotalBudget(value);
    setEditingTotal(false);
  };

  const handleBudgetChange = (channelId: string, value: string) => {
    const budget = parseFloat(value) || 0;
    setChannelBudget(channelId, budget);
  };

  const categoryGroups = activeChannels.reduce((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = [];
    acc[ch.category].push(ch);
    return acc;
  }, {} as Record<string, typeof activeChannels>);

  const categoryLabels: Record<string, string> = {
    digital: '💻 Digital',
    field: '🎪 Field',
    influencer: '⭐ Influencer',
    content: '📝 Content',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Budget Allocation</h2>
        <p className="text-gray-500 mt-1">Configure marketing budget by channel</p>
      </div>

      {/* Total Budget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Marketing Budget</h3>
            <p className="text-sm text-gray-500">Monthly budget across all channels</p>
          </div>
          {editingTotal ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={tempTotal}
                onChange={(e) => setTempTotal(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleTotalSave}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTotal(totalBudget.toString());
                setEditingTotal(true);
              }}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600"
            >
              ${totalBudget.toLocaleString()}
            </button>
          )}
        </div>

        {/* Allocation Summary */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            Allocated: ${allocatedTotal.toLocaleString()}
          </div>
          <div className={`px-3 py-1 rounded-full ${remaining >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            Remaining: ${remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Channel Budgets by Category */}
      {Object.entries(categoryGroups).map(([category, categoryChannels]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {categoryLabels[category] || category}
          </h3>
          <div className="space-y-3">
            {categoryChannels.map((channel) => {
              const budget = channelBudgets.find((cb) => cb.channel === channel.id);
              return (
                <div key={channel.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{channel.name}</p>
                    <p className="text-sm text-gray-500">{channel.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={budget?.budget || 0}
                        onChange={(e) => handleBudgetChange(channel.id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">
                      {(budget?.percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
