# Bids Module

Email ingestion and parsing for manufacturer quotes.

## Purpose

This module allows users to:
1. Import quote emails from manufacturers
2. Automatically parse key data (unit cost, MOQ, lead time, tooling, payment terms)
3. Review and correct parsed data with confidence indicators
4. Track quote status through the procurement workflow

## Related PRD/Issues

- Issue #26: Email ingestion for manufacturer quotes

## Components

### BidList (`BidList.tsx`)
Main list view showing all imported quotes with:
- Status filtering (draft, parsed, reviewed, accepted, rejected, expired)
- Search by supplier/product/email
- Statistics dashboard
- Email import modal

### BidDetail (`BidDetail.tsx`)
Detail/edit view with:
- Editable parsed fields with confidence indicators
- Original email display for reference
- Status management (review, accept, reject)
- Notes and metadata

## Email Parser (`emailParser.ts`)

Regex-based parser that extracts:
- **Unit Cost**: "$1.50", "USD 1.50", "1.50 USD", "unit price: $1.50"
- **MOQ**: "MOQ: 1000", "minimum order: 1,000 units", "min qty 1000"
- **Lead Time**: "lead time: 30 days", "4-6 weeks", "30 day turnaround"
- **Tooling Costs**: "tooling: $5,000", "mold cost: $5000"
- **Payment Terms**: "Net 30", "50% deposit", "T/T 30 days"

Each field includes a confidence score (high/medium/low) based on pattern match quality.

## Store (`store.ts`)

Zustand store managing:
- Quote CRUD operations
- Email import/parsing
- Field-level updates with confidence tracking
- Status transitions
- Filtering and search

## Usage

```tsx
import { BidList, BidDetail, useBidsStore, parseQuoteEmail } from './bids';

// In router
<Route path="/bids" element={<BidList />} />
<Route path="/bids/:id" element={<BidDetail />} />

// Programmatic import
const { importFromEmail } = useBidsStore();
const quote = importFromEmail({
  subject: 'RE: Quote Request',
  body: 'Unit price: $4.50, MOQ: 5000 units...',
  from: 'supplier@example.com',
  receivedAt: new Date().toISOString(),
});

// Direct parsing
const result = parseQuoteEmail(emailData);
console.log(result.quote.unitCost.value); // 4.50
console.log(result.quote.unitCost.confidence); // 'high'
```

## Workflow

1. **Import**: User pastes email into import modal
2. **Parse**: System extracts data with confidence scores
3. **Review**: User corrects any low-confidence or incorrect fields
4. **Accept/Reject**: User makes final decision on quote

## Integration Points

- **Supply Chain Module**: Accepted quotes can be converted to Purchase Orders
- **Supplier Module**: Quotes linked to existing suppliers via `supplierId`
- **Production Module**: Quote data feeds into BOM cost calculations

## Dependencies

- `zustand` - State management
- `react-router-dom` - Routing

## Testing

```bash
npm run test -- src/bids
```
