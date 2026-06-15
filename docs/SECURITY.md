# Security

## Headers

| Header | Valor |
|---|---|
| CSP | Nonce-based strict-dynamic |
| HSTS | Preload |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |

## Authentication

- bcryptjs (12 rounds)
- httpOnly cookies
- Rate limiting: Chat 10/min, Browser 5/min, Login 10/min
- Token reset 1h expiration
- Invalidación de sesiones en password reset

## Validación

- Zod en todas las rutas

## Resultados

| Auditoría | Resultado |
|---|---|
| Mozilla Observatory | **A+** (115/100) |
