# PRD: SportsProd ERP - Financial Model Module

**Version:** 1.0  
**Date:** 2026-01-22  
**Author:** Corey McKeon (via Clawdbot)  
**Status:** Draft

---

## Executive Summary

Build a comprehensive financial model for Elbow Enforcer, a patented sports medicine device company focused on UCL injury prevention and rehabilitation. The model will support:
- Historical actuals tracking (from Jan 2024 inception)
- Forward-looking DCF projections
- Capital raise scenario planning
- Pre-order campaign modeling

---

## Business Context

### Product
- **Device:** Patented elbow protection/rehab halo for UCL injuries
- **Price Point:** ~$1,000/unit
- **Target Market:** Youth baseball → Pro athletes, physical therapists, coaches
- **Founder:** Lee Fiocchi
- **Website:** elbowenforcer.com
- **Social:** @elbowenforcer (Instagram)

### Market Opportunity
- Skyrocketing UCL injuries in baseball (youth + pro)
- Tommy John surgery epidemic
- No current device-based prevention solution at scale
- Comparable: Iron Neck (used for adoption curve modeling)

### Initial Inventory
- First batch: 1,000 units
- Tooling investment: $100-120K
- Unit cost: $96 @ 1K units, $82-85 @ 5K units

---

## Adoption Model

### Methodology
Sigmoid (S-curve) adoption based on Iron Neck's Google Trends + sales trajectory.

**Linear Regression:** `Units = 571.01 × Sigmoid_Value - 695.89`

### Five Scenarios

| Scenario | x0 Shift | k Multiplier | Description |
|----------|----------|--------------|-------------|
| Max | -4 years | 2.0x | Viral adoption |
| Upside | -2 years | 1.2x | Strong reception |
| Base | — | 1.0x | Expected trajectory |
| Downside | +2 years | 0.8x | Slow penetration |
| Min | +2 years | 0.25x | Limited traction |

### Annual Unit Projections (Year 1-6)

| Year | Min | Downside | Base | Upside | Max |
|------|-----|----------|------|--------|-----|
| 1 | 0 | 0 | 200 | 400 | 700 |
| 2 | 400 | 400 | 900 | 1,800 | 4,400 |
| 3 | 1,000 | 1,100 | 2,000 | 4,000 | 9,800 |
| 4 | 1,700 | 2,000 | 3,600 | 6,900 | 15,200 |
| 5 | 2,400 | 3,200 | 5,600 | 10,300 | 18,700 |
| 6 | 3,100 | 4,700 | 8,200 | 13,700 | 20,400 |

---

## Module Specifications

### Module 1: Adoption Engine
**Purpose:** Implement sigmoid curves with configurable parameters

**Requirements:**
- [ ] Sigmoid function with parameters (L, x0, k, b)
- [ ] 5 scenario configurations (Min, DS, Base, US, Max)
- [ ] Linear regression conversion to unit sales
- [ ] Monthly interpolation from annual figures
- [ ] Growth-rate-based monthly sloping
- [ ] Scenario selector UI

### Module 2: Revenue
**Purpose:** Track sales, pricing, discounts, and channel attribution

**Requirements:**
- [ ] Base price configuration ($1,000 default)
- [ ] Promo code system with unique codes
- [ ] Discount tiers: Individual, PT, Doctor, Wholesaler (toggle)
- [ ] Referral margin tracking (5-15% range)
- [ ] Channel attribution via discount codes
- [ ] Revenue by scenario calculation
- [ ] Placeholder for future recurring revenue (video subscriptions)

### Module 3: COGS (Cost of Goods Sold)
**Purpose:** Volume-based manufacturing cost modeling

**Requirements:**
- [ ] Volume-cost interpolation table (200-10,000 units)
- [ ] Known data points: $96 @ 1K, $82-85 @ 5K
- [ ] Separate line items:
  - Manufacturing cost
  - Overseas freight/transport
  - Boxing/packaging
- [ ] Order quantity optimizer

### Module 4: CapEx (Capital Expenditures)
**Purpose:** Track tooling and re-engineering investments

**Requirements:**
- [ ] Initial tooling: $100-120K
- [ ] Re-tooling cycle: every 2-3 years
- [ ] Version tracking (V1, V2, V3)
- [ ] CapEx schedule visualization

### Module 5: G&A (General & Administrative)
**Purpose:** Granular employee/contractor expense tracking

**Requirements:**
- [ ] Individual line items per person
- [ ] Fields: Name, Role, Rate/Salary, Start Date, End Date
- [ ] Benefits/burden rate multiplier
- [ ] Monthly burn calculation
- [ ] Headcount timeline visualization

### Module 6: Marketing & CAC
**Purpose:** Marketing spend and customer acquisition cost modeling

**Requirements:**
- [ ] Channel-based budget allocation
- [ ] CAC calculation by channel
- [ ] ROAS (Return on Ad Spend) tracking
- [ ] Field marketing: conferences, workshops, clinics
- [ ] Digital marketing: ad spend, conversions
- [ ] Budget vs actual tracking

