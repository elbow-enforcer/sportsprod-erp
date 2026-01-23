import { promoCodes } from './promoCodes';

export function PromoCodeList() {
  return (
    <div>
      <h2>Promo Codes</h2>
      <ul>
        {promoCodes.map((p) => (
          <li key={p.code}>
            {p.code} - {p.discountPercent}% off
          </li>
        ))}
      </ul>
    </div>
  );
}
