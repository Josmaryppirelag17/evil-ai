# Error Handling

## LoggerService

Logger estructurado con contexto en `src/infrastructure/logger/`:

```typescript
const log = new Logger("Component");
log.info("mensaje");
log.error("error", err);
```

Niveles: `debug`, `info`, `warn`, `error`. Silenciado en producción.

## Sentry

Monitoreo client/server/edge con sampling:
- Client: 25%
- Server: 50%
- Edge: 10%

Solo producción.

## Rate limiting por endpoint

- Chat: 10 requests/min
- Browser simulation: 5/min
- Login: 10/min
