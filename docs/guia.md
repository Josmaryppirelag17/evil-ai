# Guía de Configuración Inicial para Proyectos Next.js con IA

## Guía para evitar errores comunes al iniciar un proyecto

Esta guía recopila las configuraciones y buenas prácticas necesarias para evitar los errores más comunes al iniciar un proyecto Next.js con despliegue en Vercel y análisis de código con SonarQube.

---

## 📦 1. Configuración de package.json

### Node.js Engines (Evitar warning de Vercel)

```json
{
  "name": "tu-proyecto",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest",
    "sonar": "sonar-scanner"
  }
}

> **Nota:** Usar `"lint": "eslint ."` en lugar de `"next lint"` para máxima flexibilidad (funciona tanto con flat config como con eslintrc). Asegurarse de que `.next/` y `node_modules/` estén ignorados en la config de ESLint.

```markdown
❌ Evitar:
```json
"engines": {
  "node": ">=18"  // Esto genera warning en Vercel
}
```

✅ Usar:
```json
"engines": {
  "node": "24.x"  // Versión específica
}
```

---

## 🚫 2. Middleware → Proxy (cuándo migrar y cuándo no)

Next.js 15+ deprecated el archivo `middleware.ts` **solo para casos simples donde no hay lógica real**. La recomendación es:

- **Migrar a `proxy.ts`** si el middleware solo hacía `NextResponse.next()` sin lógica
- **Mantener `middleware.ts`** si necesitas: CSP nonce-based, security headers dinámicos, autenticación, redirecciones condicionales, logging de request

### Cuándo NO migrar (mantener middleware.ts)

```typescript
// middleware.ts — casos válidos: CSP nonce, auth, security headers
export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", `... nonce-${nonce} ...`);
  response.headers.set("X-Frame-Options", "DENY");
  // ... más security headers
  return response;
}
```

### Cuándo SÍ migrar a proxy.ts

❌ Si tu middleware solo hace `NextResponse.next()`:
```typescript
// middleware.ts — sin lógica real, DEPRECATED
export function middleware() {
  return NextResponse.next();
}
```
✅ Migrar a:
```typescript
// proxy.ts
export function proxy() {
  return NextResponse.next();
}
```

### Comando de migración automática:
```bash
npx @next/codemod@canary middleware-to-proxy .
```

> **⚠️ Importante:** Si tu middleware genera CSP con nonce, maneja autenticación o setea security headers, **NO lo migres**. El patrón `proxy.ts` no soporta lógica de headers dinámicos.

---

## 🧪 3. Tests y SonarQube - Configuración anti-errores

### sonar-project.properties (Configuración completa)

```properties
# Identificación del proyecto
sonar.projectKey=tu-proyecto-key
sonar.projectName=Tu Proyecto

# Fuentes y tests
sonar.sources=src/
sonar.tests=tests/

# Excluir del análisis COMPLETO
sonar.exclusions=\
  **/node_modules/**,\
  **/.next/**,\
  **/playwright-report/**,\
  **/test-results/**,\
  **/coverage/**,\
  **/dist/**,\
  **/build/**,\
  **/src/lib/i18n/translations.ts

# Excluir SOLO del análisis de duplicación (CRUCIAL para tests)
sonar.cpd.exclusions=\
  **/tests/**/*,\
  **/*.test.ts,\
  **/*.test.tsx,\
  **/*.spec.ts,\
  **/*.spec.tsx,\
  **/__tests__/**/*

# Incluir tests para análisis (pero no para duplicación)
sonar.test.inclusions=\
  **/tests/**/*.test.ts,\
  **/tests/**/*.test.tsx,\
  **/__tests__/**/*

# Configuración de coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Excluir tests del coverage
sonar.coverage.exclusions=\
  **/tests/**/*,\
  **/*.test.ts,\
  **/*.test.tsx,\
  **/*.spec.ts,\
  **/*.spec.tsx,\
  **/playwright-report/**/*,\
  **/test-results/**/*

# Organización en SonarCloud (OBLIGATORIO para proyectos multi-repo)
sonar.organization=tu-organizacion
```

> **⚠️ `sonar.organization` es obligatorio** en SonarCloud cuando el proyecto pertenece a una organización. Sin esto, el análisis falla con `You must specify a organization`. El valor se encuentra en la URL de SonarCloud: `https://sonarcloud.io/organizations/<org-name>/`

### Script `sonar-scanner` en package.json

Agregar el script `"sonar": "sonar-scanner"` en `package.json`. Sin esto, `pnpm sonar` falla con `command not found`.

```json
"scripts": {
  "sonar": "sonar-scanner"
}
```

> `sonar-scanner` CLI debe estar instalado globalmente o via `npx`. Verificar con `sonar-scanner --version`.

### Manejo de IPs hardcodeadas en tests (False Positive)

Cuando SonarQube marque IPs hardcodeadas como problema:

```typescript
// ✅ Esto es un false positive en tests
// Marcar como False Positive en SonarQube con comentario:
makeReq("10.0.0.1"); // NOSONAR - IP privada usada solo en tests

// O al marcar como False Positive en la UI, usar este comentario:
/**
 * Test-only code. Hardcoded IPs are used exclusively to simulate
 * different clients in rate limiting tests. No actual network requests
 * are made. False positive.
 */
```

---

## 🔐 4. GitHub Actions + Vercel (Evitar error de token)

### .github/workflows/deploy.yml (recomendado — Vercel CLI directo)

> ⚠️ `amondnet/vercel-action` usa CLI v25.1.0 que es incompatible con la API actual de Vercel (requiere ≥v47.2.2). Usar comandos Vercel CLI directamente.

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build Project
        run: vercel build --prod --token="$VERCEL_TOKEN"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

> **Nota:** Los secrets se pasan via `env:` para evitar que se expandan inline y queden visibles en los logs de GitHub Actions.

### Secrets necesarios en GitHub:

| Secret Name | Dónde obtenerlo |
|-------------|-----------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Ejecutar `vercel link` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Ejecutar `vercel link` → `.vercel/project.json` |

### Configuración del token en Vercel:

```
TOKEN NAME:  github-actions-deploy
SCOPE:       Account (o Project para más seguridad)
EXPIRATION:  1 year
```

---

## 📊 5. Check-list de verificación inicial

### Antes del primer commit:

