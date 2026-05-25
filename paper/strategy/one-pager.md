# Context Provenance Protocol
## One-pager для cold outreach

---

```
   ┌────────────────────────────────────────────────────────────┐
   │                                                            │
   │           ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                │
   │           ████ C P P  ▸  v1.0.0-rc.1 ████                   │
   │           ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                │
   │                                                            │
   │  Stripe for LLM context.  Open standard. Cross-provider.   │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
```

### Что мы делаем

**Content-addressed canonical encoding для LLM agentic harnesses.**

Когда несколько ИИ-агентов / разработчиков / пользователей загружают один и тот же контекст (codebase, документация, политики) — провайдер прячёт это под цифрами «total tokens». Мы делаем канонизацию, при которой:

- **Бит-в-бит идентичные** payload'ы получают идентичные хэши.
- Провайдерский prompt cache **гарантированно** срабатывает.
- Multi-agent системы получают **общий язык** для shared context.
- Все AI-решения становятся **криптографически верифицируемыми**.

### Зачем это бизнесу

```
┌──────────────────────────────────────────────────────────────┐
│   30-70%  экономии на input-токенах для команд с             │
│   ▔▔▔▔▔▔  shared-context workflow (codebase, docs, agents)   │
├──────────────────────────────────────────────────────────────┤
│   1000×   быстрее audit query "что AI видел в момент X"      │
│   ▔▔▔▔▔                                                       │
├──────────────────────────────────────────────────────────────┤
│   EU AI Act / GDPR / PDPL — out-of-the-box compliance        │
│   через signed Calculations + reproducible chain             │
├──────────────────────────────────────────────────────────────┤
│   Multi-agent coordination через CIDs вместо текстовых       │
│   blob'ов — основа для autonomous engineering teams          │
└──────────────────────────────────────────────────────────────┘
```

### Текущий статус

- ✅ **v1.0.0-rc.1** опубликован на github.com/agisota/cpp-core (MIT, public)
- ✅ 83 теста passing, CI green
- ✅ Full design document (492 строк)
- ✅ Reference implementation: TypeScript + Bun + IPLD + did:key + Ed25519
- 🔘 Empirical validation experiments (Q3 2026)
- 🔘 First 3-5 pilots (Q3 2026)
- 🔘 Pre-seed $500K-$1M (Q4 2026)

### Почему именно сейчас

```
                 2024            2025            2026            2027+
                  │               │               │               │
Multi-agent      │               │   ▲           │               │
adoption     ────┴───────────────┘   │           │               │
                                     │           │   ↑ explosion │
                                     │   ── ── ──┘               │
EU AI Act        │               │               │ FULL FORCE   │
                 │       ▲       │               │               │
RegTech AI       │ ── ── ┘       │               │ → mandatory   │
                                                                 │
LLM cost         │               │               │ becomes       │
optimization     ── ── ── ── ── ── ── ── ── ── ── major P&L     │
                                                                 │
CPP                                          ▲                   │
opportunity                                  │ 18-month window  │
window                            ── ── ── ──┘                   │
                                  to capture canonical layer    │
```

### Deep гипотеза

> Канонизация контекста — это не оптимизация затрат.
> Это формирование training signal для следующего поколения моделей.
> Тот, кто канонизирует первым — становится infrastructure layer.

### Team

- **Founder/CEO** — AI infrastructure architect; reference implementation lead
- **Research Lead** *(to hire)* — cryptography + zkML
- **GTM Lead** *(to hire)* — enterprise SaaS sales

### Ask

```
   ┌──────────────────────────────────────────────────────┐
   │                                                      │
   │   Pre-seed:  $500K — $1M                             │
   │   Stage:     Q3 2026                                 │
   │   Use:       4 hires + 5 pilots + research validation │
   │   Runway:    18 месяцев до Seed                       │
   │                                                      │
   │   Контакт:   founder@cpp.dev                         │
   │              github.com/agisota/cpp-core              │
   │                                                      │
   └──────────────────────────────────────────────────────┘
```

---

> Не хотим продавать «оптимизацию затрат».
> Хотим строить инфраструктуру для AI-economy.
> Cost saving — это way in.
