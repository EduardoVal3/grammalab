# GrammaLab — Contexto General y Especificación del Sistema Completo

> **Documento fuente de verdad (arquitectura y producto).** Define qué es GrammaLab, sus módulos funcionales, el motor formal determinista, el asistente pedagógico con IA, el modelo de datos en PostgreSQL 17, los contratos REST, la estructura monorepo y el despliegue 100 % gratuito.

---

## 1. Identificación Académica y Equipo

- **Institución:** Universidad Nacional Autónoma de Honduras (UNAH) — Campus Comayagua
- **Asignatura:** ISC 312 — Teoría de la Computación (Sección 1200)
- **Catedrático:** Ing. Evan David
- **Proyecto:** **GrammaLab** — Laboratorio Interactivo de Gramáticas y Autómatas
- **Fecha base:** Martes 5 de noviembre

| Integrante | Número de Cuenta | Rol Principal en el Proyecto |
| :--- | :--- | :--- |
| **Eduardo Valenzuela** | `20231001440` | Monorepo, Base de Datos (PostgreSQL 17/Prisma), API de Gramáticas, FE de Ejercicios/IA y Deploy Backend/DB |
| **Angela Baires** | `20241900129` | Paquete `@grammalab/formal-engine` (Parser, AFD, PDA, FNC/CYK), FE Diagnóstico/Comparativo y QA Motor Formal |
| **Angel Castillo** | `20251900173` | Auth JWT, Seeds, Diagnóstico/Generador, API de Ejercicios, Backend Asistente IA (Gemini/Groq) y Seguridad API |
| **Jenifer Padilla** | `20241900042` | Arquitectura Frontend, Constructor de Gramáticas, Visualizador Dual (AFD/PDA/CYK), UX y Deploy Frontend |

---

## 2. Visión del Sistema Completo y Alcance

**GrammaLab** es una aplicación web full-stack interactiva orientada al aprendizaje práctico de los lenguajes formales y autómatas. Combina un *sandbox* visual de simulación paso a paso, un sistema persistente de ejercicios autoevaluables con diagnóstico formal y un **asistente pedagógico con Inteligencia Artificial (IA)** que guía al estudiante sin comprometer el rigor matemático.

### Principio Rector: Arquitectura Híbrida (Motor Determinista + Tutor IA)
Los modelos de lenguaje (LLMs) son útiles para explicar conceptos y dar pistas, pero pueden fallar al decidir derivaciones formales estrictas. Por eso:
- **El Motor Formal Determinista (`@grammalab/formal-engine`) es siempre la única fuente de verdad** para validar gramáticas, clasificar tipos, simular AFD/PDA/CYK, evaluar ejercicios y diagnosticar errores.
- **El Asistente de IA nunca evalúa pertenencia de cadenas ($w \in L(G)$).** Recibe el contexto estructurado verificado por el motor formal y traduce trazas, ofrece pistas socráticas progresivas y responde dudas teóricas en español.

### Alcance del Sistema Completo
- **En alcance:**
  - Acceso inmediato en **modo invitado** (progreso en `localStorage`) y **cuentas de estudiante** ligeras (registro/login con JWT) con persistencia en **PostgreSQL 17**.
  - Biblioteca de gramáticas oficiales precargadas + CRUD de gramáticas personalizadas + importar/exportar JSON.
  - Constructor y validador de gramáticas $G = (V, \Sigma, P, S)$ con clasificación automática **Tipo 3 (Regular)** vs. **Tipo 2 (Libre de Contexto)**.
  - Motor dual determinista con visualización paso a paso: **AFD** (grafo interactivo), **PDA** (cinta + estado + pila animada) y **CYK** (Forma Normal de Chomsky + árbol de derivación).
  - Sistema de ejercicios en 3 modalidades y 3 niveles de dificultad, con evaluación determinista, historial y métricas de avance.
  - Diagnóstico exacto de cadenas inválidas, generación de contraejemplos y sugerencia de corrección mínima válida.
  - Asistente pedagógico con IA integrado en ejercicios y *sandbox*, con respaldo gratuito automático y degradación elegante.
  - Despliegue completo en servicios **100 % gratuitos sin tarjeta de crédito**.
