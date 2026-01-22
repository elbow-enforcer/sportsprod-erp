/**
 * Marketing Channels
 * Predefined channel definitions for SportsProd ERP
 */

import type { MarketingChannel, ChannelCategory } from './types';

/**
 * Digital marketing channels
 */
export const digitalChannels: MarketingChannel[] = [
  {
    id: 'paid-search',
    name: 'Paid Search (SEM)',
    category: 'digital',
    description: 'Google Ads, Bing Ads, and other search engine marketing',
    isActive: true,
  },
  {
    id: 'paid-social',
    name: 'Paid Social',
    category: 'digital',
    description: 'Facebook, Instagram, LinkedIn, TikTok ads',
    isActive: true,
  },
  {
    id: 'display',
    name: 'Display Advertising',
    category: 'digital',
    description: 'Programmatic display, retargeting campaigns',
    isActive: true,
  },
  {
    id: 'email',
    name: 'Email Marketing',
    category: 'digital',
    description: 'Email campaigns, newsletters, drip sequences',
    isActive: true,
  },
  {
    id: 'seo',
    name: 'SEO',
    category: 'digital',
    description: 'Organic search optimization efforts',
    isActive: true,
  },
];

/**
 * Field marketing channels
 */
export const fieldChannels: MarketingChannel[] = [
  {
    id: 'events',
    name: 'Events & Trade Shows',
    category: 'field',
    description: 'Industry conferences, trade shows, sponsored events',
    isActive: true,
  },
  {
    id: 'direct-sales',
    name: 'Direct Sales Outreach',
    category: 'field',
    description: 'In-person demos, sales visits, field reps',
    isActive: true,
  },
  {
    id: 'partnerships',
    name: 'Channel Partnerships',
    category: 'field',
    description: 'Reseller, distributor, and affiliate partnerships',
    isActive: true,
  },
];

/**
 * Influencer marketing channels
 */
export const influencerChannels: MarketingChannel[] = [
  {
    id: 'athlete-endorsements',
    name: 'Athlete Endorsements',
    category: 'influencer',
    description: 'Professional and amateur athlete partnerships',
    isActive: true,
  },
  {
    id: 'coach-ambassadors',
    name: 'Coach Ambassadors',
    category: 'influencer',
    description: 'Coach and trainer ambassador programs',
    isActive: true,
  },
  {
    id: 'social-influencers',
    name: 'Social Media Influencers',
    category: 'influencer',
    description: 'Sports and fitness influencer campaigns',
    isActive: true,
  },
];

/**
 * Content marketing channels
 */
export const contentChannels: MarketingChannel[] = [
  {
    id: 'blog',
    name: 'Blog & Articles',
    category: 'content',
    description: 'Owned media content, thought leadership',
    isActive: true,
  },
  {
    id: 'video',
    name: 'Video Content',
    category: 'content',
    description: 'YouTube, tutorials, product demos',
    isActive: true,
  },
  {
    id: 'podcast',
    name: 'Podcast & Audio',
    category: 'content',
    description: 'Podcast sponsorships and owned audio content',
    isActive: true,
  },
  {
    id: 'webinars',
    name: 'Webinars',
    category: 'content',
    description: 'Educational webinars and online workshops',
    isActive: true,
  },
];

/**
 * All marketing channels combined
 */
export const allChannels: MarketingChannel[] = [
  ...digitalChannels,
  ...fieldChannels,
  ...influencerChannels,
  ...contentChannels,
];

/**
 * Get channels by category
 */
export function getChannelsByCategory(category: ChannelCategory): MarketingChannel[] {
  return allChannels.filter((ch) => ch.category === category);
}

/**
 * Get a channel by ID
 */
export function getChannelById(id: string): MarketingChannel | undefined {
  return allChannels.find((ch) => ch.id === id);
}

/**
 * Get only active channels
 */
export function getActiveChannels(): MarketingChannel[] {
  return allChannels.filter((ch) => ch.isActive);
}

/**
 * Default budget allocation percentages by category
 * Based on typical B2B SaaS marketing mix
 */
export const defaultBudgetAllocation: Record<ChannelCategory, number> = {
  digital: 0.45,
  field: 0.25,
  influencer: 0.15,
  content: 0.15,
};
