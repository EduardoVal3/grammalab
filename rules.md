# rules.md — Reglas de Ejecución, Arquitectura y Calidad

Estas reglas son **obligatorias** para todos los agentes de IA y los 4 integrantes durante toda la construcción de **GrammaLab**.

---

## 1. Reglas de Arquitectura y Stack

1. **Stack fijo sin desvíos:**
   - Frontend: **React + Vite + Tailwind CSS + TypeScript** en `apps/web`.
   - Backend: **NestJS + Prisma ORM + TypeScript** en `apps/api`.
   - Núcleo compartido: **TypeScript puro** en `packages/formal-engine` (`@grammalab/formal-engine`).
   - Base de datos: **PostgreSQL 17**.
   - Monorepo gestionado con **npm workspaces** (no introducir Turborepo, Nx, Yarn ni pnpm sin acuerdo explícito del equipo).
2. **Aislamiento del paquete formal:**
   - `packages/formal-engine` **no puede importar** nada de React, DOM, NestJS, Express, Prisma ni librerías de red. Debe compilar y probarse de forma independiente para reutilizarse idénticamente en frontend y backend.
3. **Docker estrictamente acotado:**
   - `docker-compose.yml` solo contiene el servicio de PostgreSQL 17 (`postgres:17-alpine`).
   - **Prohibido** crear `Dockerfile` para ejecutar `apps/web` o `apps/api` en desarrollo local; ambos corren nativamente en la computadora del integrante.
4. **Compatibilidad total con PostgreSQL 17 local y Docker:**
   - Todo acceso a la base de datos debe leer exclusivamente `DATABASE_URL` desde variables de entorno (`apps/api/.env`).
   - Prohibido asumir nombres de contenedor Docker (`db:5432`) o credenciales fijas dentro del código fuente.
5. **Costo 0 USD garantizado:**
   - No integrar servicios pagos ni que exijan tarjeta de crédito. Todo servicio externo debe operar en su plan gratuito (Vercel/Cloudflare Pages, Render Free, Neon Free, Google AI Studio Free, Groq Free).

---

## 2. Reglas de Rigor Formal (Teoría de la Computación)

1. **Determinismo absoluto en evaluación:**
   - La pertenencia de cadenas ($w \in L(G)$), clasificación Regular vs. Libre de Contexto, trazas AFD/PDA/CYK y diagnósticos de fallo deben calcularse **exclusivamente** en `@grammalab/formal-engine`.
   - **Prohibido** consultar a un LLM para decidir si una cadena pertenece a un lenguaje o si una respuesta de ejercicio es correcta.
2. **Protección contra casos borde y bucles:**
   - Manejar explícitamente la cadena vacía ($\varepsilon$), símbolos duplicados, reglas recursivas y ciclos $\varepsilon$ en AFN/PDA/GLC.
   - Toda simulación (PDA, derivación, generador de cadenas) debe incluir un tope máximo determinista de pasos/profundidad (por ejemplo, `MAX_STEPS = 500`) para evitar bloqueos del navegador o del servidor.
3. **Consistencia cliente–servidor:**
   - El frontend puede ejecutar `@grammalab/formal-engine` para feedback visual instantáneo, pero la calificación persistida de un ejercicio (`POST /api/exercises/:id/evaluate`) siempre se recalcula autoritativamente en `apps/api` usando el mismo paquete.

---

## 3. Reglas de Integración de IA y Seguridad

1. **Proxy exclusivo en backend:**
   - Ninguna llamada a Google AI Studio ni a Groq puede realizarse desde `apps/web`. Solo `apps/api/src/assistant` conoce y usa las API keys.
2. **Cero secretos en el repositorio:**
   - Prohibido commitear `.env`, API keys, `JWT_SECRET` o contraseñas reales.
   - Toda nueva variable de entorno debe añadirse inmediatamente a `.env.example` con valor de ejemplo y comentario breve.
3. **Cadena obligatoria de resiliencia IA:**
   - Orden de ejecución en `apps/api/src/assistant`:
     1. **Google AI Studio (Gemini API Free)** con timeout controlado.
     2. Ante HTTP `429`, error 5xx o timeout $\rightarrow$ conmutación automática a **Groq Cloud API (Free)**.
     3. Si ambos fallan o faltan claves configuradas $\rightarrow$ **Fallback determinista** basado en el diagnóstico de `@grammalab/formal-engine` (nunca responder HTTP 500 por falta de cuota IA).
