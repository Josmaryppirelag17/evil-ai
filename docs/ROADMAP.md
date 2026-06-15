# Roadmap

> Estado del proyecto: 🟢 **Completado — Maintenance Mode**

---

## Hitos alcanzados

| Hito | Estado | Fecha |
|---|---|---|
| Fundación (Next.js + TS + R3F) | ✅ | 2026-06-04 |
| Escena 3D + Observatorio | ✅ | 2026-06-04 |
| Clean Architecture + DB schema | ✅ | 2026-06-05 |
| Docker + CI/CD | ✅ | 2026-06-05 |
| Autenticación completa | ✅ | 2026-06-06 |
| Chat IA streaming + Groq | ✅ | 2026-06-06 |
| Virtual browser 4 modos | ✅ | 2026-06-06 |
| CRDT resolución conflictos | ✅ | 2026-06-06 |
| Chaos engineering 4 modos | ✅ | 2026-06-06 |
| WebSocket + Redis Pub/Sub | ✅ | 2026-06-06 |
| Tutorial + gamificación | ✅ | 2026-06-06 |
| Snapshots + time travel | ✅ | 2026-06-06 |
| i18n ES/EN | ✅ | 2026-06-06 |
| ChaosPanel UI conectado a API | ✅ | 2026-06-09 |
| Speed slider + auto-heal | ✅ | 2026-06-09 |
| Tests CRDT + E2E smoke | ✅ | 2026-06-10 |
| GPQF Level 5 — Portfolio Ready | ✅ | 2026-06-11 |
| Cierre y Maintenance Mode | ✅ | 2026-06-11 |

---

## Lo que NO se construyó (decisión consciente)

| Feature | Motivo |
|---|---|
| Email sending (nodemailer) | Los tokens de verificación se loguean en consola/DB. Suficiente para portafolio |
| Forgot/Reset password UI pages | API existe. La funcionalidad no es crítica para el propósito del proyecto |
| Multiusuario completo | WebSocket soporta presencia pero no colaboración en vivo. Excede el alcance MVP |
| Component unit tests | La escena 3D (2,676 líneas) no tiene tests. El costo de mockear R3F no justifica el beneficio para un portafolio |

---

## Futuro (solo si es necesario)

- Actualización de dependencias
- Corrección de vulnerabilidades
- No hay roadmap activo. El proyecto está cerrado.
