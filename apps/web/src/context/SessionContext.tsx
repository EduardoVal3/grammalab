
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import { TOKEN_KEY, SESSION_KEY } from '../api/client';

interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface SessionContextType {
  user: SessionUser | null;
  sessionKey: string;
  isAuthenticated: boolean;
  login: (token: string, user: SessionUser) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

function getSessionKey(): string {
  let sessionKey = localStorage.getItem(SESSION_KEY);

  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionKey);
  }

  return sessionKey;
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionKey] = useState(getSessionKey);

  const [user, setUser] = useState<SessionUser | null>(() => {
    const storedUser = localStorage.getItem('grammalab.user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as SessionUser;
    } catch {
      localStorage.removeItem('grammalab.user');
      return null;
    }
  });

  const login = (token: string, user: SessionUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('grammalab.user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('grammalab.user');
    setUser(null);
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        sessionKey,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession debe utilizarse dentro de SessionProvider'
    );
  }

  return context;
}