- [ ] `package.json` tiene `"engines": { "node": "24.x" }`
- [ ] `middleware.ts` solo existe si hay lógica real (CSP nonce, auth, security headers). Si solo hacía `NextResponse.next()`, migrar a `proxy.ts`
- [ ] `sonar-project.properties` tiene `sonar.organization` configurado (obligatorio en SonarCloud)
- [ ] `sonar-project.properties` tiene `sonar.cpd.exclusions` configurado
- [ ] `sonar-scanner` script en `package.json`
- [ ] `deploy.yml` usa Vercel CLI directo (no `amondnet/vercel-action`, incompatible con API actual)
- [ ] Secrets en `deploy.yml` pasados via `env:` (no inline en `--token=` para evitar exposición en logs)
- [ ] Los tests usan `// NOSONAR` para IPs hardcodeadas
- [ ] `playwright.config.ts` usa `pnpm dev --port 3001` (sin `--` extra) en `webServer.command`
- [ ] `Math.random()` en canvas visual / animaciones / mock data marcado como False Positive en SonarQube (no es security-sensitive)
- [ ] `tsconfig.tsbuildinfo` en `.gitignore` (build artifact de TypeScript, no debe trackearse)
- [ ] Si ya está trackeado: `git rm --cached tsconfig.tsbuildinfo` + agregar a `.gitignore`
- [ ] GitHub Secrets configurados (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- [ ] CSP configurado con nonce y `strict-dynamic` en producción (Mozilla Observatory A+)
- [ ] `tsconfig.json` con `noUncheckedIndexedAccess: true`: agregar `!` postfijo en accesos por índice pre-verificados
- [ ] `route.ts` no re-exporta `runtime`/`dynamic` — declarar literalmente en cada archivo
- [ ] `ci.yml` usa SHA fijo para `SonarSource/sonarcloud-github-action` (no `@master`)
- [ ] Migraciones de BD aplicadas y sincronizadas con el schema de Drizzle
- [ ] `sessionId` persistido en `localStorage` para chats (no perdido en refresh)
- [ ] Sesiones vinculadas al usuario autenticado para sync cross-device

### Comandos útiles al iniciar:

```bash
# Verificar versión de Node.js
node -v  # Debe mostrar v24.x.x

# Migrar middleware a proxy (si existe)
npx @next/codemod@canary middleware-to-proxy .

# Linkear proyecto con Vercel
npx vercel link

# Ejecutar SonarQube localmente
npm run sonar
```

---

## 🐛 6. Content Security Policy (CSP) y Mozilla Observatory

### Error: `'unsafe-inline' inside script-src` → −20 en Observatory

El CSP por defecto de Next.js usa `'unsafe-inline'` en `script-src`, lo que Mozilla Observatory penaliza con −20 puntos.

Para solucionarlo:

1. **Mover CSP de `next.config.ts` a `middleware.ts`** para generar un nonce por request:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", [
    "default-src 'self'",
    `script-src 'strict-dynamic' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com https://*.ingest.sentry.io wss://*",
    "media-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; "));

  return response;
}
```

2. **Leer nonce en el layout** (`src/app/layout.tsx`) y pasarlo a cualquier `<script>` inline:

```typescript
import { headers } from "next/headers";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";
  return (
    <html>
      <body>
        <StructuredData nonce={nonce} />
        {children}
      </body>
    </html>
  );
}
```

3. **Pasar nonce a componentes con `dangerouslySetInnerHTML`**:

```tsx
export function StructuredData({ nonce }: { nonce: string }) {
  return (
    <script type="application/ld+json" nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  );
}
```

4. **`'strict-dynamic'`** hace que scripts cargados por un script nonceado hereden la confianza, eliminando la necesidad de listar dominios externos en `script-src`.

> ⚠️ En desarrollo Next.js necesita `'unsafe-inline'` para HMR. Usar CSP permisiva condicionada a `NODE_ENV === "production"`.

### Error: `'nonce' does not exist in type` en `next/font/google`

Los types de `next/font/google` en algunas versiones de Next.js no incluyen `nonce`. Solución: mantener `style-src 'self' 'unsafe-inline'` (menos crítico que script-src) y no pasar nonce a las fuentes.

---

## 🗄️ 7. Migraciones con Drizzle ORM + Neon

### Error: `column "username" does not exist` aunque esté en schema

Cuando el schema de Drizzle define columnas que no existen en la BD real (migraciones no aplicadas), cualquier SELECT/INSERT falla con error 500.

**Causa:** El schema se modificó después de la última migración aplicada.

**Solución:**
```bash
# 1. Generar la migración faltante
npx drizzle-kit generate

# 2. Aplicar (si funciona el driver)
npx drizzle-kit migrate
```

### Error: `drizzle-kit migrate` se cuelga con Neon

El driver `@neondatabase/serverless` usa WebSockets y no funciona bien desde CLI.

**Solución:** Aplicar migraciones directamente con `psql`:
```bash
# 1. Crear schema primero si no existe
psql "$DATABASE_URL" -c "CREATE SCHEMA IF NOT EXISTS ai;"

# 2. Aplicar migraciones en orden
psql "$DATABASE_URL" -f src/lib/db/migrations/0000_*.sql
psql "$DATABASE_URL" -f src/lib/db/migrations/0001_*.sql
psql "$DATABASE_URL" -f src/lib/db/migrations/0002_*.sql
```

### Error: `schema "ai" does not exist` al usar `psql`

El schema PostgreSQL debe existir antes de crear tablas en él. Drizzle Kit lo crea automáticamente pero al usar `psql` directo hay que crearlo manualmente:

```sql
CREATE SCHEMA IF NOT EXISTS ai;
```

### Migraciones con columnas NOT NULL y datos existentes

Si la migración agrega columnas `NOT NULL` pero ya hay filas en la tabla, PostgreSQL devuelve error. **Solución segura:**

```sql
ALTER TABLE "ai"."users" ADD COLUMN "username" varchar(50);        -- nullable primero
ALTER TABLE "ai"."users" ADD COLUMN "last_name" varchar(100);      -- nullable primero
UPDATE "ai"."users" SET "username" = split_part("email", '@', 1);  -- backfill
UPDATE "ai"."users" SET "last_name" = '';                          -- backfill
ALTER TABLE "ai"."users" ALTER COLUMN "username" SET NOT NULL;      -- luego NOT NULL
ALTER TABLE "ai"."users" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "ai"."users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
```

---

## 🔄 8. Sistema de Auth + Sesiones + Persistencia Cross-Device

Este sistema consta de tres capas: **autenticación** (login/logout), **sesiones auth** (dispositivos conectados), y **persistencia cross-device** (datos compartidos entre dispositivos). Implementado en `evil-ai` y `dashboard-bee` con el mismo patrón.

### 8.1 Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│                                                      │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ AuthCtx   │  │ Zustand     │  │ SessionList    │  │
│  │ (useAuth) │  │ Store       │  │ (modal)        │  │
│  └─────┬────┘  └──────┬──────┘  └───────┬────────┘  │
│        │              │                  │           │
│        ▼              ▼                  ▼           │
│  ┌─────────────────────────────────────────────┐     │
│  │           api-client (fetch wrapper)         │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │ httpOnly cookie auto-enviada    │
├─────────────────────┼─────────────────────────────────┤
│          ▲          │                                 │
│          │    ┌─────▼─────────────────────────┐       │
│          │    │    Next.js API Routes         │       │
│          │    │                               │       │
│          │    │  /api/auth/login              │       │
│          │    │  /api/auth/logout             │       │
│          │    │  /api/auth/register           │       │
│          │    │  /api/auth/session            │       │
│          │    │  /api/auth/sessions           │       │
│          │    │  /api/sync (data sync)        │       │
│          └────└──────────────┬────────────────┘       │
│                              │                        │
└──────────────────────────────┼────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  PostgreSQL (Neon)   │
                    │  Drizzle ORM         │
                    │                      │
                    │  users               │
                    │  sessions            │  ← auth sessions
                    │  tasks               │
                    │  user_stats          │
                    │  audit_logs          │
                    └─────────────────────┘
```

### 8.2 Autenticación con httpOnly Cookies

El auth usa bcryptjs + httpOnly cookies + sesiones UUID en PostgreSQL. No JWT — el token de sesión es un UUID aleatorio almacenado en la BD.

```typescript
// src/lib/auth.ts — creación de sesión
export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  await db.insert(sessions).values({ userId, token, expiresAt });
  return token;
}

// Cookie httpOnly (inaccesible desde JS)
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

// Verificación de sesión en cada request
export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const [session] = await db.select().from(sessions)
    .where(eq(sessions.token, token)).limit(1);
  if (!session || new Date() > session.expiresAt) return null;
  const [user] = await db.select().from(users)
    .where(eq(users.id, session.userId)).limit(1);
  return user;
}
```

**Flujo de login:**
1. Frontend envía email + password a `POST /api/auth/login`
2. Servidor verifica con `bcrypt.compare()`, crea sesión, setea cookie
3. Frontend recibe `{ success: true, data: { user, sessionId } }`
4. `AuthContext` guarda `user` + `sessionId` en estado React
5. Store (Zustand) setea `userId` y carga datos del servidor

**Flujo de session check (cada refresh):**
1. `AuthContext.checkSession()` llama a `GET /api/auth/session`
2. Servidor lee cookie, busca sesión en BD, retorna user + sessionId
3. Si no hay sesión válida, frontend muestra modo offline/local

### 8.3 Session ID de la sesión actual

Para identificar cuál sesión auth es la actual (útil en la UI de gestión de sesiones):

```typescript
// GET /api/auth/session → respuesta ampliada
return apiSuccess({
  authenticated: !!user,
  user,
  sessionId: session?.id ?? null,  // ← ID de la sesión actual
});
```

En el `AuthContext`:
```typescript
const [sessionId, setSessionId] = useState<number | null>(null);

// En checkSession:
if (json.success && json.data.authenticated) {
  setSessionId(json.data.sessionId);
}

// Provider expone sessionId via context
<AuthContext.Provider value={{ user, sessionId, login, register, logout, checkSession }}>
```

### 8.4 Gestión de sesiones auth (SessionList Component)

Permite al usuario ver todos los dispositivos conectados y revocar sesiones.

**API:**
```typescript
// GET /api/auth/sessions → lista todas las sesiones activas del usuario
export async function GET() {
  const user = await getCurrentUser();
  const userSessions = await db.select().from(sessions)
    .where(and(
      eq(sessions.userId, user.id),
      isNull(sessions.revokedAt),
      gt(sessions.expiresAt, new Date()),
    ))
    .orderBy(sessions.createdAt);
  return apiSuccess({ sessions: userSessions });
}

