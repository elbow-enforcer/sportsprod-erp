import { createContext, useContext, useState, ReactNode } from 'react';
import { Role } from './permissions';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock auth - will connect to core-erp backend later
  const login = async (email: string, password: string, role: Role = 'admin') => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock login - accepts any credentials for demo
    if (email && password) {
      setUser({ id: '1', email, name: 'Demo User', role });
    }
    setLoading(false);
  };

  const logout = () => setUser(null);

  // Dev-only: switch role without re-login
  const setRole = (role: Role) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      setRole,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
