const DEFAULT_DEV_ORIGIN = 'http://localhost:5173';

/**
 * Parsea la variable CORS_ORIGIN (uno o varios orígenes separados por coma).
 * Nunca devuelve comodín abierto en producción.
 */
export function parseCorsOrigins(rawOrigin?: string, nodeEnv?: string): string[] {
  const origins = (rawOrigin ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');

  if (origins.length > 0) {
    return origins;
  }

  if (nodeEnv === 'production') {
    return [];
  }

  return [DEFAULT_DEV_ORIGIN];
}
