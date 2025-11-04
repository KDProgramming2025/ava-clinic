import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const adminLogin = (username: string, password: string): boolean => {
    // Mock authentication - in real app, this would call an API
    if (username === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout }}>
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
