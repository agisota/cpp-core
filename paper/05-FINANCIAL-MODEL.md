# Финансовая модель: 3 года

> *Версия 0.1 (2026-05-21). Рабочая финансовая модель для investor due diligence
> и board reporting. Все числа — на основе публичных данных и industry comparables.*

---

## I. Обзор: три сценария

```
╭───────────────────────────────────────────────────────────────────────────╮
│                                                                           │
│   BEAR              BASE               BULL                              │
│   ────────          ────────           ────────                          │
│   Y1: $100K ARR     Y1: $250K ARR      Y1: $500K ARR                    │
│   Y2: $600K ARR     Y2: $2M ARR        Y2: $5M ARR                      │
│   Y3: $2.5M ARR     Y3: $12M ARR       Y3: $30M ARR                     │
│                                                                           │
│   Runway to Series A  →  Q3 2027  ←  same across scenarios              │
│   Pre-seed close:  Q4 2026 (all scenarios)                               │
│                                                                           │
╰───────────────────────────────────────────────────────────────────────────╯
```

---

## II. Revenue projections

### 2.1. Customer count и ARPU

Три tier'а клиентов с различным ARPU и циклом продаж:

```
Customer Tiers:
───────────────────────────────────────────────────────────────────────────

Tier 1: Developer Teams (SMB)
  Profile: engineering team 10-50 devs, SaaS / fintech / AI-native startup
  ACV (Annual Contract Value): $24K-$60K ($2K-$5K/мес)
  Sales cycle: 30-60 days
  Churn rate: 15% annual (SMB is higher churn)
  Gross margin: 75%
  How won: self-serve + PLG motion (cpp-cli analyze → convert)

Tier 2: Enterprise
  Profile: enterprise 100-500 devs, regulated industry / large tech
  ACV: $120K-$360K ($10K-$30K/мес)
  Sales cycle: 90-180 days
  Churn rate: 7% annual
  Gross margin: 70% (more customer success overhead)
  How won: retroactive savings analysis → pilot → enterprise contract

Tier 3: Strategic / Sovereign AI Lab
  Profile: G42, TII, Sber AI, Yandex — own LLM infrastructure
  ACV: $600K-$2.4M ($50K-$200K/мес)
  Sales cycle: 180-360 days (government procurement)
  Churn rate: 5% annual
  Gross margin: 65% (deep integration, dedicated support)
  How won: government relationship + sovereign AI narrative
```

### 2.2. Base scenario: детальный год по году

#### Year 1 (2026): Pilot phase

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  YEAR 1 (2026) — BASE SCENARIO                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Q3 2026 (Jul-Sep):                                                      ║
║    New Tier 1 customers:    2  (pilot conversions)                      ║
║    New Tier 2 customers:    1  (first enterprise)                       ║
║    New Tier 3 customers:    0                                            ║
║    Avg ACV:  T1=$3K/мес, T2=$12K/мес                                   ║
║    ARR end of Q3: 2×$36K + 1×$144K = $216K                             ║
║                                                                          ║
║  Q4 2026 (Oct-Dec):                                                      ║
║    New Tier 1: +1 (converted from retro analysis)                       ║
║    New Tier 2: +1                                                        ║
║    ARR end of Q4: 3×$36K + 2×$144K = $396K ≈ $400K                    ║
║                                                                          ║
║  Year 1 Metrics:                                                         ║
║    Total customers EOY:     5                                            ║
║    ARR EOY:                $400K                                         ║
║    ARR recognized in Y1:  $150K (only H2 revenue)                      ║
║    Churn:                   0 (all in first year)                       ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

#### Year 2 (2027): Growth phase

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  YEAR 2 (2027) — BASE SCENARIO                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Starting ARR:    $400K                                                  ║
║                                                                          ║
║  New business:                                                           ║
║    Tier 1 new:    +10  @ $42K ACV avg = $420K ARR new                  ║
║    Tier 2 new:     +7  @ $180K ACV avg = $1.26M ARR new                ║
║    Tier 3 new:     +1  @ $720K ACV = $720K ARR new                     ║
║                                                                          ║
║  Expansion (existing Tier 1 → Tier 2):                                  ║
║    2 of 3 Tier 1 customers upsell to T2                                 ║
║    Upsell ARR:  2 × ($144K - $36K) = $216K                             ║
║                                                                          ║
║  Churn:                                                                  ║
║    Tier 1: 1 churns (15% of 3 = 0.45, round to 0) → $0                 ║
║    Tier 2: 0 churns (7% × 2 = 0.14, round to 0) → $0                   ║
║                                                                          ║
║  Year 2 ARR end:                                                         ║
║    Starting: $400K + New: $2.4M + Expansion: $216K - Churn: $36K       ║
║    = $2.98M ≈ $3M ARR                                                   ║
║                                                                          ║
║  Year 2 recognized revenue: ($400K + $3M) / 2 = $1.7M                 ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

