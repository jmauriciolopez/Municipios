import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getToken, saveToken, clearToken, decodeToken } from '../services/auth.service';

type User = {
  id: string;
  email: string;
  roles: string[];
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getToken();
      if (saved) {
        setToken(saved);
        const decoded = decodeToken(saved);
        if (decoded) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles || [],
          });
        }
      }
    })();
  }, []);

  const login = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
      });
    }
  };

  const logout = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  const hasRole = (requiredRoles: string | string[]) => {
    if (!user) return false;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.some(role => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      isAuthenticated: !!token,
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

