# Maintenance Guide

> Última actualización: 2026-06-11

---

## Estado

El proyecto está en **Maintenance Mode**. No hay desarrollo activo planificado.

---

## Permitido

- Corregir bugs
- Actualizar dependencias
- Parches de seguridad (rate limit en stream endpoint, account lockout)
- Mejoras pequeñas de UX sin reestructurar

## No permitido

- Rehacer UI
- Cambiar arquitectura
- Añadir sistemas grandes (plugins, marketplaces, multi-tenant)
- Cambiar concepto o identidad
- E-VIL v2 dentro del mismo proyecto

---

## Proceso de mantenimiento

### 1. Desarrollo local

```bash
pnpm dev              # Desarrollo local
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm test             # Tests unitarios
pnpm test:e2e         # Tests E2E
pnpm preflight        # Todo junto
```

### 2. Publicar cambios

```bash
pnpm preflight
git add -A
git commit -m "tipo: descripción"
git push
```

La pipeline de CI/CD despliega automáticamente.

### 3. Post-deploy

- Verificar en https://vil.josmarypirela.dev
- Revisar Sentry por errores nuevos
- Probar chat + virtual browser + búsqueda

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 |
| UI | React 19, Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| IA | Groq (Llama 3.3 70B) |
| Tiempo real | WebSocket + Redis Pub/Sub |
| Base de datos | Neon PostgreSQL + Drizzle ORM |
| Cache | Redis (ioredis) |
| Monitoreo | Sentry (client/server/edge) |
| CI/CD | GitHub Actions |
| Hosting | Vercel + Docker |
