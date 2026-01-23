import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LaunchDateSettings {
  launchDate: string | null; // ISO date string
  preorderEnabled: boolean;
  preorderStartDate: string | null;
  preorderEndDate: string | null;
  launchDateNotes: string;
}

interface PreorderActions {
  setLaunchDate: (date: string | null) => void;
  setPreorderEnabled: (enabled: boolean) => void;
  setPreorderStartDate: (date: string | null) => void;
  setPreorderEndDate: (date: string | null) => void;
  setLaunchDateNotes: (notes: string) => void;
  resetToDefaults: () => void;
}

type PreorderStore = LaunchDateSettings & PreorderActions;

const DEFAULT_SETTINGS: LaunchDateSettings = {
  launchDate: null,
  preorderEnabled: false,
  preorderStartDate: null,
  preorderEndDate: null,
  launchDateNotes: '',
};

export const usePreorderStore = create<PreorderStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setLaunchDate: (launchDate) =>
        set({ launchDate }),

      setPreorderEnabled: (preorderEnabled) =>
        set({ preorderEnabled }),

      setPreorderStartDate: (preorderStartDate) =>
        set({ preorderStartDate }),

      setPreorderEndDate: (preorderEndDate) =>
        set({ preorderEndDate }),

      setLaunchDateNotes: (launchDateNotes) =>
        set({ launchDateNotes }),

      resetToDefaults: () =>
        set(DEFAULT_SETTINGS),
    }),
    {
      name: 'sportsprod-preorder',
    }
  )
);

// Helper functions
export function getDaysUntilLaunch(launchDate: string | null): number | null {
  if (!launchDate) return null;
  // Parse date string as local date (YYYY-MM-DD)
  const [year, month, day] = launchDate.split('-').map(Number);
  const launch = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = launch.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getWeeksUntilLaunch(launchDate: string | null): number | null {
  const days = getDaysUntilLaunch(launchDate);
  if (days === null) return null;
  return Math.floor(days / 7);
}

export function getLaunchStatus(launchDate: string | null): 'not-set' | 'past' | 'today' | 'upcoming' | 'imminent' {
  if (!launchDate) return 'not-set';
  const days = getDaysUntilLaunch(launchDate);
  if (days === null) return 'not-set';
  if (days < 0) return 'past';
  if (days === 0) return 'today';
  if (days <= 7) return 'imminent';
  return 'upcoming';
}

export function formatLaunchDate(launchDate: string | null): string {
  if (!launchDate) return 'Not set';
  // Parse date string as local date (YYYY-MM-DD)
  const [year, month, day] = launchDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
