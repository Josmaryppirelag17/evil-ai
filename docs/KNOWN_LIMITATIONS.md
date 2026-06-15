# Known Limitations

> Estado actual de limitaciones conocidas del proyecto. No se planea resolverlas a menos que se conviertan en blockers.

---

## 1. Rate limit en `/api/chat/stream`

~~El endpoint de streaming no tiene rate limiting configurado~~ ✅ Resuelto: rate limit 15/min implementado.

**Impacto:** Resuelto.

---

## 2. Account lockout no implementado

El schema de base de datos tiene columnas `failedAttempts` y `lockedUntil` pero la lógica de bloqueo por intentos fallidos no está implementada en el login.

**Impacto:** Bajo. Rate limiting ya mitiga ataques de fuerza bruta.

---

## 3. Context truncation no implementado

El historial completo de la conversación se envía a Groq sin límite de contexto. Sesiones muy largas podrían exceder tokens.

**Impacto:** Bajo. El límite de 4096 tokens de output es controlado por Groq.

---

## 4. Sin health check endpoint

No existe `/api/health` para monitoreo de disponibilidad.

**Impacto:** Bajo. Vercel maneja health checks internamente.

---

## 5. Sin email sending

Auth crea tokens de verificación de email pero no hay nodemailer/SMTP conectado para enviarlos.

**Impacto:** Bajo. Para un proyecto de portafolio, la verificación de email no es crítica.