- **Fuera de alcance (para mantener foco y calidad):**
  - Gramáticas sensibles al contexto (Tipo 1), irrestrictas (Tipo 0) o Máquinas de Turing.
  - Autenticación OAuth de terceros, roles administrativos complejos, recuperación de contraseña por correo o pagos.
  - Contenerización del frontend o backend en producción/desarrollo (Docker se usa **exclusivamente** para levantar PostgreSQL 17 opcionalmente en desarrollo).

---

## 3. Módulos Funcionales del Sistema

### 3.1 Módulo 1: Usuarios, Sesiones y Biblioteca de Gramáticas
- **Modo invitado:** Permite usar el *sandbox*, resolver ejercicios y consultar al tutor IA sin registro obligatorio (guardando progreso local en `localStorage`).
- **Modo autenticado (JWT ligero):** Registro con nombre, correo y contraseña (`bcrypt`), inicio de sesión y persistencia en PostgreSQL 17 de gramáticas propias, historial de intentos y estadísticas.
- **Biblioteca:** Plantillas oficiales precargadas mediante *seed* idempotente + gramáticas creadas por el usuario (con visibilidad pública o privada) y exportación/importación en JSON.

### 3.2 Módulo 2: Constructor y Validador de Gramáticas
- **Entrada dual:** Formulario guiado para $G = (V, \Sigma, P, S)$ y editor textual rápido (ejemplo: `S -> aSb | ε`, soportando `ε`, `lambda` o `''` como cadena vacía).
- **Validación formal en tiempo real:** Verifica $V \cap \Sigma = \emptyset$, $S \in V$, ausencia de símbolos sin declarar, producciones bien formadas y advertencias sobre símbolos inalcanzables o improductivos.
- **Clasificación estructural automática:** Determina si la gramática cumple el formato **Tipo 3 (Regular: lineal derecha o lineal izquierda)** o **Tipo 2 (Libre de Contexto)**, indicando exactamente qué producción rompe la regularidad cuando es Tipo 2.

### 3.3 Módulo 3: Motor de Reconocimiento Dual y Visualizador Interactivo
Implementado como paquete compartido **`@grammalab/formal-engine`** (TypeScript puro, cero dependencias de React, DOM, NestJS o Prisma) para ejecutarse tanto en el navegador (animación instantánea sin latencia) como en el backend (evaluación autoritativa y contexto seguro para IA):

- **Reconocedor Regular (AFD):**
  - Soporta autómatas finitos definidos directamente o convertidos automáticamente desde gramáticas regulares lineales derechas (Gramática $\rightarrow$ AFN-$\varepsilon$ $\rightarrow$ AFD por construcción de subconjuntos).
  - Visualización de diagrama de estados interactivo (**React Flow**) resaltando estado actual, prefijo consumido, símbolo en lectura, transición activa y estado final.
- **Reconocedor Libre de Contexto (PDA y CYK):**
  - *Simulador de Autómata con Pila (PDA):* Ejecución paso a paso sobre cinta de entrada, estado de control y pila animada (`push` / `pop`) con límite de pasos seguro contra bucles $\varepsilon$.
  - *Analizador CYK (vía Forma Normal de Chomsky):* Convierte GLC válidas a FNC, verifica pertenencia para cualquier GLC general ingresada por el usuario y reconstruye el árbol de derivación.
- **Controles de reproducción:** Paso anterior, paso siguiente, reproducir/pausar, velocidad, reiniciar y tabla completa de configuraciones instantáneas.

### 3.4 Módulo 4: Generador, Evaluador de Ejercicios y Diagnóstico Formal
- **Modalidades de práctica:**
  1. `MEMBERSHIP` (*Pertenencia de cadenas*): Evaluar si $w \in L(G)$ o seleccionar las cadenas válidas de un conjunto.
  2. `CLASSIFICATION` (*Jerarquía de Chomsky*): Clasificar si una gramática/lenguaje es Regular (Tipo 3) o Libre de Contexto (Tipo 2) y seleccionar la justificación estructural.
  3. `CORRECTION` (*Corrección / completado guiado*): Corregir una cadena inválida o completar una producción faltante.
- **Dificultades:** `BASIC`, `INTERMEDIATE`, `CHALLENGE`. Combina ejercicios semilla en PostgreSQL con generación paramétrica de cadenas válidas e inválidas cercanas (*near-miss*).
- **Diagnóstico determinista (ante cadena rechazada o error):**
  - Punto exacto de fallo: índice y símbolo donde el AFD no tiene transición, estado final no aceptador, subdesbordamiento de pila (cierre sin apertura) o pila no vacía al fin de entrada.
  - Contraejemplo concreto y sugerencia de corrección mínima válida con botón directo para probar la cadena corregida en el simulador.