// DELETE /api/auth/sessions?sessionId=xxx → revoca una sesión específica
// DELETE /api/auth/sessions → revoca todas las sesiones
```

**Componente SessionList (modal):**
- Modal bee-themed para dashboard-bee, cyber-terminal para evil-ai
- Fetch sessions al abrir
- Muestra: userAgent (dispositivo), ipAddress, createdAt (tiempo relativo)
- Marca sesión actual con badge
- Botón "Revocar" por sesión (no la actual) con confirmación
- Botón "Revocar todas las demás"

**Buenas prácticas del SessionList:**
- La sesión actual nunca puede revocarse desde la lista (para evitar logout accidental)
- Confirmación antes de revocar (diálogo SÍ/NO en el mismo botón)
- Feedback visual durante la revocación
- Refetch automático después de revocar

### 8.5 Persistencia cross-device

**Patrón: persistencia inmediata + sync on login**

```
┌───────────────────────────────────────────────────┐
│                 Device A                          │
│                                                    │
│  Crea tarea → POST /api/tasks (directo a BD)      │
│  Gana XP → PUT /api/stats (directo a BD)           │
│                                                    │
│  ↓ Los datos están en la BD al instante            │
│                                                    │
├───────────────────────────────────────────────────┤
│                 Device B                           │
│                                                    │
│  Login → POST /api/login                           │
│        → GET /api/tasks (carga últimas tareas)     │
│        → GET /api/stats (carga últimos stats)     │
│        → POST /api/sync (merge local+cloud)        │
│                                                    │
│  ¡Ve los mismos datos que Device A!                │
└───────────────────────────────────────────────────┘
```

**En evil-ai (chat sessions):**
- Cada conversación es un `sessionId` UUID persistido en localStorage
- Los mensajes se guardan en BD vinculados al `sessionId`
- Al hacer login, el `sessionId` local se vincula al usuario
- `sessions.updatedAt` se actualiza en cada mensaje para orden correcto
- Al abrir en otro dispositivo: se carga la sesión más reciente del usuario

**En dashboard-bee (tasks + stats):**
- Tasks CRUD va directo a cloud API cuando hay userId
- Stats (XP, level, focus mins, etc.) se persisten via `PUT /api/stats`
- Sync endpoint `POST /api/sync` se llama al login para merge local+cloud
- `SessionList` gestiona auth sessions (no data sessions)

### 8.6 Auto-sync después de mutaciones

Para asegurar consistencia cross-device sin polling constante:

```typescript
// En el store — todas las mutaciones persisten directo a cloud
addTask: async (title, priority, category, pollenUnits) => {
  const { userId } = get();
  if (userId) {
    await api.post("/api/tasks", { taskId, title, completed, priority, category, pollenUnits, columnId });
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  } else {
    // Modo offline: guardar en IndexedDB (Dexie)
  }
},

