# Deployment

## Plataforma

Vercel (Preview + Production).

## CI/CD

GitHub Actions en `.github/workflows/`:
- `ci.yml`: lint → test → build → E2E + SonarCloud
- `deploy.yml`: build + deploy a Vercel

## Estrategia

| Rama | Entorno | Disparador |
|---|---|---|
| `develop` | Staging (Vercel Preview) | Push |
| `main` | Production (Vercel Prod) | Push |
| Manual | Rollback | `workflow_dispatch` |

## Variables requeridas

```bash
DATABASE_URL, APP_URL, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN,
GROQ_API_KEY, SERPER_API_KEY
```
