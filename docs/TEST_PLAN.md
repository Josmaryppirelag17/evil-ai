# Test Plan

## Estado actual

| Tipo | Cantidad | Estado |
|---|---|---|
| Unitarios | 27 archivos | ✅ |
| Integración API | chat, search, browser | ✅ |
| E2E | Playwright | ✅ |

## Cobertura

| Métrica | Threshold |
|---|---|
| Statements | 90% |
| Branches | 80% |
| Functions | 90% |
| Lines | 90% |

## Ejecución

```bash
pnpm test            # Tests unitarios
pnpm test:coverage   # Con coverage
pnpm test:e2e        # E2E Playwright
pnpm test:all        # Unit + E2E
pnpm preflight       # typecheck + lint + test
```