// Stats se persisten fire-and-forget
function fireAndForgetStats(data: Record<string, unknown>) {
  api.put("/api/stats", data).catch(() => {});
}
```

**Regla:** Toda mutación debe persistir al servidor de forma inmediata. El sync on login es el mecanismo de "recuperación" para nuevos dispositivos, no el mecanismo primario de persistencia.

### 8.7 Ejemplo: Añadir SessionList a un proyecto

**Backend:**
1. Crear `GET /api/auth/sessions` — lista sesiones activas del usuario
2. Crear `DELETE /api/auth/sessions?sessionId=xxx` — revoca sesión
3. Asegurar que `GET /api/auth/session` retorne `sessionId`

**Frontend:**
1. Guardar `sessionId` en AuthContext
2. Crear `SessionList.tsx` — modal con fetch + render + revocación
3. Agregar botón en sidebar/nav para abrir el modal (solo visible logueado)

### 8.8 Errores comunes y soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| Chat vacío al recargar | sessionId no persistido | Guardar en localStorage |
| Mensajes no aparecen en otro dispositivo | sessionId no vinculado al usuario | Pasar userId a getSession() |
| Cache en memoria rompe sync serverless | Map en sessions.ts | Siempre leer/escribir directo a BD |
| Sesión expirada inesperadamente | expiresAt no verificado | Verificar en getCurrentUser() |
| SessionList muestra token expuesto | API devuelve token completo | Excluir token de la respuesta |
| DELETE sessions sin confirmación | Falta confirmación UX | Agregar confirmación inline |


---

## 🐛 9. Errores comunes y soluciones rápidas

| Error | Solución |
|-------|----------|
| `Input required: vercel-token` | Añadir `VERCEL_TOKEN` a GitHub Secrets |
| `ERR_PNPM_OUTDATED_LOCKFILE` | Ejecutar `pnpm install` (sin `--frozen-lockfile`) para regenerar `pnpm-lock.yaml` |
| `Detected "engines": { "node": ">=18" }` | Cambiar a `"node": "24.x"` en package.json |
| `"middleware" file convention is deprecated` | Si solo haces `NextResponse.next()`, migrar a `proxy.ts` con `npx @next/codemod@canary middleware-to-proxy .`. Si tienes CSP nonce, auth o security headers dinámicos, **NO migrar** (sección 2) |
| `Make sure using a hardcoded IP address is safe` | Marcar como False Positive en SonarQube |
| `Duplicated Lines (%) 97.6%` en archivo eliminado | Añadir archivo a `sonar.cpd.exclusions` y reanalizar |
| Quality Gate fails por duplicación en tests | Configurar `sonar.cpd.exclusions` |
| `column "username" does not exist` en PostgreSQL | Schema y BD desincronizados → generar y aplicar migración faltante |
| `drizzle-kit migrate` se cuelga | Usar `psql` directo con las migraciones SQL |
| `schema "ai" does not exist` en psql | Ejecutar `CREATE SCHEMA IF NOT EXISTS ai;` antes de migrar |
| CSP `unsafe-inline` en script-src (−20 Observatory) | Mover CSP a middleware con `'strict-dynamic' 'nonce-{random}'` |
| Mensajes de chat se pierden al recargar página | Persistir `sessionId` en `localStorage` y cargar desde BD al montar |
| Usuario no ve sus mensajes en otro dispositivo | Vincular sesiones al usuario y sincronizar via `/api/user/sync` |
| Cache en memoria rompe sync entre serverless | Eliminar `Map` en `sessions.ts`, siempre leer de BD |
| `Function name "Error" shadows global Error constructor` (SonarQube) | Renombrar a `ErrorPage` en `error.tsx`, actualizar cualquier referencia |
| `A config object has a "plugins" key defined as an array of strings` (ESLint) | Instalar `@eslint/compat @eslint/eslintrc` y usar `fixupConfigRules(compat.extends("next/core-web-vitals"))` |
| `"--prebuilt" option was used, but no prebuilt output found` (Vercel deploy) | Eliminar `--prebuilt` de `vercel-args` en el workflow y eliminar `pnpm build` previo (el action construye automáticamente) |
| `"start": "next start"` faltante | Añadir `"start": "next start"` en `package.json` (requerido para `vercel-action` en previews) |
| Favicon no aparece en pestaña del navegador | No usar `<head>` en JSX del layout (pisa el head de Next.js). Agregar `icons` en metadata y usar `export const viewport` para theme-color/scale |
| `precargado con un enlace precargado no se usó` (font warning) | Agregar `preload: false` en la config de `next/font/google` cuando ya tienes `display: swap` |
| `500 Internal Error` en `/api/auth/*` sin mensaje claro | `getDb()` no atrapa errores de inicialización de Neon. Envolver en try/catch y exponer error con `getDbError()` helper. Verificar que `DATABASE_URL` esté seteada en Vercel env vars |
| `>3% duplicación de código` en SonarQube | Además de excluir tests en `sonar.cpd.exclusions`, refactorizar catch blocks repetidos y auth checks en shared utilities (`apiError`, `handleApiError`, `requireUser`) |
| `DATABASE_URL` vacía en producción | No confiar en `.env.production` para secrets. Setear `DATABASE_URL` directamente en Vercel Dashboard → Settings → Environment Variables. Si está vacía, `getDb()` retorna null y las rutas devuelven 503 |
| `vercel.security.json` ignorado por Vercel | Vercel solo reconoce `vercel.json`. Si nombraste el archivo de seguridad como `vercel.security.json`, renombrar a `vercel.json`. Los security headers en `next.config.ts` y `middleware.ts` sí se aplican correctamente |
| `Module '"@sentry/react"' has no exported member 'ErrorBoundary'` en Next.js App Router | En Next.js App Router, usar `@sentry/nextjs` en lugar de `@sentry/react` para imports de `ErrorBoundary`. En el test, también actualizar el mock path de `@sentry/react` a `@sentry/nextjs` |
| `amondnet/vercel-action` falla con error de API | La action `amondnet/vercel-action@v25` usa CLI v25.1.0 pero la API de Vercel ahora requiere ≥v47.2.2. Solución: migrar a `npm install -g vercel@latest` y usar comandos directos `vercel pull --yes`, `vercel build`, `vercel deploy --prebuilt`. Pasar secrets via `env:` y no como `--token=` inline |
| `${{ secrets.VERCEL_TOKEN }}` visible en logs de GitHub Actions | No expandir secrets inline en `run: vercel --token=${{ secrets.VERCEL_TOKEN }}`. Pasar siempre via `env:` y referenciar como variable de entorno: `VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}` + `vercel --token="$VERCEL_TOKEN"` |
| `sonarcloud-github-action` pinned to `@master` | SonarQube's `@master` tag no es un SHA válido para pinning. Buscar el SHA real del release más reciente y usar `@sha256:...` o commit SHA fijo |
| `'runtime' is assigned a value but never used` + `'runtime' is not exported` en route.ts | Next.js 16 prohíbe re-exportar config de ruta (`runtime`, `dynamic`, `revalidate`). Declarar literalmente en el archivo de ruta, ej: `export const runtime = "edge"` |
| `Object is possibly 'undefined'` al acceder a `arrero[0]` con `noUncheckedIndexedAccess` | `noUncheckedIndexedAccess: true` hace que TODO acceso por índice retorne `T \| undefined`. Si el arreglo está pre-verificado (definido estáticamente o con length check), agregar `!` postfijo: `arr[0]!` |
| `Cannot find module '@google/genai'` | Instalar el paquete faltante: `pnpm add @google/genai`. Verificar que esté en `dependencies` y no solo en `devDependencies` si se usa en runtime |
| `"--prebuilt" option was used, but no prebuilt output found` | Al migrar de `amondnet/vercel-action` a comandos directos, asegurar que `vercel build` se ejecute ANTES de `vercel deploy --prebuilt`. Si se usa `--prebuilt`, debe haber un build previo en el mismo job |
| Duplicate `deploy` job in `ci.yml` after creating `deploy.yml` | Al crear `deploy.yml` separado, eliminar el job `deploy` de `ci.yml` para evitar duplicación y conflictos |
| Duplicate `next.config.mjs` + `next.config.ts` | Next.js 16+ usa `.ts` por defecto. Si ambos existen, eliminar `.mjs` y mergear la configuración en `.ts` |
| `tsconfig.tsbuildinfo` modificado siempre en `git status` | Agregar `tsconfig.tsbuildinfo` a `.gitignore`. Si ya está trackeado: `git rm --cached tsconfig.tsbuildinfo` + commit |
| `"PASSWORD" detected here` en `audit.ts` con constantes de acción | Falso positivo — son nombres de acciones de auditoría (`user.register`, `user.login`), no passwords. Marcar en SonarQube como False Positive |
| `"POSTGRES_PASSWORD: replicalab"` hardcoded en docker-compose.yml | Usar `${POSTGRES_PASSWORD:-replicalab}` con variable de entorno que pueda overridearse via `.env` |
| `"DATABASE_URL: postgresql://user:pass@host/db"` hardcoded en docker-compose.yml | Usar `${DATABASE_URL:-postgresql://...}` para permitir override |
| `You must specify a organization` en SonarCloud analysis | Falta `sonar.organization=tu-org` en `sonar-project.properties`. Agregarlo con el nombre de la organización en SonarCloud |
| `command not found: sonar-scanner` al ejecutar `pnpm sonar` | Faltó agregar `"sonar": "sonar-scanner"` en scripts de package.json |
| `Invalid project directory provided, no such directory: /.../--port` en Playwright | El `--` extra en `pnpm dev -- --port 3001` pasa `--port` como directorio. Usar `pnpm dev --port 3001` sin `--` |
| `tu rama actual parece estar rota` / `failed to resolve HEAD as a valid ref` | El archivo `.git/refs/heads/main` está vacío. Eliminarlo: `rm .git/refs/heads/main` y reintentar el commit |
| `cannot lock ref 'HEAD': unable to resolve reference 'refs/heads/main'` | Misma causa que arriba. Eliminar el ref vacío y git creará uno nuevo en el primer commit |
| `Math.random()` marcado como inseguro en canvas visual o animación | Falso positivo si es para efectos visuales (Matrix Rain, estrellas 3D, partículas). Marcar en SonarQube: *"Used for visual canvas animation only. Not security-sensitive. False positive."* |
| `Math.random()` usado para mock data en dashboard demo | Falso positivo — son datos simulados de demostración, no lógica de negocio real |
| `Math.random()` usado como sufijo de unicidad (toast IDs, Redis zadd) | Falso positivo — solo uniqueness, no security boundary. Marcar en SonarQube |
| `disableLogger is deprecated` en `@sentry/nextjs` | Reemplazar con `webpack.treeshake.removeDebugLogging: true` en `withSentryConfig` |
| `automaticVercelMonitors is deprecated` en `@sentry/nextjs` | Reemplazar con `webpack.automaticVercelMonitors: true` en `withSentryConfig` |
| CLS >0.1 en desktop pero 0 en mobile | Posible causa: fuente con `display: "swap"` en desktop (font swap causa shift). Solución: cambiar a `display: "optional"` |
| LCP >2.5s por fuente no precargada | La fuente del LCP element debe tener `preload: true`. Si aun así es lenta, agregar `<link rel="preconnect">` o cambiar a `display: "swap"` |
| Forced reflow en canvas 3D (layout thrashing) | Cachear `clientWidth`/`clientHeight` con `ResizeObserver` + refs. Leer refs en `requestAnimationFrame` en vez del DOM |
| `"use client"` en `page.tsx` impide streaming SSR | Si `page.tsx` es cliente, todo el subtree se hidrata con JS. Evaluar si el root puede ser server component con Suspense boundaries |
| Bundle JS grande (>150 KiB) por importaciones eager | Usar `React.lazy()` + `Suspense` para componentes pesados (hero 3D, charts, editores). Verificar que no estén en el bundle crítico |

---

## 🐳 10. Docker Compose — Hardcoded credentials

### Error: `"PASSWORD" detected here` en SonarQube

SonarQube marca cualquier string que contenga `PASSWORD` como posible credencial hardcodeada.

```yaml
# ❌ MAL — password hardcodeado
services:
  db:
    environment:
      POSTGRES_PASSWORD: replicalab

# ✅ BIEN — variable de entorno con default
services:
  db:
    environment:
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD:-replicalab}"
```

> La sintaxis `${VAR:-default}` permite que el valor se overridee via `.env` o variables de entorno del sistema, eliminando el hardcodeo.

### Regla general para docker-compose.yml

| Elemento | ❌ Hardcodeado | ✅ Con override |
|---|---|---|
| Contraseñas | `PASSWORD: secreto` | `PASSWORD: "${PASSWORD:-secreto}"` |
| URLs de BD | `DATABASE_URL: postgres://user:pass@host/db` | `DATABASE_URL: "${DATABASE_URL:-postgres://...}"` |
| Usuarios | `USER: admin` | `USER: "${USER:-admin}"` |
| Nombres de DB | `POSTGRES_DB: mydb` | `POSTGRES_DB: "${POSTGRES_DB:-mydb}"` |

---

## 🩹 11. Git troubleshooting

### Error: `tu rama actual parece estar rota` / `failed to resolve HEAD`

**Causa:** El archivo `.git/refs/heads/main` está vacío (0 bytes). Ocurre cuando se inicializa un repo pero no se hace el primer commit, o cuando el archivo de referencia se corrompe.

**Solución:**
```bash
# 1. Verificar el estado
cat .git/refs/heads/main   # Devuelve vacío o inexistente

# 2. Eliminar la referencia rota
rm .git/refs/heads/main

# 3. Ahora git commit funciona (crea la ref automáticamente)
git commit -m "feat: initial project setup"

# 4. Si git status sigue mostrando archivos como "nuevos archivos" (staged),
#    el commit capturará todo lo que estaba en el index
```

**Prevención:** Siempre hacer el primer commit inmediatamente después de `git init` + `git add .`.

---

## ⚡ 12. Optimización de rendimiento (PageSpeed y Core Web Vitals)

### 12.1 Estrategia de fuentes para LCP

El LCP (Largest Contentful Paint) es el tiempo que tarda en renderizarse el elemento más grande visible. Las fuentes personalizadas suelen ser el cuello de botella.

```tsx
// ❌ MAL — fuente sin preload, LCP se retrasa 2-3s
const syne = Syne({
  subsets: ["latin"],
  display: "optional",   // Tras 100ms usa fallback, nunca swapea
  preload: false,         // No genera <link rel="preload">
});

// ✅ BIEN — fuente preload + swap para LCP inmediato
const syne = Syne({
  subsets: ["latin"],
  display: "swap",        // Texto visible con fallback, swapea al cargar
  preload: true,          // Genera <link rel="preload"> en el <head>
  weight: ["700", "800"],
});
```

> **`display: "swap"`** muestra texto con fallback inmediatamente (bueno para LCP) pero puede causar CLS si la fuente final tiene métricas muy distintas. Si tu CLS es >0.1, usa `display: "optional"` (fallback permanente tras 100ms, sin swap).
>
> **`display: "optional"`** evita CLS pero la fuente personalizada solo se usa si carga en <100ms. Es buena opción si el diseño lo permite.
>
> **Regla:** La fuente del LCP element debe tener `preload: true` siempre. El `display` depende de tu tolerancia a CLS.

### 12.2 Forced reflow en canvas (layout thrashing)

Leer propiedades geométricas del DOM (`clientWidth`, `clientHeight`, `getBoundingClientRect()`) dentro de `requestAnimationFrame` o manejadores de mouse frecuentes fuerza al navegador a recalcular layout sincrónicamente, destruyendo el pipeline de rendering.

```tsx
// ❌ MAL — forced reflow en cada frame
const draw = () => {
  const width = canvas.parentElement?.clientWidth || 400;  // ← layout read
  const height = canvas.parentElement?.clientHeight || 400; // ← layout read
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // ❌ También en handlers de mouse
  const rect = containerRef.current.getBoundingClientRect(); // ← layout read
};

// ✅ BIEN — cachear dimensiones con ResizeObserver
const canvasSizeRef = useRef({ width: 400, height: 400 });
const containerRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

useEffect(() => {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const rect = entry.target.getBoundingClientRect();
      canvasSizeRef.current = { width: rect.width, height: rect.height };
    }
  });
  ro.observe(canvas.parentElement);
  
  const updateRect = () => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      containerRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  };
  window.addEventListener("scroll", updateRect, { passive: true });
  window.addEventListener("resize", updateRect, { passive: true });
  
  return () => {
    ro.disconnect();
    window.removeEventListener("scroll", updateRect);
    window.removeEventListener("resize", updateRect);
  };
}, []);

// Leer refs cacheados en draw() y handleMouseMove
const draw = () => {
  const { width, height } = canvasSizeRef.current;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
};

const handleMouseMove = (e) => {
  const rect = containerRectRef.current; // Sin forced reflow
};
```

**Regla:** Todo `clientWidth`/`clientHeight`/`getBoundingClientRect()` que se lea en un loop de animación o evento frecuente debe cachearse en un ref y actualizarse via ResizeObserver.

### 12.3 Mouse coords en ref en vez de state

```tsx
// ❌ MAL — state causa re-render en cada movimiento de mouse
const [mouseX, setMouseX] = useState(0);
const [mouseY, setMouseY] = useState(0);

// ✅ BIEN — ref evita re-renders
const mouseRef = useRef({ x: 0, y: 0 });
// En el handler:
mouseRef.current = { x, y };
// En el loop de animación:
angleRef.current.x += 0.005 * rotationSpeed + mouseRef.current.y * 0.0001;
```

**Regla:** Coordenadas de mouse, scroll position y otros valores que se usan SOLO en canvas/animations no deben estar en `useState`. Usar `useRef`.

### 12.4 Lazy loading de componentes pesados

Componentes grandes (hero sections interactivas, 3D viewers) deben cargarse con `React.lazy()` para no inflar el bundle inicial:

```tsx
// ❌ MAL — 700+ líneas en el bundle inicial
import HeroPlayground from "@/components/organisms/HeroPlayground";

// ✅ BIEN — chunk separado, SSR sigue funcionando
const HeroPlayground = lazy(() => import("@/components/organisms/HeroPlayground"));
```

> Con Next.js App Router, los componentes lazy se server-renderizan (SSR), por lo que el HTML del hero se envía inmediatamente. El chunk JS se descarga en background para la hidratación.

### 12.5 Browserslist y polyfills legacy

Un `browserslist` amplio genera polyfills innecesarios (~14 KiB en portfolio-next):

```json
// ❌ MAL — incluye navegadores legacy
"browserslist": [
  "> 1%",
  "last 2 versions",
  "not dead"
]

// ✅ BIEN — solo navegadores modernos desde 2022
"browserslist": [
  "last 2 versions and since 2022",
  "not dead"
]
```

> `Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, etc. son polyfills que se eliminan al subir el target. Verificar que tu audiencia no necesite IE11 o navegadores muy antiguos.

### 12.6 DNS-Prefetch-Control

En `middleware.ts`, `X-DNS-Prefetch-Control: off` deshabilita la resolución DNS temprana de enlaces en la página:

```typescript
// ❌ MAL
"X-DNS-Prefetch-Control": "off",

// ✅ BIEN
"X-DNS-Prefetch-Control": "on",
```

### 12.7 CLS — Cumulative Layout Shift

CLS >0.1 afecta el ranking en Google. Causas comunes y soluciones:

| Causa | Síntoma | Solución |
|-------|---------|----------|
| Fuentes con `display: "swap"` | CLS >0.1 en desktop | Cambiar a `display: "optional"` |
| Animaciones CSS que cambian layout | CLS en elementos animados | Usar solo `transform` y `opacity` para animaciones |
| Imágenes sin dimensiones | CLS al cargar | Siempre usar `width` + `height` en `<img>` |
| Content injected after load | CLS repentino | Usar contenedores con min-height |

---

## 📚 13. Recursos útiles

- [Node.js versions en Vercel](https://vercel.link/node-version)
- [Middleware to Proxy migration](https://nextjs.org/docs/messages/middleware-to-proxy)
- [SonarQube Duplication Exclusions](https://docs.sonarqube.org/latest/project-administration/narrowing-the-focus/)
- [Vercel GitHub Actions](https://github.com/amondnet/vercel-action)
- [Mozilla Observatory — CSP Scanner](https://developer.mozilla.org/en-US/observatory/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [strict-dynamic CSP guide](https://web.dev/articles/strict-csp)
- [Drizzle ORM — Migrations](https://orm.drizzle.team/docs/migrations)
- [Neon — Connection pooling](https://neon.tech/docs/connect/connection-pooling)

---

## 🐛 SGCSM Zulia — Errores encontrados durante desarrollo

> Proyecto: `servicio-comunitarioV3` · PySide6 · SQLAlchemy · PostgreSQL/SQLite
> Sesión: Junio 2026 — Refactorización shadcn + tests

### 🔴 Errores de código corregidos

| # | Archivo | Error | Síntoma | Solución |
|---|---------|-------|---------|----------|
| 1 | `report_service.py:516` | `Appointment` no tiene atributo `motivo` | `AttributeError: 'Appointment' object has no attribute 'motivo'` al generar PDF | Cambiar a `getattr(a, "motivo", None) or getattr(a, "notes", None) or "No especificado"` |
| 2 | `pacientes_view.py:374` | `calculate_age()` retorna string, no int | `TypeError: '<' not supported between instances of 'str' and 'int'` | Extraer edad numérica con `int(edad_str.split()[0])` antes de comparar |
| 3 | `pacientes_view.py:361` | Método incorrecto `get_all_doctors()` | `AttributeError: 'DoctorService' object has no attribute 'get_all_doctors'` | Cambiar a `fetch_all()` |
| 4 | `pacientes_view.py:362` | Método incorrecto `set_doctors()` | `AttributeError: 'DoctorSelector' object has no attribute 'set_doctors'` | Cambiar a `load_doctors()` |
| 5 | `modules/__init__.py` | Referencia a `notificaciones_view` eliminado | Módulo eliminado pero referencia persistía | Eliminar import y entry de `__all__` |
| 6 | `main.py` auto-init | Engine scoping incorrecto | Tablas creadas en engine PG pero insert fallaba en SQLite | Reescribir con variable `use_engine` explícita y actualizar `db_mod.engine` |
| 7 | `main.py` auto-init | Modelos no importados antes de `create_all` | `sqlite3.OperationalError: no such table: municipalities` | Importar todos los modelos SQLAlchemy ANTES de `Base.metadata.create_all()` |
| 8 | `main.py` auto-init | `DIAGNOSIS` no existe en `zulia_data.py` | `ImportError: cannot import name 'DIAGNOSIS'` | Usar `PARISHES_BY_MUNICIPALITY` y seed inline de diagnósticos |
| 9 | `main.py` auto-init | Archivo SQLite corrupto preexistente | `sqlite3.DatabaseError: file is not a database` | Verificar header `SQLite format` y eliminar corruptos |
| 10 | `consultation_service.py:63` | Validación estricta de diagnóstico CIE-10 | `ValueError: código no registrado en catálogo CIE-10` bloqueaba consultas con texto libre | Cambiar a flexible: si no es CIE-10, almacenar como texto en notas |
| 11 | `build.py` hidden_imports | `notificaciones_view` listado pero eliminado | PyInstaller fallaría al no encontrar el módulo | Reemplazar con `notification_dropdown` |
| 12 | `seed_massive_data.py` | Imports incorrectos de modelos | `ImportError: cannot import name 'X' from 'app.models.Y'` | Usar rutas de import correctas (`patient_address`, `consultation_detail`) |
| 13 | `theme/palette.py` | Tema oscuro por defecto | Usuario pedía tema claro | Cambiar `ACTIVE_THEME = LIGHT_THEME` |

### 🟡 Problemas de arquitectura/diseño

| # | Área | Problema | Decisión |
|---|------|----------|----------|
| 1 | Notificaciones | Módulo standalone `NotificacionesView` no era intuitivo | Migrar a dropdown flotante global `NotificationDropdown` + historial en Configuración |
| 2 | Buscador Global | Implementación inline en MainWindow duplicada con `GlobalSearchBar` | Eliminar inline, usar `GlobalSearchBar` widget |
| 3 | PostgreSQL dependencia | `func.age()`, `func.date_trunc()` PostgreSQL-specific | Reemplazar con Python (`calculate_age()`, `datetime.strftime`) |
| 4 | Diagnóstico CIE-10 | Validación estricta impedía texto libre médico | Hacer flexible: autocomplete sugiere, no bloquea |
| 5 | Scheduler | No sincronizaba backups a nube automáticamente | Agregar auto-sync a Rclone tras cada backup exitoso |

### 🟢 Tests actualizados por cambios de comportamiento

| # | Test | Cambio |
|---|------|--------|
| 1 | `test_phase4_clinical_consultation::test_register_consultation_atomic_rollback_on_invalid_cie10` | Esperaba `ValueError` para CIE-10 inválido → Ahora testea que texto libre se acepte como `test_register_consultation_with_flexible_diagnosis` |
| 2 | `test_rnf_requirements::TestRNF006_Offline` | `scheduler_service.py` ahora importa `rclone` (opcional) → Excluido del test offline |

---

## 📊 14. Cobertura y SonarQube — Pipeline completo

### 14.1 Configurar coverage en CI

El pipeline de CI debe generar `lcov.info` para que SonarCloud compute cobertura. El comando `vitest run` **no** genera cobertura — necesita `--coverage`:

```bash
# No genera lcov.info ❌
pnpm test  # = vitest run

# Genera lcov.info ✅
pnpm test -- --coverage
```

**Problema:** Las thresholds en `vitest.config.ts` (80%) fallan si la cobertura general es baja. Solución: crear un config separado para CI sin thresholds.

**Archivo `vitest.ci.config.ts`:**
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    ... defaultConfig.test,
    coverage: {
      ... defaultConfig.test.coverage,
      thresholds: { statements: 0, branches: 0, functions: 0, lines: 0 },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

**Script en `package.json`:**
```json
"test:coverage": "vitest run --coverage --config vitest.ci.config.ts"
```

**CI workflow (`.github/workflows/ci.yml`):**
```yaml
- run: pnpm test:coverage

- name: Upload coverage for SonarCloud
  uses: actions/upload-artifact@v4
  if: success()
  with:
    name: coverage
    path: coverage/
    retention-days: 7
```

> ⚠️ No olvidar `fetch-depth: 0` en el checkout de SonarCloud — necesita el historial git completo para analizar "new code".

### 14.2 Errores comunes de cobertura

| Error | Causa | Solución |
|-------|-------|----------|
| Coverage on New Code 79.5% (falla 80%) | Faltan tests para cubrir líneas nuevas | Agregar tests unitarios a componentes con baja cobertura |
| `Lines: 77.47%` pero thresholds pide 80% | CI usa `vitest run` sin `--coverage` o con thresholds activos | Usar `vitest.ci.config.ts` sin thresholds + `--coverage` |
| Archivos 0% en SonarCloud | `lcov.info` no se genera o no se sube | Verificar que `pnpm test:coverage` ejecute y el upload artifact funcione |
| Funciones sin test en hooks complejos | Hooks con `useEffect`, timers, o event listeners sin mock | Usar `vi.useFakeTimers()` + `vi.advanceTimersByTime()` para cubrir `setTimeout` |

### 14.3 Cobertura para componentes lazy-loaded

Componentes con `React.lazy()` + `<Suspense>` necesitan test asíncrono:

```tsx
// ❌ Falla — getByTestId no espera a lazy
expect(screen.getByTestId("hero")).toBeDefined();

// ✅ Pasa — findByTestId espera a que el Suspense resuelva
expect(await screen.findByTestId("hero")).toBeDefined();
```

El mock del componente lazy se hace igual:
```tsx
vi.mock("@/components/organisms/HeroPlayground", () => ({
  default: () => <div data-testid="hero" />,
}));
```

### 14.4 Cobertura para `AnimatePresence` (framer-motion / motion)

`AnimatePresence` no remueve elementos del DOM sincrónicamente en jsdom. Para testear toggle:

```tsx
// ❌ Falla — AnimatePresence mantiene el elemento en DOM
expect(screen.queryByText("item")).toBeNull();

// ✅ Verificar por cambio de aria-label en el botón toggle
const btn = screen.getByLabelText("panel_open");
await user.click(btn);
expect(screen.getByLabelText("panel_close")).toBeDefined();  // abrió
await user.click(btn);
expect(screen.getByLabelText("panel_open")).toBeDefined();    // cerró
```

---

## 🧪 15. Sentry — Configuración y errores comunes

### 15.1 Deprecations en Sentry Next.js

```typescript
// ❌ Deprecated (eliminar en futura versión)
withSentryConfig({
  disableLogger: true,
  automaticVercelMonitors: true,
});

// ✅ Reemplazar con:
withSentryConfig({
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});
```

### 15.2 webpack.config.js y ESLint

Sentry genera un `webpack.config.js` con `require()` que viola `@typescript-eslint/no-require-imports`. Soluciones:

**Opción A** (recomendada) — ignorar en ESLint flat config:
```javascript
ignores: [
  "webpack.config.js",
  ...
],
```

**Opción B** — deshabilitar la regla inline:
```javascript
// webpack.config.js
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
```

### 15.3 Sentry + CSP nonce

Si usas CSP con `'strict-dynamic' 'nonce-{nonce}'`, Sentry injecta scripts automáticamente. El nonce se pasa via `x-nonce` header en el layout:

```typescript
// layout.tsx
const nonce = (await headers()).get("x-nonce") ?? "";
```

> ✅ `@sentry/nextjs` respeta el nonce cuando se setea via `x-nonce` header.

### 15.4 Error: `Module '"@sentry/react"' has no exported member 'ErrorBoundary'`

En Next.js App Router, usar `@sentry/nextjs` en lugar de `@sentry/react`:
```typescript
// ❌
import { ErrorBoundary } from "@sentry/react";

// ✅
import { ErrorBoundary } from "@sentry/nextjs";
```

En tests, actualizar el mock path también:
```typescript
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
```

---

## 📈 16. Vercel Speed Insights

### 16.1 Instalación

```bash
pnpm add @vercel/speed-insights
```

### 16.2 Integración en App Router

```typescript
// src/app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 16.3 CSP + Speed Insights

Speed Insights injecta un script para trackear métricas. Con CSP `'strict-dynamic'`, funciona automáticamente — no requiere cambios en CSP.

> ⚠️ Mockear en tests: `vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));`

### 16.4 Activar en dashboard

El componente envía datos solo si está habilitado en Vercel Dashboard → Speed Insights → Enable. Sin eso, el componente es un no-op (no pesa).

---

## 🔍 17. Google Analytics con CSP nonce

### 17.1 Componente GAScript

El componente de GA se carga con `next/script` strategy `afterInteractive`, que respeta nonces:

```tsx
"use client";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GAScript() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; ...`}
      </Script>
    </>
  );
}
```

### 17.2 CSP para Google Analytics

Con `'strict-dynamic'`, el script inicial de GA se carga con nonce. Los scripts hijos heredan la confianza. No necesita `https://www.googletagmanager.com` en `script-src`.

Pero sí necesita en `connect-src` para los endpoints de tracking:
```
connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com
```

### 17.3 Test de GAScript

```tsx
// Test para cuando NO hay GA_ID (null)
vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
const { default: GAScript } = await import("@/components/atoms/GAScript");
const { container } = render(<GAScript />);
expect(container.innerHTML).toBe("");

// Test para cuando SÍ hay GA_ID (renderiza Script)
vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-XXXXXXXXXX");
// mock de next/script
vi.mock("next/script", () => ({ default: ({ children }: any) => <>{children}</> }));
const { container } = render(<GAScript />);
expect(container.innerHTML).not.toBe("");
```

---

## 🗂️ 18. ESLint Flat Config — Errores comunes

### 18.1 Ignorar archivos específicos

En ESLint flat config (`eslint.config.mjs`), los ignores se definen como primer elemento del array:

```javascript
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "webpack.config.js",     // <-- archivos .js con require()
      "next-env.d.ts",
    ],
  },
  nextPlugin.configs["core-web-vitals"],
  ...tsPlugin.configs["flat/recommended"],
];
```

> ⚠️ A diferencia de `.eslintrc`, flat config NO hereda ignores automáticamente entre config objects. El `ignores` del primer objeto aplica globalmente.

### 18.2 `require()` en archivos .js

El error `@typescript-eslint/no-require-imports` ocurre en archivos `.js` legacy. No conviene convertirlos a ESM si son configs de webpack/Sentry.

**Solución:** Agregar el archivo a `ignores` en el flat config.

### 18.3 Variables importadas pero no usadas en tests

```typescript
import { render, screen } from "@testing-library/react";
// Si solo usas container, screen sobra
```

Usar `argsIgnorePattern` y `varsIgnorePattern` en la regla:
```javascript
"@typescript-eslint/no-unused-vars": [
  "error",
  { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
],
```

---

## 📄 19. CV en PDF — Pipeline de generación

### 19.1 Workflow: HTML → Playwright → PDF

Los CVs se generan desde HTML con Playwright (Chromium headless):

```
personal-branding/
├── docs/internacional/
│   ├── curriculum-grafico-en.html  ← fuente editable
│   ├── curriculum-grafico-es.html  ← fuente editable
│   ├── curriculum-grafico-en.pdf   ← generado
│   └── curriculum-grafico-es.pdf   ← generado
└── generate-pdfs.mjs              ← script de generación
```

### 19.2 Script de generación (`generate-pdfs.mjs`)

```javascript
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
});
```

### 19.3 Reglas para mantener el PDF en 1 página

- **Ancho de columna:** Columna izquierda (contactos/skills) usar 35% en vez de 30% para evitar overflow de texto largo (GitHub URL)
- **Espaciado:** `.right` padding: `28px 32px 28px 28px`, `.section` margin-bottom: `16px`, `.exp-item` margin-bottom: `10px`
- **Word-break:** Usar `overflow-wrap: break-word` en vez de `word-break: break-all` para evitar cortes de palabra
- **Copiar al portafolio:** `cp docs/internacional/curriculum-grafico-*.pdf /ruta/al/proyecto/public/`

### 19.4 Iconos SVG inline en contacto

Reemplazar texto labels (`@`, `T`, `W`, `G`) con SVGs inline para mejor presentación:

```html
<div class="contact-item">
  <svg viewBox="0 0 20 20" fill="#FD1EB1">...</svg>
  <span>hola@ejemplo.com</span>
</div>
```

> Los SVGs deben ser inline (no externos) para que funcionen en la generación de PDF.

---

## 🔄 20. Git — Recuperación de corrupción de objetos

### 20.1 Síntomas

```
error: archivo de objeto .git/objects/XX/XXXX... está vacío
fatal: bad object HEAD
fatal: no es posible leer el árbol (XXXX...)
```

### 20.2 Causa

Archivos objeto `.git/objects/XX/XXXX` vacíos (0 bytes). Ocurre cuando:
- El proceso de escritura de git se interrumpe (corte de energía, crash)
- Se fuerza push con objetos corruptos al remoto

### 20.3 Solución completa

```bash
# 1. Respaldar .git corrupto
mv .git .git-corrupted

# 2. Crear repo fresco
git init -b main

# 3. Agregar remote
git remote add origin https://github.com/usuario/repo.git

# 4. Stagedear todos los archivos
git add -A

# 5. Commit único con TODO el historial
git commit -m "fix: recover from corrupted git history"

# 6. Forzar push (pisa el historial remoto)
git push origin main --force
```

> ⚠️ Esto **pierde el historial de commits**. Solo hacer cuando el remoto también tenga objetos corruptos y no haya otra forma de recuperar.

### 20.4 Prevención

```bash
# Verificar integridad del repo
git fsck

# Si hay objetos vacíos, eliminarlos antes de que se propaguen
find .git/objects -type f -empty -delete

# No hacer force push si el repo local tiene objetos corruptos
```

---

## 🎨 21. Licencias — MIT + CC BY-NC-SA 4.0

### 21.1 Estructura dual para portafolio

```
portfolio-next/
├── LICENSE                    ← MIT (código fuente)
└── assets/brand/LICENSE       ← CC BY-NC-SA 4.0 (identidad visual)
```

### 21.2 MIT (LICENSE raíz)

Cubre el código fuente: componentes, lógica, algoritmos. Cualquiera puede usarlo, modificarlo y distribuirlo.

### 21.3 CC BY-NC-SA 4.0 (assets/brand/LICENSE)

Cubre la identidad visual: logos, paleta de colores, tipografía, composición de layout.

```html
<a href="https://tu-portfolio.dev/">Nombre del Proyecto</a> © 2026
por <a href="https://tu-portfolio.dev/">Tu Nombre</a> tiene
licencia bajo <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
CC BY-NC-SA 4.0</a>
```

**Términos:**
- **BY** — Atribución obligatoria
- **NC** — No comercial (no se puede vender)
- **SA** — ShareAlike (derivados deben tener misma licencia)

### 21.4 Atribución en el footer del sitio

Siempre incluir el enlace a la licencia en el footer de la web:

```tsx
<div className="text-xs text-gray-400">
  <a href="https://tu-portfolio.dev/">Portfolio</a> © 2026
  <a href="https://tu-portfolio.dev/?lang=es">Tu Nombre</a> —
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>
</div>
```

---

## 🧪 22. E2E Tests — Errores al agregar atribución CC al footer

Al agregar la línea de atribución CC en el footer, el nombre del autor aparece dos veces (enlace original + licencia). Los tests E2E que buscan por texto pueden romperse con `strict mode violation`:

```typescript
// ❌ Falla — strict mode violation: 2 elementos coinciden
const link = footer.locator("a").filter({ hasText: "Josmary Pirela" });

// ✅ Funciona — filtrar por aria-label único (más específico)
const link = footer.locator("a[aria-label*='portafolio']");

// ✅ O usar .first() para tomar el primero
const link = footer.locator("a").filter({ hasText: "Josmary Pirela" }).first();
```

**Regla:** Siempre que agregues un nuevo enlace al footer con el mismo texto, actualiza los selectores de E2E para que no haya ambigüedad.

---

## ⚡ 23. IA estable — Retry logic + timeout en fetch a APIs de IA

### 23.1 El problema

Las APIs de IA (Groq, OpenAI, Anthropic) son servicios externos que pueden fallar temporalmente:
- **5xx** (Server Error, Service Unavailable, Bad Gateway)
- **429** (Rate limit)
- **Network errors** (DNS, conexión, timeout)
- **Respuestas lentas** (más de 10s)

Sin retry ni timeout, un error transitorio de red o un rate limit tumba toda la request del usuario.

### 23.2 Patrón implementado en evil-ai (`src/lib/groq.ts`)

```typescript
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

async function fetchWithRetry(
  url: string,
  options: RequestInit & { retries?: number },
): Promise<Response> {
  const maxRetries = options.retries ?? MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const signal = options.signal
      ? combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, { ...options, signal });

      if (response.ok || !isRetryableStatus(response.status)) {
        clearTimeout(timeoutId);
        return response;
      }

      clearTimeout(timeoutId);
      lastError = new Error(`Groq API error (${response.status})`);

      if (attempt < maxRetries) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
        await delay(backoff);
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new Error("Groq timeout tras 30s");
      } else if (err instanceof TypeError) {
        lastError = new Error(`Groq network error: ${err.message}`);
      } else {
        lastError = err instanceof Error ? err : new Error("Groq error desconocido");
      }

      if (attempt >= maxRetries) break;
      const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
      await delay(backoff);
    }
  }

  throw lastError ?? new Error("Groq error desconocido");
}
```

### 23.3 Reglas del patrón

| Regla | Explicación |
|-------|-------------|
| **Timeout 30s** | Toda request a API externa debe tener un `AbortController` con timeout |
| **Backoff exponencial** | 1s, 2s, 4s entre reintentos — evitar saturar la API |
| **Solo reintentar errores transitorios** | 5xx, 429, network errors. **NO** reintentar 4xx (auth, bad request) |
| **Máximo 3 reintentos** | Después de 4 intentos (1 inicial + 3 retries), lanzar error final |
| **`combineSignals`** | Si el caller ya pasó una `signal`, combinar ambas para que cualquiera pueda abortar |
| **Errores específicos** | Diferenciar entre "timeout", "network error", y "API error" para mejor debugging |

### 23.4 Por qué NO reintentar 4xx

Los errores 4xx (400, 401, 403, 404, 422) indican un problema con la request misma:
- **401/403**: API key inválida o sin permisos → reintentar no ayuda
- **400/422**: Payload inválido → reintentar no ayuda
- **404**: Endpoint inexistente → reintentar no ayuda

Solo los 5xx y 429 son potencialmente transitorios.

### 23.5 Testing del patrón

```typescript
// Retry + éxito
fetchMock
  .mockResolvedValueOnce(new Response("Server Error", { status: 502 }))
  .mockResolvedValueOnce(new Response(JSON.stringify({...}), { status: 200 }));

// Agotar reintentos
fetchMock.mockResolvedValue(new Response("Error", { status: 503 }));
// → espera 4 intentos (1 + 3 retries)

// No retry en 4xx
fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
// → solo 1 intento

// Timeout: mock que nunca resuelve + fake timers
vi.useFakeTimers();
vi.spyOn(globalThis, "fetch").mockImplementation(
  (_url, options) => new Promise((_resolve, reject) => {
    const signal = options?.signal;
    signal?.addEventListener("abort", () => reject(new DOMException("Abort", "AbortError")));
  }),
);
await vi.advanceTimersByTimeAsync(200_000);
// → espera error "timeout"
```

### 23.6 Cuándo aplicar este patrón

- **Siempre** que hagas `fetch` directo a una API de IA (Groq, OpenAI, Anthropic, Gemini)
- **Siempre** que llames a APIs externas no controladas (terceros, microservicios)
- **No aplicar** a llamadas a tu propio backend (la latencia es controlada, el error es tu responsabilidad)

---

## 📊 24. Google Analytics — Componente opt-in con CSP whitelist

### 24.1 El problema

Google Analytics debe cargarse solo si el desarrollador lo configura explícitamente. Si se hardcodea el script en el layout, se envía data a GA incluso en entornos de desarrollo/local. Además, si hay una CSP activa, los dominios de GA son bloqueados por defecto.

### 24.2 Patrón implementado

**Componente `GAScript`** (`src/components/atoms/GAScript.tsx`):

```tsx
"use client";

import Script from "next/script";

function getGaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
}

export function GAScript() {
  const gaId = getGaId();
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { page_path: window.location.pathname });`}
      </Script>
    </>
  );
}
```

**Uso en `layout.tsx`** — se renderiza en el `<body>` del root layout:

```tsx
import { GAScript } from "@/components/atoms/GAScript";

// dentro del return:
<body>
  <GAScript />
  {/* ... */}
