import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // For now, mock auth - will connect to core-erp backend later
  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock login - accepts any credentials for demo
    if (email && password) {
      setUser({ id: '1', email, name: 'Demo User', role: 'admin' });
    }
    setLoading(false);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
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
