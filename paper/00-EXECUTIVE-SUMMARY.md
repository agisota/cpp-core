# Executive Summary

**Context Provenance Protocol (CPP)** — двухуровневая инфраструктура для агентных и LLM-систем:

1. **Поверхностный уровень (immediate value):** content-addressed serialization, дающий 30-70% экономии на input-токенах для команд с разделяемым контекстом + криптографически верифицируемый audit trail для регулируемых AI-решений.

2. **Глубинный уровень (strategic value):** канонический протокол хэширования фактов, событий и суждений, превращающий взаимодействия многоагентных систем в обучающий сигнал для следующего поколения моделей. Тот, кто владеет каноном — владеет training data flywheel.

---

## Числовая гипотеза

| Метрика | Без CPP | С CPP | Дельта |
|---|---|---|---|
| Стоимость 200K-токенного контекста, повторённого 30 раз | $18.00 | $5.40 | **−70%** |
| TTFT (time-to-first-token) на cached prefix | 4.5 с | 0.8 с | **−82%** |
| Disk usage на 13 worktree-ов с дублирующим контентом | 16 GB | 3.2 GB | **−80%** |
| Reproducibility audit query «что AI видел в момент X» | 30+ мин grep | 1 SQL | **>1000×** |

(Числа — на реальных данных пользователя с машины автора, см. §IV.)

## Рынок и адресуемая аудитория

**TAM (2026):** $4.8B — глобальные расходы корпораций на LLM API.
**SAM:** $1.2B — корпорации с >100 сотрудниками, использующие LLM как часть workflow.
**SOM (5-летний горизонт):** $180M — компании, для которых CPP даёт ROI >300% в первый год.

## Инвестиционная стратегия

Три параллельных трека:

1. **Pre-seed ($500K-$1M):** Anthropic Startup Fund + OpenAI Fund + один CIS-based VC (Sber500/Phystech).
2. **Pilot revenue ($50K-$200K):** 3-5 pilot-контрактов с дружественным энтерпрайзом (Sber, MTS AI, G42).
3. **Research grant ($300K-$2M):** NSF SBIR / EU Horizon / KAUST research program — на validation feedback-loop hypothesis.

## Команда минимум жизнеспособного запуска

| Роль | FTE | Геолокация |
|---|---|---|
| Tech founder (architecture + protocol) | 1.0 | UAE/CIS |
| Research lead (canonical hashing + zkML) | 0.5 | EU/RU |
| Go-to-market lead | 1.0 | UAE/MENA |
| Senior infra engineer | 1.0 | RU/KZ |
| Crypto/security engineer | 0.5 | EU |
| **Итого** | **4.0** | |

## Ключевые риски (Top-3)

1. **Anthropic меняет cache-key логику** → 1 spec-update пилотов, см. §VII.
2. **Конкурент (Anthropic сам, Bittensor, Modal) опережает** → защита через open-standard позиционирование.
3. **Hash decay при апгрейде моделей** → static-validator-model протокол, см. §VII.

## Один абзац для investora

> «Мы строим каноническую инфраструктуру для верифицируемой провенансности AI-контекста. Сегодня это даёт enterprise клиентам 30-70% экономии на LLM input-токенах и audit-trail для compliance. Завтра — формирует training signal для следующего поколения моделей, где модели обучаются на крипто-верифицированных fact/calculation/effect графах вместо сырого текста. Мы первые, кто закрывает feedback loop на хэшах. Контракт с пилотным enterprise — Q3 2026. Первый канонический grant — Q4 2026.»

---

См. полный paper в `01-PAPER.md`.
