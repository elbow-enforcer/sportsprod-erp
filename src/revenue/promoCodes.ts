export type PromoCode = {
  code: string;
  discountPercent: number;
};

export const promoCodes: PromoCode[] = [
  { code: 'SUMMER10', discountPercent: 10 },
  { code: 'WELCOME20', discountPercent: 20 },
  { code: 'VIP50', discountPercent: 50 },
];
