# workflow.md — Protocolo Operativo para Agentes de IA

> Referenciado obligatoriamente por [AGENTS.md](AGENTS.md). Define exactamente qué debe hacer cualquier agente de IA ante cada solicitud de cualquiera de los 4 integrantes del equipo.

---

## Flujo Estándar ante Toda Solicitud de Desarrollo

Sigue estos **7 pasos en orden** cada vez que un integrante pida construir, modificar o corregir parte del sistema:

### Paso 1 — Cargar Contexto y Verificar Estado Real
1. Lee [rules.md](rules.md), [plan.md](plan.md) y la sección relevante de [contexto-general.md](contexto-general.md).
2. Inspecciona los archivos reales del repositorio relacionados con la solicitud (no asumas que existen ni supongas su contenido).

### Paso 2 — Identificar al Integrante, Subfase y Dependencias
1. Identifica quién realiza la petición (Eduardo, Angela, Angel o Jenifer) y qué subfase de `plan.md` corresponde.
   - Si el integrante no indicó su nombre o subfase y la petición es ambigua, haz **una sola pregunta breve** para confirmarlo antes de editar código.
2. Verifica la columna **Depende de** de esa subfase en `plan.md`:
   - Si todas las dependencias están en `[x]`: procede normalmente.
   - Si alguna dependencia sigue en `[ ]` o `[/]`: **infórmalo de inmediato** y ofrece dos opciones claras:
     - **Opción A (Recomendada):** Trabajar usando los contratos exactos de `contexto-general.md` con datos *mock*/stubs temporales claramente marcados con `// TODO(integracion): ...` sin tocar los archivos de la subfase pendiente.
     - **Opción B:** Esperar a que la subfase previa se fusione en `main`.
3. Si la solicitud pide tocar archivos propiedad de otro integrante, adviértelo antes de editar.

### Paso 3 — Verificar Rama Git y Modo de Base de Datos
1. Revisa el estado del repositorio (`git status` y rama actual).
   - Si el usuario está en `main` y va a implementar código, recomienda o crea la rama `feat/<subfase>-<resumen>` (ej. `feat/1.2-parser-gramaticas`).
2. Si la tarea interactúa con PostgreSQL 17:
   - Comprueba si `apps/api/.env` ya existe y usa su `DATABASE_URL`.
   - Respeta el modo elegido por el integrante: **no levantes Docker automáticamente** si el integrante trabaja con PostgreSQL 17 local, y **nunca ejecutes `apps/web` ni `apps/api` dentro de Docker**.

### Paso 4 — Alinear Alcance y Contratos (Antes de Escribir Código)
1. Confirma internamente qué archivos crearás o modificarás y que cumples todos los criterios de aceptación (*Definition of Done*) de la subfase en `plan.md`.
2. Si necesitas introducir o modificar un contrato compartido (tipos en `@grammalab/formal-engine`, tablas en `schema.prisma`, endpoints `/api/*` o variables en `.env.example`):
   - Anúncialo claramente antes o en el resumen, y actualiza `contexto-general.md` para mantener sincronizado al resto del equipo.
3. Marca la subfase como `[/]` (en progreso) en `plan.md` al iniciar una implementación formal.

### Paso 5 — Implementar Siguiendo `rules.md`
1. Construye la solución más limpia y directa posible (sin boilerplate innecesario ni dependencias extra).
2. Asegura el cumplimiento de invariantes clave:
   - Lógica formal 100 % determinista en `@grammalab/formal-engine`.
   - Validación DTO y manejo de errores claro en `apps/api`.
   - Protección de API keys y cadena de fallback `Gemini -> Groq -> Determinista` en `apps/api/src/assistant`.
   - Interfaz en español, responsiva y preparada para *cold start* en `apps/web`.
3. Añade o actualiza las pruebas automatizadas correspondientes a la lógica implementada.

### Paso 6 — Verificación Obligatoria (No Saltar)
Antes de dar la tarea por terminada, ejecuta las comprobaciones aplicables al alcance modificado:
- **TypeScript:** verificación de tipos (`npm run typecheck` o `tsc --noEmit` del workspace tocado).
- **Pruebas:** ejecución de tests relevantes (`npm run test` en `formal-engine`, `api` o `web`).
- **Build:** compilación del paquete/app afectado (`npm run build`).
- **Base de datos (si se tocó Prisma):** validar `prisma validate`, migración aplicable y `seed` idempotente.
- **Variables de entorno:** confirmar que `.env.example` incluye toda nueva variable y que ningún secreto está trackeado por Git.

> Si una verificación falla por un error en tus cambios, corrígelo antes de responder. Si falla por un prerequisito del entorno local del integrante (ej. PostgreSQL apagado), repórtalo con el comando exacto para resolverlo.

### Paso 7 — Actualizar `plan.md` y Entregar Handoff Claro
1. Si todos los criterios de aceptación de la subfase se cumplieron y pasaron las verificaciones:
   - Cambia el estado de la subfase a `[x]` en `plan.md`.
   - Agrega una fila en la tabla **Registro de Avances / Handoffs** de `plan.md` indicando fecha, integrante, subfase, resumen breve y notas clave para subfases dependientes.
2. Si la subfase quedó parcial, déjala en `[/]` e indica exactamente qué falta.
3. Entrega un resumen conciso al integrante con:
   - **Cambios realizados** (archivos creados/editados).
   - **Resultados de verificación** (comandos ejecutados y resultado).
   - **Cómo probarlo localmente** (comandos exactos, contemplando Docker y Postgres local si aplica).
   - **Mensaje de commit sugerido** (Conventional Commits) y recordatorio de abrir PR hacia `main` si la subfase terminó.

---

## Protocolos para Tipos Especiales de Solicitud

### A. Reporte de Bug o Error (`fix/...`)
1. Reproduce o rastrea la **causa raíz** de punta a punta (no parchees solo el síntoma en un componente).
2. Busca todos los llamadores afectados (especialmente en `@grammalab/formal-engine` y endpoints compartidos).
3. Aplica la corrección mínima en el punto compartido y agrega una prueba de regresión que hubiera fallado antes del fix.
4. Verifica que los tests previos y nuevos pasen sin regresiones.

### B. Consulta, Revisión de Código o Explicación Teórica
1. Si el integrante solo hace una pregunta, pide revisar un PR o solicita ayuda conceptual sobre Teoría de la Computación, **no modifiques archivos del proyecto** salvo que lo pida explícitamente.

### C. Cambio de Alcance o Nuevo Requisito
1. Evalúa si realmente aporta al objetivo del proyecto y si impacta el despliegue gratuito o el tiempo del equipo.
2. Si se aprueba, actualiza primero `contexto-general.md` y `plan.md` antes de implementar código para que los demás agentes trabajen sobre la misma versión.

### D. Integración / Merge entre Subfases
1. Al integrar código tras hacer `git pull origin main`, revisa `plan.md` (tabla de *Handoffs*) para detectar cambios recientes en contratos, migraciones Prisma (`npm run db:migrate`) o dependencias (`npm install`).
2. Resuelve conflictos preservando los contratos definidos en `contexto-general.md` y vuelve a correr `typecheck` + `test`.
