# Runbook

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local
pnpm dev              # http://localhost:3000
```

## Comandos

```bash
pnpm dev              # Desarrollo
pnpm build            # Build producción
pnpm start            # Iniciar producción
pnpm test             # Tests unitarios
pnpm test:coverage    # Con coverage
pnpm test:e2e         # Tests E2E
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm preflight        # typecheck + lint + test
pnpm format           # Prettier
```
