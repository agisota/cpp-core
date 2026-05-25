# Pilot Agreement Template

> **CONFIDENTIAL DRAFT**
> Не подписывать без legal review в конкретной юрисдикции (UAE / RU / KZ / Delaware).
> Это шаблон для conversations; final agreement требует local counsel.

---

## CPP Pilot Agreement

**Between:**
- **CPP Inc.** ("Provider") — Delaware C-Corp, реестровый номер [TBD]
- **[Customer Name]** ("Customer") — [юрисдикция, реестр]

**Effective Date:** [DD-MM-YYYY]

---

### 1. Scope

#### 1.1. Purpose

Customer agrees to participate in a **90-day shadow pilot** of the Context Provenance Protocol (CPP) reference implementation. Goal: empirically measure potential cost savings and operational benefits without disrupting Customer's production AI workflows.

#### 1.2. Deliverables from Provider

- (a) Reference implementation deployment (cpp-proxy v1.0.0-rc.1 or later)
- (b) Setup support (≤8 engineering hours)
- (c) Daily metrics reports (automated email)
- (d) Final pilot report at 30, 60, 90 days
- (e) Optional onboarding to v2.0+ features at pilot conclusion

#### 1.3. Customer commitments

- (a) Provide read-only access to LLM usage logs (anonymized, sanitized)
- (b) Allocate one technical contact for weekly 30-min syncs
- (c) Permit deployment of cpp-proxy in isolated environment (typically Docker container in customer's own infrastructure)
- (d) Provide written feedback at 30/60/90-day checkpoints

---

### 2. Deployment Model

#### 2.1. Shadow mode (default)

```
                  Customer's LLM API client
                            │
                            ▼
              ┌──────────────────────────┐
              │      cpp-proxy            │
              │  (deployed in customer's   │
              │   isolated network)       │
              └──────────┬───────────────┘
                         │ forwards unchanged
                         ▼
                  Anthropic / OpenAI API
                  (production traffic — no change)
                         │
                         ▼
              ┌──────────────────────────┐
              │  cpp-measure DB           │
              │  (canonical bytes, CIDs,  │
              │   would-be cache hits)    │
              │   ALL STORED IN CUSTOMER  │
              │   INFRASTRUCTURE          │
              └──────────────────────────┘
```

Key properties:
- cpp-proxy **does not modify** production traffic
- All metrics, CIDs, canonical bytes stored in **customer's** infrastructure
- Provider has **no remote access** to customer's data
- Customer can `docker stop cpp-proxy` at any moment with **zero production impact**

#### 2.2. Production mode (optional, after Day 30)

If Customer chooses to convert from shadow to production at 30-day checkpoint:
- cpp-proxy becomes active middleware
- Provider-cache alignment becomes deterministic
- Real cost savings begin accruing
- Customer can revert to shadow mode at any time

---

### 3. Data Privacy & Security

#### 3.1. Data residency

All Customer data (LLM payloads, CIDs, metrics) remains within **Customer's infrastructure**. Provider receives only **aggregate, anonymized statistics** for purpose of pilot reporting:
- Total requests count
- Cache hit rate
- Token volume
- $ savings estimate

No payload bytes, no CIDs, no identifiable content leave Customer's environment.

#### 3.2. Anonymization

Daily reports include:
- ✅ Counts and rates
- ✅ Aggregate statistics
- ✅ $ figures
- ❌ Individual request content
- ❌ User identifiers
- ❌ Source code or document content

#### 3.3. Compliance

Provider warrants that cpp-proxy v1.0.0-rc.1+ does not transmit Customer data to any third party. cpp-proxy is open-source (MIT, github.com/agisota/cpp-core); Customer may audit source code at any time.

Customer is responsible for ensuring deployment of cpp-proxy complies with applicable laws (GDPR, FZ-152, PDPL, HIPAA, etc.) in Customer's jurisdiction.

---

### 4. Pricing

#### 4.1. Pilot pricing

**$0** for 90-day shadow pilot.

#### 4.2. Post-pilot conversion options (Customer's choice)

| Option | Pricing | Min commit |
|---|---|---|
| **Revenue share** | 20% of measured savings (verified by mutually-agreed methodology) | $24K/year ($2K/мес) |
| **Enterprise SaaS** | $5K-30K/мес flat depending on usage tier | 12 месяцев |
| **Self-hosted (open core)** | $0 software + $1K/мес support | 6 месяцев |
| **No conversion** | $0, Customer keeps deployment as informational only | N/A |

Customer chooses conversion option at 90-day mark. No automatic renewal or hidden fees.

#### 4.3. Out-of-pocket

Customer covers:
- Infrastructure for cpp-proxy hosting (typically <$50/мес AWS/equivalent)
- Network egress if applicable

---

### 5. Intellectual Property

#### 5.1. CPP IP

Provider retains all IP rights to:
- CPP protocol specifications
- cpp-core reference library (under MIT license)
- cpp-proxy implementation
- Trademarks

#### 5.2. Customer data

Customer retains all rights to:
- LLM payloads and content
- CIDs and canonical bytes derived from Customer data
- Metrics and reports

#### 5.3. Aggregate learnings

Provider may use **aggregated, anonymized** pilot learnings (e.g., "average savings across 5 pilots: 47%") in marketing, provided **no Customer is identified** without separate written consent.

---

### 6. Term and Termination

#### 6.1. Term

90 days from Effective Date.

#### 6.2. Termination for convenience

Either party may terminate with **24 hours written notice** during pilot period. No penalties, no continuing obligations.

#### 6.3. Termination effects

Upon termination:
- Customer stops cpp-proxy deployment
- Customer retains all collected data
- Provider's access (if any) is revoked
- Survival: Confidentiality clauses, IP clauses survive

---

### 7. Warranties and Liability

#### 7.1. Provider warranties

Provider warrants:
- (a) cpp-proxy is materially as described in documentation
- (b) Open-source license (MIT) allows Customer's intended use
- (c) Provider has authority to enter this agreement

#### 7.2. Customer warranties

Customer warrants:
- (a) Authority to enter this agreement
- (b) Compliance with applicable regulations in their jurisdiction
- (c) That logs/data shared are appropriately authorized for processing

#### 7.3. Limitation of liability

Total liability of either party limited to $10,000 USD for pilot duration. Both parties acknowledge this is a **pilot/research arrangement** and exclude consequential damages.

#### 7.4. Indemnification

None for pilot phase. Standard indemnification clauses apply only to converted production contracts.

---

### 8. Confidentiality

Both parties agree:
- Pilot details, metrics, and findings are **Confidential Information**
- Mutual NDA for 5 years post-termination
- Public references / case studies only with written consent of both parties

---

### 9. Governing Law

This agreement is governed by:
- **For Customer in UAE/MENA:** ADGM Courts, English law
- **For Customer in Russia/CIS:** Russian Federation law, Moscow Arbitration
- **For Customer in EU:** Customer's local jurisdiction
- **For Customer in USA:** Delaware law, Delaware courts

---

### 10. Signatures

```
For CPP Inc.:                          For [Customer]:

_______________________               _______________________
Name:                                  Name:
Title:                                 Title:
Date:                                  Date:
```

---

## Annex A: Pilot Success Criteria

```
At Day 30:
  □ Cache hit rate ≥ 25% (measured, would-be)
  □ Zero production incidents attributable to cpp-proxy
  □ Customer technical contact rates engagement ≥ 4/5

At Day 60:
  □ Cumulative would-be savings ≥ 1% of Customer's monthly LLM spend
  □ Identified actionable structural improvements documented

At Day 90:
  □ Final report delivered
  □ Conversion conversation held
  □ Mutual decision: continue / pause / terminate
```

---

## Annex B: Reporting Cadence

```
Daily (automated):
  - Cache hit rate
  - Token volume
  - Estimated savings (cumulative)
  
Weekly (30-min sync):
  - Technical issues review
  - Pattern analysis (which contexts duplicate most)
  - Customer questions
  
At Day 30, 60, 90 (formal checkpoint):
  - Comprehensive written report
  - Customer feedback collected
  - Strategic recommendations
```

---

## Annex C: Deployment Quickstart

```
# Customer's infrastructure team runs:

docker run -d --name cpp-proxy \
  -p 9999:9999 \
  -v /var/lib/cpp-data:/data \
  -e UPSTREAM=https://api.anthropic.com \
  -e CUSTOMER_ID=[customer-uuid] \
  ghcr.io/agisota/cpp-proxy:rc.1

# Then change in customer's LLM client:
#   ANTHROPIC_API_URL=http://cpp-proxy:9999/v1
# (or equivalent для OpenAI / Gemini / others)

# Everything else works as before.
# Daily reports start arriving at customer's configured email.
```

Estimated deployment time: **30 minutes including DNS/networking config**.