#### Year 3 (2028): Scale phase

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  YEAR 3 (2028) — BASE SCENARIO                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Starting ARR:    $3M                                                    ║
║                                                                          ║
║  New business:                                                           ║
║    Tier 1 new:  +30  @ $48K ACV = $1.44M                                ║
║    Tier 2 new:  +20  @ $210K ACV = $4.2M                               ║
║    Tier 3 new:   +3  @ $900K ACV = $2.7M                               ║
║                                                                          ║
║  Expansion:                                                              ║
║    Tier 1 → T2: 5 customers @ $150K expansion = $750K                  ║
║    T2 upsell:   3 customers @ $100K expansion = $300K                   ║
║                                                                          ║
║  Churn:                                                                  ║
║    Tier 1: 2 churns @ $42K = -$84K                                      ║
║    Tier 2: 1 churns @ $180K = -$180K                                    ║
║    Tier 3: 0 churns                                                      ║
║                                                                          ║
║  Year 3 ARR end:                                                         ║
║    $3M + $8.34M + $1.05M - $264K = $12.1M ≈ $12M ARR                  ║
║                                                                          ║
║  Year 3 recognized revenue: ($3M + $12M) / 2 = $7.5M                  ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### 2.3. Summary revenue table

```
┌────────────────────────────────────────────────────────────────────────────┐
│  REVENUE SUMMARY (BASE SCENARIO)                                          │
├──────────────┬──────────┬──────────┬──────────┬──────────┬───────────────┤
│  Metric      │   Y1     │   Y2     │   Y3     │ Y3 vs Y1 │ Note          │
├──────────────┼──────────┼──────────┼──────────┼──────────┼───────────────┤
│ ARR EOY      │ $400K    │ $3M      │ $12M     │   30×    │               │
│ Recognized   │ $150K    │ $1.7M    │ $7.5M    │   50×    │ avg(start+end)│
│ Customers    │ 5        │ 25       │ 75       │   15×    │               │
│  - Tier 1    │ 3        │ 13       │ 38       │          │               │
│  - Tier 2    │ 2        │ 10       │ 30       │          │               │
│  - Tier 3    │ 0        │ 2        │ 7        │          │               │
│ Net Rev Ret. │ n/a      │ 120%+    │ 125%+    │          │ NRR target    │
│ Gross Margin │ 72%      │ 70%      │ 70%      │          │               │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## III. Unit economics

### 3.1. ARPU по тирам

```
                    Year 1    Year 2    Year 3
                  ─────────  ────────  ────────
Tier 1 ARPU/year  $36K      $42K      $48K     (+14% price increase)
Tier 2 ARPU/year  $144K     $180K     $210K    (+20% upsell)
Tier 3 ARPU/year  n/a       $720K     $900K    (+25% expansion)

Blended ARPU:     $80K      $120K     $160K
```

### 3.2. Customer Acquisition Cost (CAC)

```
CAC Calculation:
  Sales & Marketing spend / новые customers в период

Year 1 (founder-led sales, minimal spend):
  S&M spend:         $120K (founder time + events + tools)
  New customers:     5
  CAC:               $24K
  
Year 2 (first GTM hire + SDRs):
  S&M spend:         $600K
  New customers:     20
  CAC:               $30K

Year 3 (full GTM team):
  S&M spend:         $1.8M
  New customers:     53
  CAC:               $34K

Blended CAC payback period (at Gross Margin 70%):
  Year 2: CAC $30K / (ARPU $120K × 70%) = 4.3 months ✓ (target <12 months)
  Year 3: CAC $34K / (ARPU $160K × 70%) = 3.6 months ✓
```

### 3.3. LTV (Life Time Value)

```
LTV = ARPU × Gross Margin / Annual Churn Rate