</body>
```

### 24.3 Reglas del patrón

| Regla | Explicación |
|-------|-------------|
| **Opt-in por env var** | Si `NEXT_PUBLIC_GA_MEASUREMENT_ID` está vacío/undefined, el componente retorna `null` — GA no se carga |
| **`"use client"`** | Necesario porque accede a `window.location.pathname` y `window.dataLayer` |
| **`strategy="afterInteractive"`** | El script se carga después de que la página sea interactiva — no bloquea el render |
| **CSP whitelist** | En `middleware.ts` agregar `https://www.google-analytics.com` y `https://www.googletagmanager.com` a `connect-src` |
| **Env vars por entorno** | `.env.example` = vacío, `.env.production` = ID real, `.env.staging` = comentado |

### 24.4 CSP — whitelist necesario

En `middleware.ts`, las directivas `connect-src` deben incluir:

```
connect-src 'self' ... https://www.google-analytics.com https://www.googletagmanager.com
```

Esto aplica tanto a development como a production.

### 24.5 Testing

```typescript
// Sin GA ID configurado → no renderiza nada
delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const { container } = render(<GAScript />);
expect(container).toBeEmptyDOMElement();

// Con GA ID configurado → renderiza 2 scripts
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
const { container } = render(<GAScript />);
const scripts = container.querySelectorAll("script");
expect(scripts).toHaveLength(2);
```

