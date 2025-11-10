import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, setAuthToken, loadStoredToken } from '../../api/client';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  token: string | null;
  role: string | null;
  email: string | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredToken();
    if (stored) {
      setToken(stored);
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = async (emailIn: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login(emailIn, password);
      setAuthToken(res.token);
      setToken(res.token);
      setRole(res.role || null);
      setEmail(res.email || emailIn);
      setIsAdminAuthenticated(true);
      return true;
    } catch (e) {
      setIsAdminAuthenticated(false);
      setToken(null);
      setRole(null);
      setEmail(null);
      setAuthToken(null);
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setToken(null);
    setRole(null);
    setEmail(null);
    setAuthToken(null);
  };

  return (
    <AdminContext.Provider value={{ isAdminAuthenticated, token, role, email, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