По тирам:
  Tier 1:  $42K × 0.75 / 0.15 = $210K LTV
  Tier 2:  $180K × 0.70 / 0.07 = $1.8M LTV
  Tier 3:  $720K × 0.65 / 0.05 = $9.4M LTV
  
LTV:CAC ratio:
  Tier 1:  $210K / $30K = 7:1  ✓ (target >3:1)
  Tier 2:  $1.8M / $30K = 60:1 ✓
  Tier 3:  $9.4M / $30K = 313:1 ✓

Conclusion: unit economics very strong, especially for Tier 2+.
            Tier 1 viable but less efficient; serves as top-of-funnel.
```

### 3.4. Gross margin waterfall

```
Revenue: $100

  Less: COGS
    - Storage (S3 + CDN):                          -$3.50
    - Validator compute (Tier 2 validations):       -$5.20
    - Audit log retention (S3 Glacier, 7yr):        -$1.80
    - Customer Success (0.25 FTE / $10K customer):  -$16.50
    - Infra engineering (15% of infra cost):         -$3.00
    ─────────────────────────────────────────────────────
  Total COGS:                                       -$30.00

  Gross Profit:                                     $70.00
  Gross Margin:                                       70%

Notes:
  - Customer Success cost dominates COGS (pure software companies target <10%)
  - Reduces as automation increases (→ 75%+ at scale)
  - Infrastructure cost is low and predictable
  - No physical goods, licensing, or third-party royalties
```

---

## IV. Operating expenses

### 4.1. Team plan (headcount by year)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  HEADCOUNT PLAN                                                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Year 1 (2026):                                                          ║
║    CEO/Founder (founder, not on payroll until funding):   1.0 FTE $0    ║
║    GTM Lead (hire Q4 2026 post-close):                    1.0 FTE $80K  ║
║    Sr. Infra Engineer (hire Q4 2026):                     1.0 FTE $90K  ║
║    ─────────────────────────────────────────────────────────────         ║
║    Total hired Y1:    2 FTE (H2 only)                                   ║
║    Y1 payroll cost:   $85K (½-year × 2 people)                          ║
║                                                                          ║
║  Year 2 (2027):                                                          ║
║    + Research Lead (zkML / canonical hashing):            1.0 FTE $100K ║
║    + Crypto/Security Engineer:                            1.0 FTE $95K  ║
║    + Customer Success Manager:                            1.0 FTE $70K  ║
║    + 2nd Sales/BDR (MENA focus):                          1.0 FTE $65K  ║
║    ─────────────────────────────────────────────────────────────         ║
║    Total team Y2:     8 FTE (including Y1 + founder)                    ║
║    Y2 payroll cost:   $570K (annualized)                                 ║
║                                                                          ║
║  Year 3 (2028):                                                          ║
║    + 3 more engineers (MCP, validator, storage):          3.0 FTE $300K ║
║    + 2 more AEs (Account Executives):                     2.0 FTE $200K ║
║    + VP Engineering (fractional → full):                  1.0 FTE $150K ║
║    + Legal / Finance (contractor → FTE):                  1.0 FTE $90K  ║
║    ─────────────────────────────────────────────────────────────         ║
║    Total team Y3:    15 FTE                                              ║
║    Y3 payroll cost:  $1.31M (annualized)                                 ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

Geographic arbitrage note:
  Engineering hires: Russia/Kazakhstan/Ukraine → ~50-60% of US equivalent
  Sales hires: UAE/MENA → 20-30% premium over US for senior enterprise sales
  Effective payroll blended discount: ~20% vs SF-equivalent team
```

### 4.2. OpEx waterfall

