export type MarketingChannel = 'pt' | 'doctor' | 'influencer' | 'ad' | 'organic';

export type PromoCode = {
  code: string;
  discountPercent: number;
  channel: MarketingChannel;
};

export const promoCodes: PromoCode[] = [
  { code: 'SUMMER10', discountPercent: 10, channel: 'ad' },
  { code: 'WELCOME20', discountPercent: 20, channel: 'organic' },
  { code: 'VIP50', discountPercent: 50, channel: 'influencer' },
  { code: 'PT15', discountPercent: 15, channel: 'pt' },
  { code: 'DRREF25', discountPercent: 25, channel: 'doctor' },
];

/** Get channel for a promo code */
export function getChannelByCode(code: string): MarketingChannel | undefined {
  return promoCodes.find(p => p.code === code)?.channel;
}
