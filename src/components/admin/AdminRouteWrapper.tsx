import { Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminProvider, useAdmin } from './AdminContext';
import { LanguageProvider } from '../LanguageContext';

const AdminLogin = lazy(() => import('./AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminModule = lazy(() => import('./AdminAppShell'));

function AdminApp() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <AdminModule />
    </Suspense>
  );
}

function AdminRoute() {
  const { isAdminAuthenticated } = useAdmin();
  const location = useLocation();
  const navigatingToLogin = location.pathname === '/admin/login';
  
  if (!isAdminAuthenticated) {
    if (navigatingToLogin) return <AdminLogin />;
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (navigatingToLogin) return <Navigate to="/admin" replace />;
  return <AdminApp />;
}

export function AdminRouteWrapper() {
  return (
    <AdminProvider>
      <LanguageProvider storageKey="lang_admin" defaultLanguage="fa">
        <AdminRoute />
      </LanguageProvider>
    </AdminProvider>
  );
}