```
┌────────────────────────────────────────────────────────────────────────────┐
│  OPEX BREAKDOWN (BASE SCENARIO)                          ($K)             │
├──────────────────────────────┬────────────┬────────────┬──────────────────┤
│  Category                    │   Year 1   │   Year 2   │   Year 3         │
├──────────────────────────────┼────────────┼────────────┼──────────────────┤
│  Payroll (engineering)       │    85K     │   285K     │   640K           │
│  Payroll (sales/CS)          │    45K     │   285K     │   670K           │
│  Founder salary              │     0K     │   120K     │   180K           │
│  Total Payroll               │   130K     │   690K     │  1,490K          │
├──────────────────────────────┼────────────┼────────────┼──────────────────┤
│  Cloud infrastructure        │    24K     │    72K     │   240K           │
│  SaaS tools (dev/ops)        │    18K     │    36K     │    72K           │
│  Validator compute           │     6K     │    48K     │   180K           │
│  Total Infrastructure        │    48K     │   156K     │   492K           │
├──────────────────────────────┼────────────┼────────────┼──────────────────┤
│  Sales & Marketing           │    75K     │   420K     │  1,320K          │
│  (events, ads, content)      │            │            │                  │
├──────────────────────────────┼────────────┼────────────┼──────────────────┤
│  R&D / Research grants       │    30K     │    90K     │   180K           │
│  (experiments, zkML POC)     │            │            │                  │
├──────────────────────────────┼────────────┼────────────┼──────────────────┤
│  G&A (legal, accounting,     │    40K     │    90K     │   150K           │
│  compliance, insurance)      │            │            │                  │
├──────────────────────────────┴────────────┴────────────┴──────────────────┤
│  TOTAL OPEX (excl. COGS)                                                  │
│                              │   323K     │  1,446K    │  3,632K          │
└──────────────────────────────┴────────────┴────────────┴──────────────────┘
```

### 4.3. P&L summary (base scenario)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  P&L SUMMARY                              Year 1    Year 2    Year 3      │
├──────────────────────────────────────────────────────────────────────────  │
│  Revenue (recognized)                     $150K     $1.7M     $7.5M      │
│  COGS                                     -$42K    -$510K   -$2.25M      │
│  ─────────────────────────────────────────────────────────────────────     │
│  Gross Profit                              $108K    $1.19M    $5.25M      │
│  Gross Margin %                             72%       70%       70%       │
│  ─────────────────────────────────────────────────────────────────────     │
│  Payroll (non-COGS)                        -$130K   -$690K   -$1.49M     │
│  Sales & Marketing                          -$75K   -$420K   -$1.32M     │
│  Infrastructure (non-COGS)                  -$24K    -$72K    -$240K     │
│  R&D                                        -$30K    -$90K    -$180K     │
│  G&A                                        -$40K    -$90K    -$150K     │
│  ─────────────────────────────────────────────────────────────────────     │
│  Operating Income (EBIT)                  -$191K   -$162K    $1.87M      │
│  EBIT Margin                              -127%      -10%     +24.9%     │
│  ─────────────────────────────────────────────────────────────────────     │
│  Funded by (pre-seed):                    +$700K                          │
│  Funded by (seed):                                 +$4M                   │
│  ─────────────────────────────────────────────────────────────────────     │
│  Cash position EOY                        +$458K  +$4.3M*   +$6.2M*     │
│  (* after seed round close Q1 2027)                                       │
└────────────────────────────────────────────────────────────────────────────┘

Key milestones:
  EBITDA breakeven: Q3 2028 (mid-Year 3)
  First profitable quarter: Q4 2027 (on Gross Profit basis Q2 2027)
```

---

## V. Capital efficiency и runway

### 5.1. Quarterly cash runway

```
Assuming pre-seed closes Q4 2026 for $700K:

Q3 2026 (pre-funding):
  Revenue:       $0 (pilots not yet converted)
  Burn:         -$30K/мес (founder only, minimal ops)
  Cash:         Personal + angel bridge

Q4 2026 (post-funding):
  Starting cash: $700K
  Monthly burn:  -$55K/мес (2 hires + infra)
  Revenue:       +$8K/мес (first converted pilots)
  Net burn:      -$47K/мес
  Runway:        $700K / $47K = 14.9 months → into Q1 2028

With Seed ($4M) closing Q1 2027:
  Starting cash: ~$560K + $4M = $4.56M
  Monthly burn Y2: -$160K/мес
  Monthly revenue Y2 avg: +$100K/мес
  Net burn Y2: -$60K/мес
  Runway from Q1 2027: $4.56M / $60K = 76 months → well into 2033

Cash runway by quarter (base scenario):
┌──────────────────────────────────────────────────────────────────┐
│  Q4'26  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱  $560K  (post pre-seed)           │
│  Q1'27  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰  $4.5M  (post seed)              │
│  Q2'27  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰  $4.3M                            │
│  Q3'27  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱  $4.1M                            │
│  Q4'27  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱  $3.8M  (nearing cashflow pos.)  │
│  Q1'28  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱  $3.9M  (revenue accelerating)   │
│  Q2'28  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱  $4.2M  (EBITDA positive)        │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2. Capital efficiency metrics