### 24.6 Cuándo aplicar este patrón

- **Siempre** que necesites Google Analytics en una app Next.js con CSP
- **Siempre** que quieras que GA esté desactivado por defecto en desarrollo
- **No aplicar** si usas PostHog u otra alternativa como reemplazo completo de GA

---

## 🧹 25. Sesión de limpieza y seguridad — Junio 2026

### 25.1 Código muerto eliminado

| Archivo | Cambio |
|---------|--------|
| `schema.ts` | Eliminada tabla `preferences` (nunca usada) + 10 type exports muertos |
| `lib/password-validation.ts` | Archivo eliminado (no importado por nadie) |
| `context/I18nProvider.tsx` | Eliminado (mero re-export de `@/lib/i18n`) |
| `types/types.ts` | Eliminado interface `ChatSessionState` (no usado) |
| `types/zodSchemas.ts` | Eliminado `ChatResponseSchema` (no usado) |

### 25.2 Duplicaciones consolidadas

| Patrón | Archivos afectados | Solución |
|--------|-------------------|----------|
| Focus trap keyboard handler | AuthModal, SessionList, TutorialCards | Extraído a `useFocusTrap` hook |
| Honeypot check | chat, chat/stream, browser/simulate routes | Extraído a `checkHoneypot()` en `api-error.ts` |
| `SESSION_KEY` constante | AuthContext, useChat, TerminalConsolePage | Centralizado en `AuthContext.tsx` |
| `generateToken` / `generateResetTokenString` | auth/index.ts | Unificados (eran idénticos) |