### 3.5 Módulo 5: Asistente Pedagógico con IA (Tutor en Ejercicios)
- **Pistas progresivas (3 niveles — método socrático):**
  - `HINT_L1` (*Conceptual*): Recuerda la propiedad del lenguaje o principio de la Jerarquía de Chomsky sin delatar la respuesta.
  - `HINT_L2` (*Dirigida*): Señala la regla de producción, transición AFD o comportamiento de pila que conviene observar.
  - `HINT_L3` (*Explicación guiada*): Explica el paso a paso completo tras varios intentos o solicitud explícita.
- **Explicación didáctica de errores (`EXPLAIN_ERROR`):** Traduce el `diagnosticJson` del motor formal a una explicación clara en español con ejemplos análogos.
- **Chat contextual (`CHAT`):** Panel lateral acotado al ejercicio o gramática activa (historial compacto de los últimos turnos).
- **Proveedores gratuitos (0 USD, sin tarjeta de crédito):**
  1. **Principal:** **Google AI Studio — Gemini API (Nivel Gratuito)** usando `@google/genai` con modelos de la familia **Gemini Flash / Flash-Lite** (ej. `gemini-2.5-flash` o modelo Flash gratuito vigente; ~10–15 RPM, ~500–1,500 RPD).
  2. **Respaldo automático (Fallback):** **Groq Cloud API (Plan Free)** con modelos abiertos de baja latencia (**Llama 3.3 70B Versatile** o **Llama 3.1 8B Instant**, ~30 RPM y 1,000 RPD) ante HTTP `429`, error 5xx o timeout.
  3. **Degradación elegante:** Si ambos proveedores fallan o agotan cuota, responde con una explicación estructurada generada a partir del diagnóstico determinista; la plataforma nunca se bloquea.
- **Seguridad y control:** Todas las llamadas salen únicamente desde `apps/api/src/assistant`, protegidas con rate limiting (`@nestjs/throttler`), sin exponer API keys ni enviar datos personales a proveedores externos.

---

## 4. Stack Tecnológico y Estructura Monorepo

### 4.1 Stack Confirmado

| Capa | Tecnología | Notas Clave |
| :--- | :--- | :--- |
| **Monorepo** | **npm workspaces** (Node.js LTS $\ge 20$) | Sin dependencias de orquestación extra; scripts unificados desde raíz. |
| **Lenguaje** | **TypeScript** (strict mode) | Compartido entre `formal-engine`, `api` y `web`. |
| **Frontend** | **React 18+ + Vite + Tailwind CSS** | SPA rápida, `react-router-dom`, **React Flow** para grafos AFD/árboles y SVG/CSS para cinta y pila PDA. |
| **Backend** | **NestJS** | Arquitectura modular, DTOs con `class-validator`, `@nestjs/jwt`, `@nestjs/throttler`, Swagger opcional en dev. |
| **ORM y Migraciones** | **Prisma ORM** | `schema.prisma` declarativo, migraciones versionadas y cliente tipado compatible con PostgreSQL 17. |
| **Base de Datos** | **PostgreSQL 17** | En dev: `postgres:17-alpine` en Docker **o** PostgreSQL 17 nativo local. En prod: **Neon Free**. |
| **Pruebas** | **Vitest** (`formal-engine`, `web`) + **Jest/Supertest** (`api`) | Pruebas rápidas enfocadas en contratos críticos y motor formal. |
| **IA** | **Google AI Studio (Gemini API)** + **Groq Cloud API** | Nivel gratuito (0 USD, sin tarjeta), invocado exclusivamente desde `apps/api`. |

### 4.2 Estructura de Carpetas del Monorepo

