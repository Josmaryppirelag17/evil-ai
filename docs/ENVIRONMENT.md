# Environment Variables

Ver `.env.example` para variables requeridas.

## Archivos de entorno

| Archivo | Propósito |
|---|---|
| `.env.example` | Template |
| `.env.local` | Overrides locales (gitignored) |
| `.env.development` | Desarrollo |
| `.env.staging` | Staging |
| `.env.production` | Producción |

## Variables

| Variable | Descripción | Pública |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL | ❌ |
| `APP_URL` | Base URL | ❌ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | ✅ |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (source maps + releases) | ❌ |
| `GROQ_API_KEY` | Groq API key | ❌ |
| `SERPER_API_KEY` | Serper.dev API key | ❌ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID (opcional) | ✅ |
