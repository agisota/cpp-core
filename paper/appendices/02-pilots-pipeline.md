# Appendix II: Pilots Pipeline

> Target customers, sorted by week of outreach. Real entities, aspirational status.

## Tier 1: Friendly fire (own/warm network) — Week 1-2

| # | Company | Country | Vertical | Contact path | Status | $ ARR potential |
|---|---------|---------|----------|--------------|--------|------|
| 1 | **Personal ROX.ONE team** | UAE/RU | DevTools | direct (self) | 🟢 Ready for pilot | $5K-15K |
| 2 | **Anthropic Customer Success** | USA | LLM provider | Email cs@anthropic | 🔘 To outreach | Strategic relationship |
| 3 | **Cursor** | USA | Code editor | Twitter/email | 🔘 To outreach | $10K-50K |
| 4 | **Cline** | USA | Code editor | GitHub/Discord | 🔘 To outreach | $5K-25K |
| 5 | **Aider** | USA | CLI agent | GitHub | 🔘 To outreach | $5K-15K |

## Tier 2: Russia / CIS — Week 2-4

| # | Company | Vertical | Contact path | Notes |
|---|---------|----------|--------------|-------|
| 6 | **Sber AI** (SaluteAI, GigaChat) | Banking + LLM | LinkedIn Sergey Ushakov, intro через Sber500 | Strategic; они сами рекомендуют CPP-like решения внутри |
| 7 | **Yandex** (YandexGPT team) | Search + AI | LinkedIn ML platform leads | Heavy multi-agent workflows |
| 8 | **Tinkoff** (ML platform) | Fintech | Habr статья → comments outreach | Already deep into LLM internally |
| 9 | **MTS AI** | Telecom + AI | LinkedIn / Skoltech network | Less crowded buyer |
| 10 | **VK** (нейросети, AI Assistant) | Social + AI | Hackathons / direct | |
| 11 | **X5 Retail** (Перекрёсток AI) | Retail | Through retail-tech meetups | |
| 12 | **Wildberries** (AI for recsys) | E-commerce | LinkedIn | |
| 13 | **Avito** (AI for moderation) | Marketplace | LinkedIn | |

## Tier 3: Kazakhstan — Week 3-5

| # | Company | Vertical | Contact path | Notes |
|---|---------|----------|--------------|-------|
| 14 | **Kaspi.kz** | Super-app | Astana Hub intro | Heavy in-house AI |
| 15 | **Halyk Bank** | Banking | Through Astana Hub | RegTech opportunity |
| 16 | **Beeline KZ** | Telecom | LinkedIn | |
| 17 | **Astana Hub portfolio (10 startups)** | Various | Direct, через Hub | Aggregated pilot opportunity |

## Tier 4: UAE / MENA — Week 4-6

| # | Company | Vertical | Contact path | Notes |
|---|---------|----------|--------------|-------|
| 18 | **G42** (Inception AI, Jais) | Sovereign AI | Hub71 intro | High strategic fit |
| 19 | **TII** (Technology Innovation Institute) | Research | Direct, через AI71 fellowship | Research partner potential |
| 20 | **Mubadala-backed AI startups** | Various | Through Mubadala Ventures | Portfolio access |
| 21 | **Etisalat&** (e&) | Telecom | LinkedIn | |
| 22 | **ADNOC Digital** | Energy | Through ADNOC tech events | |
| 23 | **Careem** (Uber) | Mobility | Direct, ex-Uber network | |

## Tier 5: Saudi Arabia — Week 5-7

| # | Company | Vertical | Contact path | Notes |
|---|---------|----------|--------------|-------|
| 24 | **STC** (Saudi Telecom) | Telecom + AI | Through KAUST | |
| 25 | **Saudi Aramco Digital** | Energy + AI | Through Aramco Ventures | |
| 26 | **Sanabil-backed AI startups** | Various | Via Sanabil Ventures | |
| 27 | **National Center for AI (SDAIA)** | Government AI | Direct via gov.sa | Sovereign use case |
| 28 | **KAUST AI Center** | Research | Direct academic partnership | Grant + customer |

## Tier 6: USA/Europe — Week 7+

| # | Company | Vertical | Contact path | Notes |
|---|---------|----------|--------------|-------|
| 29 | **Notion AI** | Productivity | YC alumni network | |
| 30 | **Sourcegraph (Cody)** | DevTools | Twitter / GitHub | |
| 31 | **Replit Agent** | DevTools | YC alumni | |
| 32 | **GitHub Copilot Workspace** | DevTools | Direct via Microsoft | Long shot |
| 33 | **Glean** | Enterprise search | LinkedIn | |
| 34 | **Pinecone** | Vector DB | Slack community | Complementary product |
| 35 | **Mistral** | LLM provider | Direct outreach | Partner positioning |
| 36 | **Aleph Alpha** | EU LLM | Through TII connection | Sovereign EU AI |

## Outreach template (cold)

```
Subject: [Company] LLM-расходы: 30-70% потенциальной экономии за 7 дней

[Name],

Видим, что [Company] активно использует Claude / Yandex GigaChat / 
[provider] для [observed use case].

Делаем audit, который без изменений вашей инфраструктуры показывает 
сколько вы тратите на повторно-загружаемый контекст и сколько можно 
сэкономить через content-addressed canonical encoding.

Анализ:
  - Занимает 3 дня
  - Не требует API-доступа (работает с anonymized usage logs)
  - Если экономия < 20% — бесплатно
  - Если больше — pilot на revenue share

Reference implementation open-source: github.com/agisota/cpp-core
Public spec: github.com/agisota/cpp-core/blob/main/2026-...design.md

Готовы провести retroactive savings analysis для [Company] на этой неделе?

[Founder]
```

## Pilot conversion funnel (estimated)

```
Outreach (cold)        ────►  100   (target)
                                │ 15% response rate
                                ▼
Discovery calls        ────►   15
                                │ 67%
                                ▼
Retroactive analysis   ────►   10
                                │ 50%
                                ▼
Signed pilot agree.    ────►    5   ✓ target Y1
                                │ 80%
                                ▼
Production conversion  ────►    4
                                │ 90%
                                ▼
Annual contract        ────►    3-4 ✓ → $250K-$400K ARR Y1
```