### Module 7: Seasonality
**Purpose:** Adjust monthly distribution based on baseball calendar

**Requirements:**
- [ ] Toggle: ON/OFF (default OFF)
- [ ] Seasonal pattern:
  - Q4 holiday bump (Christmas)
  - Late summer peak (pre-season)
  - Early/mid season: high
  - End of season: lower
- [ ] Monthly multiplier configuration
- [ ] Visual: seasonal adjustment chart

### Module 8: Capital Matrix
**Purpose:** Scenario analysis for fundraising

**Requirements:**
- [ ] Input: raise amount, valuation, terms
- [ ] Output: runway months, dilution %
- [ ] Matrix visualization: capital vs runway vs dilution
- [ ] Pre-order deposit impact modeling
- [ ] Kickstarter benchmark data (deposit norms)
- [ ] Exit scenario placeholders (Iron Neck merger, Rogue acquisition)

### Module 9: Pre-Order Campaign
**Purpose:** Model pre-order deposits and cash flow impact

**Requirements:**
- [ ] Launch date: dynamic field
- [ ] Deposit amount options ($200 default)
- [ ] Conversion rate assumptions
- [ ] Cash flow impact calculation
- [ ] Integration with Capital Matrix

### Module 10: DCF Calculator
**Purpose:** Discounted cash flow valuation

**Requirements:**
- [ ] Free cash flow projections (5-10 years)
- [ ] Discount rate configuration (WACC)
- [ ] Terminal value calculation
- [ ] NPV by scenario
- [ ] IRR by scenario
- [ ] Sensitivity tables

### Module 11: QBO Integration (Future)
**Purpose:** Sync actuals from QuickBooks Online

**Requirements:**
- [ ] QBO API connection
- [ ] Account mapping
- [ ] Actuals import: P&L, Balance Sheet
- [ ] Variance analysis: Budget vs Actual
- [ ] Reconciliation workflow

### Module 12: Manufacturer Bid Tracker
**Purpose:** Parse and compare vendor quotes

**Requirements:**
- [ ] Email ingestion (forwarded quotes)
- [ ] Auto-parsing: unit cost, MOQ, lead time, tooling
- [ ] Normalization: apples-to-apples comparison
- [ ] Historical tracking
- [ ] Price trend visualization
- [ ] Best quote alerts

---

## Technical Architecture

```
sportsprod-erp/
├── src/
│   ├── models/
│   │   ├── adoption/           # Sigmoid curves & projections
│   │   ├── revenue/            # Pricing, discounts, promo codes
│   │   ├── cogs/               # Manufacturing cost interpolation
│   │   ├── capex/              # Tooling, re-engineering cycles
│   │   ├── gna/                # G&A with employee granularity
│   │   ├── marketing/          # CAC, channel spend, ROAS
│   │   ├── seasonality/        # Monthly adjustments
│   │   ├── capital/            # Raise scenarios, matrix
│   │   ├── preorder/           # Deposit modeling
│   │   └── dcf/                # NPV, IRR, cash flow
│   ├── integrations/
│   │   ├── qbo/                # QuickBooks Online
│   │   └── email/              # Bid parsing
│   ├── dashboard/              # Management KPI views
│   └── api/                    # REST endpoints
├── docs/
│   └── PRD-financial-model.md  # This document
└── tests/
```

---

## Timeline

### Phase 1: Foundation (Week 1)
- Adoption engine
- Revenue module
- COGS interpolation
- Basic DCF

### Phase 2: Operations (Week 2)
- G&A tracker
- Marketing/CAC module
- Seasonality toggle
- Pre-order modeling

### Phase 3: Analysis (Week 3)
- Capital matrix
- Manufacturer bid tracker
- Dashboard/visualizations

### Phase 4: Integration (Week 4+)
- QBO integration
- Email ingestion
- Automated reporting

---

## Success Metrics

- [ ] Model matches historical actuals within 5%
- [ ] Can generate 5-year DCF in < 1 second
- [ ] Capital raise scenarios clearly visualized
- [ ] Pre-order campaign launch ready
- [ ] Management team can self-serve dashboards

---

## Appendix

### A. Sigmoid Parameters (Full)

| Param | Min | Downside | Base | Upside | Max |
|-------|-----|----------|------|--------|-----|
| L | 42.14 | 42.14 | 42.14 | 42.14 | 42.14 |
| x0 | 2020.97 | 2020.97 | 2018.97 | 2016.97 | 2014.97 |
| k | 0.12 | 0.39 | 0.48 | 0.58 | 0.97 |
| b | -10.75 | -0.66 | -0.66 | -2 | -3 |

### B. Existing Assets
- Website: elbowenforcer.com
- Shopify: Configured
- Email list: ~4,000 subscribers
- Instagram: @elbowenforcer
- Patent: Granted

### C. Key Contacts
- Founder: Lee Fiocchi
- Business operations: [TBD]