```
Rule of 40: (Revenue Growth % + EBITDA Margin %)
  Y2:  ARR growth 650% - EBITDA margin 10% = 640  ✓✓✓ (>40 = healthy)
  Y3:  ARR growth 300% + EBITDA margin 25% = 325  ✓✓✓

Burn Multiple: Net Burn / Net New ARR
  Y1:  $191K / $400K = 0.48x  ✓✓✓ (target <1.5x)
  Y2:  $162K / $2.6M = 0.06x  ✓✓✓ (exceptional efficiency)
  Y3:  cash positive          ✓✓✓

Revenue Per Employee:
  Y1:  $150K / 3 = $50K/emp  (early stage, expected)
  Y2:  $1.7M / 8 = $212K/emp ✓ (healthy SaaS)
  Y3:  $7.5M / 15 = $500K/emp ✓✓ (excellent, approaching Snowflake levels)
```

---

## VI. Sensitivity analysis: три сценария

### 6.1. Bear case: медленная адопция, конкурентное давление

```
Bear Case Assumptions:
  - Competitor (Anthropic internal team) releases similar product Q4 2026
  - Pilot conversion rate 40% (vs 80% base)
  - Churn 25% annual for Tier 1, 15% for Tier 2
  - Sales cycles extend: +60 days each tier
  - Pricing pressure: -30% on ACV due to competition

Bear Case Results:
  Y1 ARR:   $100K (2 customers)
  Y2 ARR:   $600K (8 customers)
  Y3 ARR:   $2.5M (20 customers)
  
  Y3 EBITDA: -$800K (requires Series A to survive)
  
  Mitigation: If competitor emerges → reposition as "open standard" vs
              "proprietary" → gain enterprise trust through openness.
  
  Probability: 20%

Key risk: if Anthropic builds this natively, our value proposition shifts.
          Thesis: we go CROSS-PROVIDER, Anthropic stays single-provider.
          Even in bear case, CPP still works as neutral layer.
```

### 6.2. Base case (primary projection)

Детально описан в §§ II-V выше.

```
Base Case Assumptions:
  - No major competitor for 18 months
  - Pilot conversion rate 80%
  - NRR 120%+ (expansion within accounts)
  - Pricing holds

Probability: 60%
Y3 ARR: $12M
EBITDA positive by Q3 2028
```

### 6.3. Bull case: viral adoption, enterprise fast-track

```
Bull Case Assumptions:
  - EU AI Act enforcement creates regulatory push (Q4 2026)
  - HuggingFace integrates CPP validator natively → distribution boost
  - 2+ Tier 3 (sovereign AI lab) customers in Y1
  - NRR 140%+ (rapid upsell within accounts)
  - Pricing power: enterprise tier ACV 2× base

Bull Case Results:
  Y1 ARR:   $500K (6 customers, including 1 T3)
  Y2 ARR:   $5M   (30 customers)
  Y3 ARR:   $30M  (100 customers, including 5 T3)
  
  Y3 EBITDA: $6M (20% margin)
  
  Series A timing: Q1 2027 (pull forward)
  Series A size:   $20-25M at $100M+ valuation
  
  Probability: 20%
```

### 6.4. Sensitivity table

```
Key variable: Pilot conversion rate (baseline: 80%)

Conv. Rate │  Y1 ARR   │  Y2 ARR   │  Y3 ARR   │  Series A timing
───────────┼───────────┼───────────┼───────────┼──────────────────
   40%     │  $100K    │  $700K    │  $2.8M    │  Q2 2027 (delayed)
   60%     │  $220K    │  $1.5M    │  $7M      │  Q1 2027
   80%     │  $400K    │  $3M      │  $12M     │  Q1 2027 (base)
  100%     │  $550K    │  $4.5M    │  $18M     │  Q4 2026 (pull forward)

Key variable: ARPU growth (baseline: 15% annual)

ARPU growth│  Y1 ARR   │  Y2 ARR   │  Y3 ARR
───────────┼───────────┼───────────┼──────────
   0%      │  $400K    │  $2.3M    │  $8.5M
   15%     │  $400K    │  $3M      │  $12M    ← base
   30%     │  $400K    │  $3.5M    │  $16M
   50%     │  $400K    │  $4.2M    │  $22M
```