```text
grammalab/
├── AGENTS.md                       # Punto de entrada para agentes de IA
├── contexto-general.md             # Este documento (especificación completa)
├── plan.md                         # Plan en 4 fases / 16 subfases y tablero de estado
├── workflow.md                     # Protocolo operativo paso a paso para agentes
├── rules.md                        # Reglas no negociables de ejecución y calidad
├── package.json                    # Workspaces (packages/*, apps/*) y scripts raíz
├── docker-compose.yml              # SOLO PostgreSQL 17 (postgres:17-alpine)
├── .gitignore
├── packages/
│   └── formal-engine/              # @grammalab/formal-engine (TS puro + Vitest)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/              # Contratos: Grammar, DFA, PDA, CYK, Trace, Diagnostic, Exercise
│           ├── parser/             # Parser de gramáticas, validador y clasificador Chomsky
│           ├── dfa/                # Conversión Regular -> AFN-ε -> AFD y simulador paso a paso
│           ├── pda/                # Simulador paso a paso de PDA (cinta + estado + pila)
│           ├── cyk/                # Conversión a FNC, algoritmo CYK y árbol de derivación
│           ├── diagnostics/        # Diagnóstico exacto de errores, contraejemplos y correcciones
│           ├── generator/          # Generador paramétrico de cadenas válidas y near-miss
│           └── index.ts
└── apps/
    ├── api/                        # Backend NestJS + Prisma (corre en host local, NO en Docker)
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── migrations/
    │   │   └── seed.ts             # Plantillas oficiales idempotentes (incl. L1 y L2)
    │   ├── src/
    │   │   ├── common/             # Filtros de error, decoradores, guards compartidos
    │   │   ├── prisma/             # PrismaModule y PrismaService
    │   │   ├── health/             # GET /api/health
    │   │   ├── auth/               # Registro, login, JWT y OptionalJwtAuthGuard
    │   │   ├── grammars/           # CRUD gramáticas + /validate + /simulate
    │   │   ├── exercises/          # Banco, generación, evaluación determinista y progreso
    │   │   ├── assistant/          # Proveedor Gemini + fallback Groq + fallback determinista
    │   │   ├── app.module.ts
    │   │   └── main.ts
    │   └── .env.example
    └── web/                        # Frontend React + Vite + Tailwind (corre en host local, NO en Docker)
        ├── src/
        │   ├── api/                # Cliente HTTP tipado hacia VITE_API_URL
        │   ├── context/            # Sesión (usuario autenticado o modo invitado)
        │   ├── components/         # Layout, Navbar, badges, estados de carga/cold-start
        │   ├── features/
        │   │   ├── auth/           # Login / Registro modal o páginas
        │   │   ├── grammars/       # Constructor, validador instantáneo, biblioteca y JSON I/O
        │   │   ├── simulator/      # Grafo AFD (React Flow), cinta/pila PDA, árbol CYK, controles
        │   │   ├── diagnostics/    # Panel de fallo exacto, contraejemplos y comparativa L1 vs L2
        │   │   ├── exercises/      # Práctica 3 modos, dificultad, evaluación e historial
        │   │   └── assistant/      # Panel Tutor IA (pistas 3 niveles, explicación, chat)
        │   ├── pages/
        │   ├── App.tsx
        │   └── main.tsx
        └── .env.example
```

### 4.3 Estrategia Dual de Base de Datos en Desarrollo (Docker Opcional vs. PostgreSQL Local)
- **Regla fundamental:** `apps/web` y `apps/api` corren **siempre directamente en la computadora del desarrollador** (`npm run dev`). **Docker solo se utiliza para levantar PostgreSQL 17**, de manera opcional.
- **Modo A — PostgreSQL 17 con Docker (`docker-compose.yml`):**
  - Servicio único `db` con imagen `postgres:17-alpine`, puerto `${DB_PORT:-5432}:5432`, volumen `grammalab_pgdata` y `healthcheck` (`pg_isready`).
  - `apps/api/.env` apunta a `DATABASE_URL="postgresql://grammalab:grammalab@localhost:5432/grammalab?schema=public"`.
- **Modo B — PostgreSQL 17 instalado localmente (sin Docker):**
  - El integrante crea la base `grammalab` en su instancia local de PostgreSQL 17 y configura sus credenciales en `apps/api/.env`:
    `DATABASE_URL="postgresql://<tu_usuario>:<tu_clave>@localhost:5432/grammalab?schema=public"`.
  - No se requiere levantar Docker; Prisma (`npx prisma migrate dev`, `npx prisma db seed`) y NestJS funcionan exactamente igual porque dependen exclusivamente de `DATABASE_URL`.

---

## 5. Modelo de Datos (PostgreSQL 17 + Prisma)

Esquema lógico obligatorio en `apps/api/prisma/schema.prisma`:

| Tabla | Campos Principales | Relación / Propósito |
| :--- | :--- | :--- |
| **`users`** | `id` (UUID PK), `name`, `email` (unique), `passwordHash`, `createdAt`, `updatedAt` | Cuentas de estudiante para persistencia propia. |
| **`grammars`** | `id` (UUID PK), `title`, `description`, `type` (`REGULAR` \| `CONTEXT_FREE`), `definitionJson` (JSONB: `nonTerminals`, `terminals`, `startSymbol`, `productions`, opcional `pdaConfig`), `isTemplate` (bool), `isPublic` (bool), `ownerId` (FK nullable $\rightarrow$ `users`), `createdAt`, `updatedAt` | Plantillas oficiales (`isTemplate=true`) y gramáticas creadas por usuarios. |
| **`exercises`** | `id` (UUID PK), `grammarId` (FK $\rightarrow$ `grammars`), `mode` (`MEMBERSHIP` \| `CLASSIFICATION` \| `CORRECTION`), `difficulty` (`BASIC` \| `INTERMEDIATE` \| `CHALLENGE`), `prompt` (text), `payloadJson` (JSONB), `expectedJson` (JSONB), `isTemplate` (bool), `createdAt` | Banco de ejercicios oficiales y generados. |
| **`exercise_attempts`** | `id` (UUID PK), `exerciseId` (FK $\rightarrow$ `exercises`), `userId` (FK nullable $\rightarrow$ `users`), `sessionKey` (string nullable), `submittedAnswerJson` (JSONB), `isCorrect` (bool), `diagnosticJson` (JSONB), `hintsUsed` (int default 0), `createdAt` | Registro de intentos evaluados determinísticamente y progreso histórico. |
| **`ai_interactions`** | `id` (UUID PK), `exerciseId` (FK nullable), `attemptId` (FK nullable), `userId` (FK nullable), `sessionKey` (string nullable), `interactionType` (`HINT_L1` \| `HINT_L2` \| `HINT_L3` \| `EXPLAIN_ERROR` \| `CHAT`), `userMessage` (text), `assistantResponse` (text), `provider` (`GEMINI` \| `GROQ` \| `FALLBACK_DETERMINISTIC`), `latencyMs` (int), `createdAt` | Auditoría, control de uso y métricas de resiliencia del tutor IA. |

---

## 6. Contratos de la API REST (`/api`)

Prefijo global: `/api`. Todas las respuestas de error siguen el formato estándar de NestJS (`{ statusCode, message, error }`).

| Grupo | Método y Ruta | Auth | Descripción |
| :--- | :--- | :--- | :--- |
| **Salud** | `GET /api/health` | Pública | Retorna `{ status: "ok", db: "connected", timestamp }` (útil para verificar despliegue y *cold start*). |
| **Auth** | `POST /api/auth/register` | Pública | Crea cuenta (`name`, `email`, `password`) y retorna `{ accessToken, user }`. |
| **Auth** | `POST /api/auth/login` | Pública | Valida credenciales y retorna `{ accessToken, user }`. |
| **Auth** | `GET /api/auth/me` | JWT | Retorna perfil del usuario autenticado. |
| **Gramáticas** | `GET /api/grammars` | Opcional | Lista plantillas oficiales + gramáticas públicas (+ privadas propias si hay JWT). |
| **Gramáticas** | `GET /api/grammars/:id` | Opcional | Obtiene detalle completo de una gramática. |
| **Gramáticas** | `POST /api/grammars` | JWT | Valida con `formal-engine` y guarda una nueva gramática del usuario. |
| **Gramáticas** | `PATCH /api/grammars/:id` | JWT (dueño) | Actualiza y revalida una gramática propia. |
| **Gramáticas** | `DELETE /api/grammars/:id` | JWT (dueño) | Elimina una gramática propia (no permite borrar plantillas oficiales). |
| **Gramáticas** | `POST /api/grammars/validate` | Pública | Valida sintaxis y clasifica Tipo 3 / Tipo 2 sin persistir. |
| **Gramáticas** | `POST /api/grammars/simulate` | Pública | Ejecuta simulación AFD/PDA/CYK + diagnóstico determinista sobre `(grammar, input, engine)`. |
| **Ejercicios** | `GET /api/exercises` | Pública | Lista ejercicios filtrables por `mode`, `difficulty` y `grammarType`. |
| **Ejercicios** | `POST /api/exercises/generate` | Pública | Genera dinámicamente un ejercicio parametrizado y lo valida con `formal-engine`. |
| **Ejercicios** | `POST /api/exercises/:id/evaluate` | Opcional | Evalúa determinísticamente la respuesta, genera diagnóstico/contraejemplo y guarda intento. |
| **Ejercicios** | `GET /api/exercises/progress` | Opcional | Retorna resumen de aciertos, racha e historial por usuario JWT o `sessionKey`. |
| **Tutor IA** | `POST /api/assistant/hint` | Opcional | Recibe `{ exerciseId, grammar, input?, userAttempt?, level: 1\|2\|3 }` y devuelve pista socrática fundamentada en el motor formal. |
| **Tutor IA** | `POST /api/assistant/explain` | Opcional | Traduce un diagnóstico determinista (`diagnostic`, `trace`, `grammar`) a explicación pedagógica en español. |
| **Tutor IA** | `POST /api/assistant/chat` | Opcional | Responde preguntas contextuales sobre el ejercicio o gramática activa (máx. últimos 6 mensajes de contexto). |