4. **Enfoque pedagógico estricto:**
   - El *system prompt* del tutor IA debe recibir el veredicto y traza deterministas, prohibir contradecir al motor formal, y en pistas de Nivel 1 y 2 prohibir entregar la respuesta directa.
5. **Protección HTTP en NestJS:**
   - Activar `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` de forma global.
   - Aplicar `@nestjs/throttler` en los endpoints de `/api/assistant/*` y `/api/auth/*`.
   - Configurar CORS explícitamente desde `CORS_ORIGIN` (sin `*` abierto en producción).
   - Hashear contraseñas con `bcrypt` (nunca texto plano) y nunca devolver `passwordHash` en ninguna respuesta.

---

## 4. Reglas de Base de Datos y Prisma

1. **Migraciones versionadas:** Todo cambio en `apps/api/prisma/schema.prisma` debe acompañarse de su migración (`prisma migrate dev`) y actualización de tipos.
2. **Seeds idempotentes:** `apps/api/prisma/seed.ts` debe usar `upsert` o verificaciones previas para poder ejecutarse múltiples veces sin duplicar datos ni romper referencias.
3. **Protección de plantillas oficiales:** Ningún endpoint público o de usuario puede editar o eliminar gramáticas/ejercicios con `isTemplate = true`.

---

## 5. Reglas de Código, Simplicidad y Pruebas

1. **Simplicidad y YAGNI:**
   - Escribe el mínimo código claro que resuelve el problema. No crear capas, fábricas, patrones ni dependencias que no sean necesarios para la subfase actual.
   - Reutiliza helpers, DTOs y tipos existentes antes de crear otros nuevos.
2. **Convenciones de idioma y estilo:**
   - Código fuente (variables, funciones, tipos, rutas REST, tablas DB): **inglés técnico claro**.
   - Interfaz de usuario (etiquetas, mensajes de error, explicaciones, pistas IA) y documentación del repo: **español**.
   - TypeScript en modo estricto (`strict: true`); evitar `any` salvo justificación puntual documentada.
3. **Comentarios de simplificación:**
   - Cuando se adopte deliberadamente una simplificación con límite conocido, documentarla en español con:
     `// simplificacion: <descripción breve>; suficiente hasta <límite>, luego <mejora>.`
4. **Pruebas obligatorias para lógica no trivial:**
   - Toda lógica algorítmica de `@grammalab/formal-engine`, evaluación de ejercicios y lógica de fallback IA debe incluir al menos una prueba automatizada runnable que falle si la lógica se rompe.
   - Prohibido borrar, comentar o debilitar pruebas existentes para lograr que pase el build.
5. **Validación en bordes:** Validar entradas de usuario en formularios y DTOs, y manejar explícitamente estados de carga, error de red y *cold start* del backend gratuito (Render).

---

## 6. Reglas de Colaboración Git y Fronteras entre Integrantes

1. **Ramas obligatorias:**
   - Nunca trabajar ni hacer commit directo sobre `main`.
   - Usar ramas por subfase: `feat/<subfase>-<slug>` (ej. `feat/2.1-motor-afd-pda`) o `fix/<slug>`.
2. **Respeto de propiedad por subfase:**
   - Cada integrante (y su agente) edita únicamente los archivos de su subfase asignada en `plan.md`.
   - Si necesita modificar un archivo compartido (`schema.prisma`, `packages/formal-engine/src/types`, `package.json` raíz o un contrato REST), debe avisarlo explícitamente al usuario y actualizar `contexto-general.md` en el mismo cambio.
3. **Commits limpios:**
   - Usar formato *Conventional Commits* en español o inglés consistente: `feat(subfase-2.1): implementar simulador AFD y PDA`, `fix(api): corregir manejo de fallback Groq`, `docs(plan): actualizar estado de subfase 1.2`.
4. **Sincronización del plan:**
   - Al iniciar o finalizar una subfase, actualizar obligatoriamente su casilla y el registro en `plan.md`.