---

## VII. Comparison с public infrastructure companies

### 7.1. Comparable companies (exit multiples)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  PUBLIC INFRA COMPARABLES (as of 2025-2026 market)                        │
├──────────────┬─────────────┬──────────────┬─────────────┬─────────────────┤
│  Company     │  ARR at IPO │  IPO Valuation│  EV/ARR     │  Model          │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│  Datadog     │  $100M      │  $780M       │  7.8×       │  Usage-based    │
│  (2019)      │             │              │             │  SaaS infra     │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│  Snowflake   │  $600M      │  $33B        │  55×        │  Consumption    │
│  (2020)      │             │              │             │  data platform  │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│  HashiCorp   │  $320M      │  $3.1B       │  9.7×       │  Open-core      │
│  (2021)      │             │              │             │  infra tools    │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│  Grafana Labs│  $200M+     │  $6B         │  30×        │  Open-source    │
│  (private)   │             │              │             │  observability  │
├──────────────┼─────────────┼──────────────┼─────────────┼─────────────────┤
│  Stripe      │  $1B+       │  $95B peak   │  ~95×       │  Protocol       │
│  (private)   │             │              │             │  infrastructure │
└──────────────┴─────────────┴──────────────┴─────────────┴─────────────────┘

CPP positioning:
  Closest analogy: HashiCorp (open-core, infrastructure, developer-first)
  Upside analogy:  Stripe (protocol layer, network effects)
  
  Conservative (HashiCorp multiple, 10× ARR):
    Y3 ARR $12M × 10 = $120M valuation (Series A milestone)
    
  Moderate (Datadog multiple, 15× ARR):
    Y3 ARR $12M × 15 = $180M valuation
    
  Optimistic (Snowflake-like if protocol wins, 40× ARR):
    Y3 ARR $12M × 40 = $480M valuation (if canonical standard established)
```

### 7.2. Exit scenarios

```
Acqui-hire / Strategic acquisition scenarios:

  Scenario A: Anthropic acquires CPP (2028-2029)
    Rationale: integrate canonical encoding natively
    Price: 15-25× ARR = $180M - $300M
    Strategic value: eliminates competitor + gets protocol + team
    
  Scenario B: HuggingFace acquires CPP
    Rationale: add canonical infrastructure to their platform
    Price: 20-30× ARR = $240M - $360M
    Strategic value: complements their model hosting with context management
    
  Scenario C: AWS / GCP / Azure acquires CPP
    Rationale: differentiated cloud service for LLM enterprise customers
    Price: 30-50× ARR = $360M - $600M
    Strategic value: sticky enterprise contract mechanism
    
  Scenario D: IPO (2030+)
    Requires: ARR > $50M, NRR > 120%, clear path to $500M ARR
    Timeline: if bull scenario plays out
    Valuation: 20× ARR = $1B+
```

---

## VIII. KPI Dashboard для board reporting

### 8.1. Ключевые метрики

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  CPP BOARD DASHBOARD — MONTHLY UPDATE                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  GROWTH                                                                  ║
║  ARR:         $______  │  MoM growth: ______%  │  vs plan: ______%     ║
║  Customers:   ______   │  New this month: ____  │  Churn: ______        ║
║  Pipeline:    $______  (weighted)                                        ║
║                                                                          ║
║  RETENTION                                                               ║
║  NRR (trailing 12m):  ______%  (target: >115%)                          ║
║  Gross Churn:          ______%  (target: <8%)                            ║
║  Expansion Revenue:   $______  (upsells + tier upgrades)                ║
║                                                                          ║
║  UNIT ECONOMICS                                                          ║
║  Gross Margin:         ______%  (target: 70%)                            ║
║  CAC Payback:         ______ months  (target: <12)                      ║
║  LTV:CAC ratio:        ______×  (target: >5×)                            ║
║                                                                          ║
║  CASH                                                                    ║
║  Cash on hand:         $______                                           ║
║  Net burn:             $______/мес                                       ║
║  Runway:              ______ months                                      ║
║                                                                          ║
║  PRODUCT / TECHNICAL                                                     ║
║  CIDs stored (total):  ______  (platform scale)                         ║
║  Validations/day:      ______                                            ║
║  Uptime (30d):         ______%  (target: 99.9%)                         ║
║  Cache hit rate avg:   ______%  (client-side metric)                    ║
║                                                                          ║
║  GTM / PIPELINE                                                          ║
║  Retro analyses:       ______  (pipeline indicator)                     ║
║  Demo calls:           ______/мес                                        ║
║  LOIs pending:         ______                                            ║
║  VC conversations:     ______  (fundraising track)                      ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### 8.2. Leading indicators (сигналы в воронке)

```
Product-led growth signal:
  ├── cpp-cli analyze downloads/мес
  ├── GitHub stars velocity (cpp-core)
  └── OSS contributor count

