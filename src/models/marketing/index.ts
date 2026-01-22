/**
 * Marketing Module
 * Channel-based budget allocation, CAC, and ROAS tracking
 */

// Types
export type {
  ChannelCategory,
  MarketingChannel,
  MarketingSpend,
  ConversionData,
  RevenueAttribution,
  CACResult,
  ROASResult,
  BudgetAllocation,
  MarketingPerformance,
} from './types';

// Channels
export {
  digitalChannels,
  fieldChannels,
  influencerChannels,
  contentChannels,
  allChannels,
  getChannelsByCategory,
  getChannelById,
  getActiveChannels,
  defaultBudgetAllocation,
} from './channels';

// CAC calculations
export {
  calculateChannelCAC,
  calculateBlendedCAC,
  calculateCACTrend,
  calculateCACByChannel,
  calculateCACPayback,
  calculateLTVtoCACRatio,
  evaluateCACHealth,
} from './cac';

// ROAS calculations
export {
  calculateChannelROAS,
  calculateBlendedROAS,
  calculateROASTrend,
  calculateROASByChannel,
  evaluateROASHealth,
  calculateBreakEvenROAS,
  calculateIncrementalROAS,
  rankChannelsByROAS,
} from './roas';
