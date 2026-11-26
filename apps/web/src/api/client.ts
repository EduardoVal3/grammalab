
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'grammalab.accessToken';
const SESSION_KEY = 'grammalab.sessionKey';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiOptions = RequestInit & {
  timeoutMs?: number;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { timeoutMs = 60000, ...requestOptions } = options;

  const token = localStorage.getItem(TOKEN_KEY);

  const headers = new Headers(requestOptions.headers);

  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = 'Ocurrió un error al comunicarse con el servidor.';

      try {
        const errorData = await response.json();
        message = errorData.message ?? message;
      } catch {
        // La respuesta de error no contenía JSON.
      }

      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        'El servidor tardó demasiado en responder. Puede estar iniciando; intenta nuevamente.'
      );
    }

    throw new Error(
      'No se pudo conectar con el servidor. Verifica que la API esté activa.'
    );
  } finally {
    clearTimeout(timeout);
  }
}

export interface HealthResponse {
  status: 'ok';
  db: 'connected';
  timestamp: string;
}

export function checkApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}

export { TOKEN_KEY, SESSION_KEY };
