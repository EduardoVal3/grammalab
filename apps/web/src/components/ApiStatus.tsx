
import { useEffect, useState } from 'react';
import { checkApiHealth } from '../api/client';

type ApiStatusState = 'checking' | 'online' | 'offline';

export default function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState>('checking');

  async function checkConnection() {
    setStatus('checking');

    try {
      const response = await checkApiHealth();

      if (response.status === 'ok' && response.db === 'connected') {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus('offline');
    }
  }

  useEffect(() => {
    void checkConnection();
  }, []);

  const statusText = {
    checking: 'Comprobando servidor...',
    online: 'Servidor conectado',
    offline: 'Servidor no disponible',
  };

  const statusColor = {
    checking: 'bg-amber-100 text-amber-700',
    online: 'bg-green-100 text-green-700',
    offline: 'bg-red-100 text-red-700',
  };

  return (
    <button
      type="button"
      onClick={() => void checkConnection()}
      className={`rounded-full px-3 py-1 text-sm ${statusColor[status]}`}
      title="Presiona para comprobar nuevamente"
    >
      {statusText[status]}
    </button>
  );
}