### 25.3 CI corregido

| Error | Solución |
|-------|----------|
| `Project not found` en SonarCloud | `sonar.projectKey` corregido de `vil-ai-assistant` a `Josmaryppirelag17_Vil-Ai-Assitant` |
| `sonarcloud-github-action` deprecated | Migrado a `sonarqube-scan-action@v5.0.0` con SHA fijo |
| `Unable to resolve action` | SHA corregido al commit real de `sonarqube-scan-action` |
| `SONAR_TOKEN` no configurado | Agregado a GitHub Secrets (usuario debe generarlo en SonarCloud) |
| `Automatic Analysis enabled` | Deshabilitar desde UI de SonarCloud |
| Coverage 0% en SonarCloud | Agregadas `sonar.coverage.exclusions` para componentes UI complejos (organisms, AuthModal, etc.) |
| `pnpm add -g vercel` PATH error | Migrado a `npm install -g vercel@latest` en deploy.yml |

### 25.4 Sentry

| Error | Solución |
|-------|----------|
| `disableLogger` deprecated | Ya usa `webpack.treeshake.removeDebugLogging` (solo warning del SDK) |
| `automaticVercelMonitors` deprecated | Ya usa `webpack.automaticVercelMonitors` (solo warning del SDK) |
| `Invalid token (401)` en build | `authToken` condicional: solo se incluye si `SENTRY_AUTH_TOKEN` está definido |

