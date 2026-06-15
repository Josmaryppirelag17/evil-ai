# Operations Guide

## Monitoreo

| Herramienta | Propósito |
|---|---|
| Sentry | Error tracking (client/server/edge) |
| SonarCloud | Calidad de código |
| Vercel Dashboard | Métricas de deploy |

## CI/CD Pipeline

1. Push/PR → CI (lint → test → build → E2E → SonarCloud)
2. Push `develop` → Vercel Preview
3. Push `main` → Vercel Production
4. Rollback manual via `workflow_dispatch`

## Estado

Proyecto cerrado en **Maintenance Mode**. No hay desarrollo activo.
