# Architecture Decisions

## Arquitectura

- **Next.js 16 App Router** con Clean Architecture + Feature-first
- **CSP nonce-based** con proxy para propagación de nonces
- **LoggerService** estructurado con contexto

## API

- **Groq** para AI Chat con personalidad villain
- **Serper.dev** para Google Search grounding
- **Web Speech API** para reconocimiento de voz y síntesis

## Seguridad

- Rate limiting por endpoint: Chat 10/min, Browser 5/min, Login 10/min
- CSP nonce strict-dynamic
- Migración a Next.js 16 con proxy middleware

## Analytics

- **Google Analytics 4** opt-in via `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `GAScript` component in atoms: renders null if env var empty, else loads gtag.js + init script
- CSP whitelist: `www.google-analytics.com` + `www.googletagmanager.com` en `connect-src`
- Componente `"use client"` renderizado en root layout `<body>`
- E2E: verificar que con ID vacío no se renderizan scripts

## Error Tracking

- **Sentry** via `@sentry/nextjs` con `withSentryConfig` en `next.config.ts`
- `instrumentation.ts` con `register()` y `onRequestError`
- Tres configs: client (replays), edge (server), server (DSN prioritario)
- `beforeSend` suprime envíos en desarrollo; `tracesSampleRate` 0.25 client / 0.1 edge / 0.5 server en prod
- CSP whitelist: `*.ingest.sentry.io` en `connect-src` (producción)
- Página de verificación: `/sentry-example-page`

## Testing

- 27 archivos de test con thresholds altos (90%)
- E2E con Playwright en CI
- Vitest para unit + integración
