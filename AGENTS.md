# AGENTS.md — Guía Maestra para Agentes de IA en GrammaLab

**GrammaLab** es una aplicación web full-stack para el aprendizaje interactivo de lenguajes formales y autómatas (UNAH Campus Comayagua — ISC 312).  
Stack fijo: **Monorepo (`npm workspaces`)** con **React + Vite + Tailwind (`apps/web`)**, **NestJS + Prisma (`apps/api`)**, **paquete determinista compartido (`packages/formal-engine`)** y **PostgreSQL 17** (Docker opcional **solo** para la BD o PostgreSQL 17 instalado localmente).

---

## 1. Lectura Obligatoria Antes de Actuar

Al iniciar cualquier tarea o solicitud de un integrante, lee en este orden:

1. **[rules.md](rules.md)** — Reglas no negociables de arquitectura, rigor formal, seguridad, BD, código y Git.
2. **[workflow.md](workflow.md)** — Protocolo exacto paso a paso que debes seguir en cada petición.
3. **[plan.md](plan.md)** — Fases, 16 subfases repartidas entre los 4 integrantes, dependencias y tablero vivo de progreso.
4. **[contexto-general.md](contexto-general.md)** — Especificación completa del sistema: módulos, esquema PostgreSQL 17, contratos REST, motor formal, tutor IA y despliegue gratuito.

> **Regla de fuente única:** Nunca inventes contratos de API, nombres de tablas, tipos del motor formal ni librerías fuera de lo especificado en `contexto-general.md`. Si algo debe cambiar, propón actualizar primero el documento correspondiente.

---

## 2. Mapa del Equipo (4 Integrantes)

Identifica qué integrante está haciendo la solicitud para respetar su alcance y evitar conflictos entre ramas:

| Integrante | Cuenta | Dominio Principal | Subfases Asignadas |
| :--- | :--- | :--- | :--- |
| **Eduardo Valenzuela** | `20231001440` | Monorepo, DB/Prisma, API Gramáticas, FE Ejercicios/IA, Deploy Backend/DB | `1.1`, `2.2`, `3.4`, `4.3` |
| **Angela Baires** | `20241900129` | `@grammalab/formal-engine` (Parser, AFD, PDA, CYK), FE Diagnóstico/Comparativa, QA Motor | `1.2`, `2.1`, `3.3`, `4.1` |
| **Angel Castillo** | `20251900173` | Auth JWT, Seeds, Diagnóstico/Generador, API Ejercicios, Backend Tutor IA, Seguridad API | `1.4`, `2.3`, `3.2`, `4.2` |
| **Jenifer Padilla** | `20241900042` | FE Base/Layout, Constructor Gramáticas, Visualizador Dual (AFD/PDA/CYK), UX y Deploy FE | `1.3`, `2.4`, `3.1`, `4.4` |

---

## 3. Invariantes Críticos (Resumen Rápido)

- **Motor determinista $\neq$ IA:** Toda validación de gramáticas, simulación AFD/PDA/CYK, evaluación de ejercicios y diagnóstico se ejecuta exclusivamente en `@grammalab/formal-engine`. **La IA solo asiste pedagógicamente** con contexto verificado por el motor.
- **Docker solo para PostgreSQL 17 (y opcional):** `apps/web` y `apps/api` corren **siempre en el host local**, nunca en Docker. La conexión a PostgreSQL 17 debe funcionar tanto con `docker compose up -d` (`postgres:17-alpine`) como con PostgreSQL 17 instalado localmente mediante `DATABASE_URL`.
- **Resiliencia IA 100 % gratuita:** Google AI Studio (Gemini Free) $\rightarrow$ Groq Cloud (Free) ante `429`/error $\rightarrow$ respuesta determinista si ambos fallan. Nunca exponer API keys en `apps/web`.
- **Fronteras limpias:** No edites archivos pertenecientes a otra subfase activa sin autorización explícita. Trabaja en ramas `feat/<subfase>-<resumen>` y nunca directo en `main`.
- **Cierre obligatorio:** Ninguna subfase se marca `[x]` en `plan.md` sin verificar compilación/tipos, pruebas relevantes y actualizar la tabla de *Registro de Avances / Handoffs*.

---

## 4. Comandos Estándar del Monorepo (disponibles a partir de Subfase 1.1)

```bash
# Base de datos (solo si el integrante usa Docker; omitir si usa PostgreSQL 17 local)
npm run db:up
npm run db:down

# Migraciones y datos semilla (requiere apps/api/.env configurado con DATABASE_URL)
npm run db:migrate
npm run db:seed

# Desarrollo local (siempre en host, nunca en Docker)
npm run dev:api       # NestJS en http://localhost:3000/api
npm run dev:web       # Vite + React en http://localhost:5173
npm run dev           # Levanta api y web en paralelo

# Calidad y verificación
npm run typecheck
npm run test
npm run build
```