---

## 7. Despliegue 100 % Gratuito en Producción (Sin Tarjeta de Crédito)

| Componente | Servicio Gratuito | Plan / Límites Clave | Configuración Clave |
| :--- | :--- | :--- | :--- |
| **Frontend (`apps/web`)** | **Vercel (Plan Hobby)** *(Alternativa: Cloudflare Pages Free)* | 0 USD, sin tarjeta, HTTPS automático, 100 GB/mes | Root Directory: `apps/web`, env `VITE_API_URL` apuntando a Render; rewrite SPA a `index.html`. |
| **Backend (`apps/api`)** | **Render (Web Service Free)** | 0 USD, sin tarjeta, 750 h/mes | Build desde raíz compilando `@grammalab/formal-engine` + `apps/api` (`prisma generate && nest build`); start: `node apps/api/dist/main.js`. Nota: entra en reposo tras 15 min de inactividad (~30–50 s de arranque frío), manejado en UI mediante `GET /api/health`. |
| **Base de Datos (PostgreSQL 17)** | **Neon (Plan Free)** *(Alternativa: Supabase Free)* | 0 USD permanente, sin tarjeta, **PostgreSQL 17 nativo**, 1 GB almacenamiento (no vence a los 30 días) | `DATABASE_URL` con `?sslmode=require` configurada en Render. |
| **Asistente de IA** | **Google AI Studio (Gemini API)** + **Groq Cloud API** | 0 USD, sin tarjeta | Variables `GEMINI_API_KEY` y `GROQ_API_KEY` configuradas exclusivamente en Render. |
| **Repositorio y CI** | **GitHub (Plan Free)** | 0 USD | Ramas `feat/*` con Pull Requests hacia `desarrollo`; Eduardo integra `desarrollo` → `main` para despliegues automáticos. |

---

## 8. Caso de Uso Canónico de Validación End-to-End

El siguiente escenario sirve como referencia obligatoria de aceptación de punta a punta para validar todos los módulos integrados:

1. **Lenguaje Regular (Tipo 3):**
   $$L_1 = \{ w \in \{a, b\}^* \mid w \text{ termina en } ab \}$$
   - Reconocido por un **AFD** de 3 estados ($q_0, q_1, q_2$) sin memoria auxiliar.
   - `aab` es aceptada en $q_2$; `aba` es rechazada en $q_1$ (diagnóstico señala que el último sufijo leído es `ba` y sugiere añadir `b` o ajustar a `ab`).

2. **Lenguaje Libre de Contexto (Tipo 2):**
   $$L_2 = \{ (^n )^n \mid n \ge 0 \}, \quad \text{con gramática } S \rightarrow (S) \mid \varepsilon$$
   - Reconocido por un **PDA** que apila cada `(` y desapila cada `)` (y evaluable también por **CYK**).
   - `(())` vacía la pila al terminar la cinta (aceptada); `(()` es rechazada al finalizar la entrada con un `(` residual en la pila.

3. **Flujo integrado completo:**
   - Las gramáticas $L_1$ y $L_2$ existen como plantillas sembradas en PostgreSQL 17.
   - El estudiante compara ambos modelos visualmente (grafo AFD vs. pila PDA) en la vista comparativa.
   - Al fallar `(()` en un ejercicio sobre $L_2$, el **Evaluador Determinista** guarda el intento, el **Diagnóstico** señala el símbolo `(` pendiente en la pila y sugiere `(())`, y el **Asistente IA** ofrece primero una pista de Nivel 1 y explica bajo demanda por qué ningún AFD finito puede contar anidamientos arbitrarios.
