# Changelog

> Formato basado en [Keep a Changelog](https://keepachangelog.com/) y [Semantic Versioning](https://semver.org/).

---

## [2.1.0] — 2026-06-15

### Removed
- Tabla `preferences` de schema DB (nunca usada en source)
- Type exports muertos de `schema.ts` (Session, NewSession, Message, etc.)
- `context/I18nProvider.tsx` redundante (mero re-export de `@/lib/i18n`)
- Path aliases muertos en `tsconfig.json` (`@core/*`, `@components/*`, etc.)
- `components.json` con paths rotos (`@/lib/utils` inexistente)

### Changed
- `generateToken`/`generateResetTokenString` unificadas (eran idénticas)
- `SESSION_KEY` consolidada en `AuthContext.tsx` y compartida via import
- Focus trap keyboard handler extraído a `useFocusTrap` hook (estaba duplicado 3x)
- Honeypot check extraído a `checkHoneypot()` en `api-error.ts` (duplicado en 3 routes)
- Migrados imports de `@/context/I18nProvider` a `@/lib/i18n`

### Added
- `authToken: process.env.SENTRY_AUTH_TOKEN` en `next.config.ts`

---

## [2.0.0] — 2026-06-11

### Cerrado
- Proyecto pasa a Maintenance Mode
- GPQF Level 5 alcanzado (Portfolio Ready)
- Documentación de cierre completada (PROJECT_STATUS, KNOWN_LIMITATIONS, MAINTENANCE)

---

## [1.6.0] — 2026-06-10

### Fixed
- Reemplazadas credenciales PostgreSQL hardcodeadas por env vars con defaults

### Added
- Tests CRDT unitarios + E2E smoke tests

---

## [1.5.0] — 2026-06-09

### Added
- Chaos events, recovery events, diverged keys a metrics endpoint
- Conexión de ChaosPanel UI a inject-failure API
- Speed slider en controles 3D overlay
- SimulationSpeed control + auto-heal después de chaos events

---

## [1.4.0] — 2026-06-08

### Docs
- README completo siguiendo formato de template del proyecto

### Chore
- Sonar scanner script + dependencia @google/genai

---

## [1.3.0] — 2026-06-07

### CI
- Migrado deploy a Vercel CLI
- Agregado SonarCloud analysis

---

## [1.2.0] — 2026-06-06

### Added
- Sistema de autenticación completo (register, login, session, password reset, email verify)
- Simulación 3D con 3 nodos (alpha, proxima, barnard)
- Virtual browser con 4 modos de vista
- CRDT resolución de conflictos LWW
- 4 modos de chaos engineering
- WebSocket + Redis Pub/Sub
- Tutorial interactivo 5 pasos
- Gamificación (4 misiones)
- Snapshots + time travel
- i18n ES/EN

---

## [1.1.0] — 2026-06-05

### Added
- Estructura Clean Architecture (domain/lib/core/presentation)
- DB schema (7 tablas) + Drizzle ORM + Neon PostgreSQL
- Docker + docker-compose
- CI/CD GitHub Actions

---

## [1.0.0] — 2026-06-04

### Added
- Inicio del proyecto
- Next.js + TypeScript strict + Tailwind CSS
- Escena 3D base con Three.js + R3F + Drei
- Layout principal con observatorio
