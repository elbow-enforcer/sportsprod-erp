/**
 * Assumption Timeline Component
 * Visualizes version history with diff comparison capabilities
 */

import { useState, useMemo } from 'react';
import { useAssumptionHistoryStore, type AssumptionVersion, type AssumptionDiff } from '../stores/assumptionHistoryStore';

interface TimelineProps {
  onVersionLoad?: (id: string) => void;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    // Check if it looks like a percentage (0-1 range)
    if (value >= 0 && value <= 1 && value !== Math.floor(value)) {
      return `${(value * 100).toFixed(1)}%`;
    }
    // Check if it's currency-like (larger numbers)
    if (value >= 100) {
      return `$${value.toLocaleString()}`;
    }
    // Otherwise just format as number
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

function DiffBadge({ diff }: { diff: AssumptionDiff }) {
  return (
    <div className="flex items-center gap-2 text-xs py-1 px-2 bg-gray-50 rounded">
      <span className="text-gray-600">{diff.category}</span>
      <span className="text-gray-400">→</span>
      <span className="font-medium text-gray-800">{diff.label}</span>
      <span className="text-red-500 line-through">{formatValue(diff.oldValue)}</span>
      <span className="text-gray-400">→</span>
      <span className="text-green-600 font-medium">{formatValue(diff.newValue)}</span>
    </div>
  );
}

function VersionCard({
  version,
  isFirst,
  isSelected,
  isComparing,
  onSelect,
  onCompare,
  onLoad,
  onDelete,
  diffs,
}: {
  version: AssumptionVersion;
  isFirst: boolean;
  isSelected: boolean;
  isComparing: boolean;
  onSelect: () => void;
  onCompare: () => void;
  onLoad: () => void;
  onDelete: () => void;
  diffs?: AssumptionDiff[];
}) {
  const [showAllDiffs, setShowAllDiffs] = useState(false);
  const displayDiffs = showAllDiffs ? diffs : diffs?.slice(0, 3);
  const hasMoreDiffs = diffs && diffs.length > 3;

  return (
    <div
      className={`relative pl-8 pb-6 ${!isFirst ? 'pt-0' : ''}`}
    >
      {/* Timeline line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Timeline dot */}
      <div
        className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 ${
          isSelected
            ? 'bg-blue-500 border-blue-500'
            : isComparing
            ? 'bg-purple-500 border-purple-500'
            : 'bg-white border-gray-300'
        }`}
      />

      {/* Card */}
      <div
        className={`bg-white rounded-lg border p-3 shadow-sm transition-all ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-100'
            : isComparing
            ? 'border-purple-500 ring-2 ring-purple-100'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {formatDate(version.timestamp)}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(version.timestamp)}
              </span>
              {isFirst && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Latest
                </span>
              )}
            </div>
            {version.note && (
              <p className="text-sm text-gray-600 mt-1">{version.note}</p>
            )}
            {version.author && (
              <p className="text-xs text-gray-400 mt-0.5">by {version.author}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onSelect}
              className={`p-1.5 rounded text-xs ${
                isSelected
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={isSelected ? 'Selected for comparison' : 'Select for comparison'}
            >
              {isSelected ? '✓' : '○'}
            </button>
            <button
              onClick={onCompare}
              className={`p-1.5 rounded text-xs ${
                isComparing
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Compare with selected"
            >
              ⟷
            </button>
            <button
              onClick={onLoad}
              className="p-1.5 rounded text-xs hover:bg-green-100 text-gray-500 hover:text-green-700"
              title="Load this version"
            >
              ↩️
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded text-xs hover:bg-red-100 text-gray-500 hover:text-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Diffs from previous or comparison */}
        {diffs && diffs.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Changes ({diffs.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {displayDiffs?.map((diff, i) => (
                <DiffBadge key={i} diff={diff} />
              ))}
            </div>
            {hasMoreDiffs && (
              <button
                onClick={() => setShowAllDiffs(!showAllDiffs)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showAllDiffs ? 'Show less' : `+ ${diffs.length - 3} more changes`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssumptionTimeline({ onVersionLoad }: TimelineProps) {
  const [saveNote, setSaveNote] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);

  const versions = useAssumptionHistoryStore((s) => s.versions);
  const saveVersion = useAssumptionHistoryStore((s) => s.saveVersion);
  const deleteVersion = useAssumptionHistoryStore((s) => s.deleteVersion);
  const loadVersion = useAssumptionHistoryStore((s) => s.loadVersion);
  const compareVersions = useAssumptionHistoryStore((s) => s.compareVersions);
  const compareWithCurrent = useAssumptionHistoryStore((s) => s.compareWithCurrent);

  // Calculate diffs for display
  const versionDiffs = useMemo(() => {
    const diffs: Record<string, AssumptionDiff[]> = {};
    
    // If comparing two versions
    if (selectedId && compareId) {
      diffs[compareId] = compareVersions(selectedId, compareId);
    } else {
      // Show diff from previous version for each
      for (let i = 0; i < versions.length - 1; i++) {
        const currentVersion = versions[i];
        const previousVersion = versions[i + 1];
        diffs[currentVersion.id] = compareVersions(previousVersion.id, currentVersion.id);
      }
    }
    
    return diffs;
  }, [versions, selectedId, compareId, compareVersions]);

  const handleSave = () => {
    saveVersion(saveNote || undefined);
    setSaveNote('');
    setShowSaveDialog(false);
  };

  const handleLoad = (id: string) => {
    if (confirm('Load this version? Current changes will be overwritten.')) {
      loadVersion(id);
      onVersionLoad?.(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this version snapshot?')) {
      deleteVersion(id);
      if (selectedId === id) setSelectedId(null);
      if (compareId === id) setCompareId(null);
    }
  };

  const handleSelect = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
      setCompareId(null);
    } else {
      setSelectedId(id);
      setCompareId(null);
    }
  };

  const handleCompare = (id: string) => {
    if (!selectedId || selectedId === id) return;
    setCompareId(compareId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            📜 Version History
          </h3>
          <p className="text-xs text-gray-500">
            {versions.length} snapshot{versions.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        {showSaveDialog ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={saveNote}
              onChange={(e) => setSaveNote(e.target.value)}
              placeholder="Optional note..."
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5"
          >
            📸 Save Snapshot
          </button>
        )}
      </div>

      {/* Comparison hint */}
      {selectedId && !compareId && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          💡 Click ⟷ on another version to compare
        </div>
      )}

      {/* Comparison summary */}
      {selectedId && compareId && (
        <div className="mb-3 p-2 bg-purple-50 rounded text-xs text-purple-700 flex items-center justify-between">
          <span>
            Comparing versions • {versionDiffs[compareId]?.length || 0} differences
          </span>
          <button
            onClick={() => {
              setSelectedId(null);
              setCompareId(null);
            }}
            className="text-purple-800 hover:text-purple-900 underline"
          >
            Clear comparison
          </button>
        </div>
      )}

      {/* Timeline */}
      {versions.length > 0 ? (
        <div className="max-h-96 overflow-y-auto pr-2">
          {versions.map((version, index) => (
            <VersionCard
              key={version.id}
              version={version}
              isFirst={index === 0}
              isSelected={selectedId === version.id}
              isComparing={compareId === version.id}
              onSelect={() => handleSelect(version.id)}
              onCompare={() => handleCompare(version.id)}
              onLoad={() => handleLoad(version.id)}
              onDelete={() => handleDelete(version.id)}
              diffs={
                compareId === version.id
                  ? versionDiffs[version.id]
                  : !compareId
                  ? versionDiffs[version.id]
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">📭</p>
          <p className="text-sm">No snapshots yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Save a snapshot to track assumption changes over time
          </p>
        </div>
      )}

      {/* Quick comparison with current */}
      {versions.length > 0 && !compareId && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              const diffs = compareWithCurrent(versions[0].id);
              if (diffs.length === 0) {
                alert('No changes since last snapshot');
              } else {
                alert(`${diffs.length} change(s) since last snapshot:\n${diffs.map(d => `• ${d.label}: ${formatValue(d.oldValue)} → ${formatValue(d.newValue)}`).join('\n')}`);
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            🔍 Compare current with latest snapshot
          </button>
        </div>
      )}
    </div>
  );
}