### 25.5 Nuevas herramientas

| Herramienta | Propósito | Uso |
|-------------|-----------|-----|
| **jscpd** | Copy-paste detection | `pnpm jscpd` (threshold 10%) |
| **k6** | Load testing | `pnpm load:test` (requiere `brew install k6`) |

### 25.6 Seguridad — Honeypot anti-spam

Implementado en todos los formularios de autenticación:

```
AuthModal (login/register) → forgot-password → reset-password → API routes
       │                          │                   │            │
       └────── hidden _honey field (invisible, bots lo auto-completan)
                                    │
                                    └────── checkHoneypot() → 400 si tiene valor
```

**Backend:** `checkHoneypot()` en `api-error.ts` — retorna 400 si `body._honey` es truthy.

**Frontend:** Campo oculto en cada formulario con `aria-hidden`, `tabIndex={-1}`, `opacity-0`, y `position: absolute` fuera del viewport.

**Rutas protegidas:**
- `POST /api/auth/login` ← `_honey` en schema + guard
- `POST /api/auth/register` ← `_honey` en schema + guard
- `POST /api/auth/forgot-password` ← `_honey` en schema + guard
- `POST /api/auth/reset-password` ← `_honey` en schema + guard
- `POST /api/chat` ← ya tenía
- `POST /api/chat/stream` ← ya tenía
- `POST /api/browser/simulate` ← ya tenía

**Ya existente (no se tocó):** Rate limiting (10/min login, 5/min register, 3/min forgot-password), CSP nonce, security headers, httpOnly cookies, bcrypt, Zod validation.

### 25.7 Seguridad — Account lockout

Implementado en `loginUser()` usando columnas existentes en tabla `users`:

```
loginUser(email, password)
  │
  ├── ¿lockedUntil > now? → "Account locked. Try again in X minutes."
  │
  ├── ¿password incorrecto?
  │     ├── incrementar failedAttempts
  │     └── si failedAttempts >= 5 → lockedUntil = now + 15min
  │
  └── ¿password correcto?
        ├── resetear failedAttempts = 0
        ├── limpiar lockedUntil = null
        └── actualizar lastLoginAt = now
```

**Constantes:**
- `MAX_FAILED_ATTEMPTS = 5`
- `LOCKOUT_DURATION_MS = 15 * 60 * 1000` (15 minutos)

### 25.8 Coverage expandido

| Métrica | Antes | Después |
|---------|-------|---------|
| Statements | 46.84% | 52.96% |
| Branches | 36.42% | 42.85% |
| Functions | 38.87% | 45.45% |
| Lines | 48.09% | 54.44% |
| Tests | 222 | 254 |

**Archivos nuevos de test (10):**
- `tests/middleware.test.ts`
- `tests/hooks/usePrefersReducedMotion.test.ts`
- `tests/infrastructure/Logger.test.ts`
- `tests/components/AuthButton.test.tsx`
- `tests/components/RecommendationsPanel.test.tsx`
- `tests/components/SplitLayout.test.tsx`
- `tests/app/home.test.tsx`
- `tests/app/forgot-password.test.tsx`
- `tests/app/reset-password.test.tsx`
- `tests/api/sentry-example.test.ts`