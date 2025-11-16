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
      // Hydrate role/email from localStorage if present
      const storedRole = localStorage.getItem('admin_role');
      const storedEmail = localStorage.getItem('admin_email');
      if (storedRole) setRole(storedRole);
      if (storedEmail) setEmail(storedEmail);
      // Fallback to server validation to refresh role/email accurately
      (async () => {
        // Reduce noise: only probe server if currently in admin view
        const viewMode = localStorage.getItem('view_mode');
        if (viewMode !== 'admin') return;
        try {
          const me = await api.auth.me();
          const u = (me as any).user || {};
          if (u.role) { setRole(u.role); localStorage.setItem('admin_role', u.role); }
          if (u.email || u.username) { const id = String(u.email || u.username); setEmail(id); localStorage.setItem('admin_email', id); }
        } catch (err: any) {
          const code = (err && (err as any).code) || null;
          const status = (err && (err as any).status) || null;
          if (code === 'invalid_token' || code === 'missing_token' || status === 404) {
            setIsAdminAuthenticated(false);
            setToken(null);
            setRole(null);
            setEmail(null);
            setAuthToken(null);
            localStorage.removeItem('admin_role');
            localStorage.removeItem('admin_email');
          }
        }
      })();
    }
  }, []);

  const adminLogin = async (identifierIn: string, password: string): Promise<boolean> => {
    try {
      const cleanId = identifierIn.trim();
      const res = await api.auth.login(cleanId, password);
      setAuthToken(res.token);
      setToken(res.token);
      const user = (res as any).user || {};
      setRole(user.role || null);
      setEmail(user.email || user.username || cleanId);
      if (user.role) localStorage.setItem('admin_role', user.role);
      if (user.email || user.username || cleanId) localStorage.setItem('admin_email', String(user.email || user.username || cleanId));
      setIsAdminAuthenticated(true);
      // Ensure admin view mode is enabled when login succeeds
      try { localStorage.setItem('view_mode', 'admin'); } catch (e) { /* ignore */ }
      return true;
    } catch (e) {
      setIsAdminAuthenticated(false);
      setToken(null);
      setRole(null);
      setEmail(null);
      setAuthToken(null);
      localStorage.removeItem('admin_role');
      localStorage.removeItem('admin_email');
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setToken(null);
    setRole(null);
    setEmail(null);
    setAuthToken(null);
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_email');
    // Ensure we leave admin view after logout so the public site is visible
    try { localStorage.setItem('view_mode', 'public'); } catch (e) { /* ignore */ }
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