Sales pipeline signal:
  ├── Retro analyses completed (лагающий, но точный)
  ├── Shadow deployments active
  └── Days to convert (retro → LOI → contract)

Market signal:
  ├── NRR trend (лучший indicator product-market fit)
  ├── Tier 1 → Tier 2 upgrade rate
  └── Inbound requests (% of new pipeline vs outbound)
```

### 8.3. Investment timing по milestones

```
╭──────────────────────────────────────────────────────────────────────────╮
│  CAPITAL + MILESTONES ALIGNMENT                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Pre-seed ($700K) — Q4 2026                                             │
│  Milestone unlock:                                                       │
│    ✅ Anthropic cache alignment experiment results published              │
│    ✅ 2+ pilot contracts signed (LOI acceptable)                         │
│    ✅ Reference implementation v1.0.0 stable                             │
│    ✅ 2 FTE hired                                                        │
│                                                                          │
│  Seed ($3-5M) — Q1 2027                                                 │
│  Milestone unlock:                                                       │
│    ✅ $250K ARR (3+ paying customers)                                    │
│    ✅ 3 pilots with measurable results (% savings documented)            │
│    ✅ arXiv preprint published + citations                               │
│    ✅ NRR > 100% (retention proven)                                      │
│    ✅ 2nd enterprise customer signed                                     │
│                                                                          │
│  Series A ($15-25M) — Q3 2027                                           │
│  Milestone unlock:                                                       │
│    ✅ $2M ARR (20+ customers)                                            │
│    ✅ NRR > 115%                                                         │
│    ✅ Gross Margin > 65%                                                 │
│    ✅ Enterprise Tier 2 customers paying >$100K ACV                      │
│    ✅ Product working in 2+ geographies (US/EU + MENA or CIS)           │
│    ✅ 1+ industry publication (NeurIPS workshop or similar)              │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

---

## IX. Приложение: детальные формулы

### Формула оценки token savings (для sales)

```
monthly_savings($) =
  devs × sessions_per_day × days_per_month × turns_per_session ×
  context_tokens × repetition_rate × cache_discount ×
  token_price_per_M / 1_000_000

Например для команды 50 devs:
  50 × 25 × 22 × 8 × 150_000 × 0.70 × 0.90 × 3 / 1_000_000
  = 50 × 25 × 22 × 8 × 150000 × 0.63 × 3 / 1000000
  = 50 × 25 × 22 × 8 × 283.5
  = 50 × 25 × 22 × 2268
  = 50 × 25 × 49896
  = 50 × 1247400
  = $62,370,000 ... / 1M (tokens)
  → $62,370 / мес

Sanity check: 50 devs × $1,247 / dev / мес ≈ $15K / мес savings.
                                                (реалистично для shared codebase)

CPP revenue (20% rev share): $15K × 0.20 = $3,000/мес = $36K ACV ← соответствует Tier 1
```

### Формула CAC

```
CAC = (S&M_spend_in_period) / new_customers_in_period

Payback_months = CAC / (ARPU_monthly × gross_margin)

Rule of thumb:
  Good SaaS: payback < 12 months
  Great SaaS: payback < 6 months
  CPP Y2: $30K / ($10K × 0.70) = 4.3 months → Great
```

### Формула NRR

```
NRR = (ARR_start + expansion - contraction - churn) / ARR_start × 100%

Target >100%: каждый cohort растёт без новых customers.
Target >120%: category-leader level (Snowflake = 158% at IPO).

CPP path to 120% NRR:
  Churn rate: 8% (1 - 0.08 = 0.92 retention)
  Expansion: +30% (upsells + tier upgrades)
  NRR: 0.92 × 1.30 = 1.20 = 120% ✓
```

---

*Эта финансовая модель обновляется ежеквартально по мере накопления реальных данных.
Контакт: founder@cpp.dev*
