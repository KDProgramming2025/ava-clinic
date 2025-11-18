import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LanguageProvider } from './components/LanguageContext';
import { ChatWidget } from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import { SettingsProvider } from './contexts/SettingsContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { SeoDefaultsProvider } from './components/SeoDefaultsProvider';

// Public pages (eager-loaded to avoid lazy loading per SEO/CLS requirements)
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { VideoGalleryPage } from './components/pages/VideoGalleryPage';
import { MagazinePage } from './components/pages/MagazinePage';
import { ContactPage } from './components/pages/ContactPage';
import { BookingPage } from './components/pages/BookingPage';
import { assignUniqueIds, observeAndAssignIds } from './utils/assignUniqueIds';
import { lazy } from 'react';

// Admin area (lazy-loaded to avoid loading on public pages)
const AdminRouteWrapper = lazy(() => import('./components/admin/AdminRouteWrapper').then(m => ({ default: m.AdminRouteWrapper })));

function useStructuredData(pathname: string) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const path = pathname || '/';
        const res = await fetch(`/api/seo/jsonld?path=${encodeURIComponent(path)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        document.querySelectorAll('script[data-jsonld="dynamic"]').forEach((n) => n.remove());
        if (Array.isArray(data)) {
          for (const chunk of data) {
            const el = document.createElement('script');
            el.type = 'application/ld+json';
            el.dataset.jsonld = 'dynamic';
            el.textContent = JSON.stringify(chunk);
            document.head.appendChild(el);
          }
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [pathname]);
}

function useAutoIds(pathname: string) {
  useEffect(() => {
    try { assignUniqueIds(document.body); } catch { /* ignore */ }
    const obs = observeAndAssignIds();
    return () => { try { obs.disconnect(); } catch { /* ignore */ } };
  }, [pathname]);
}

function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  useStructuredData(location.pathname);
  useAutoIds(location.pathname);

  useEffect(() => {
    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) robotsTag.setAttribute('content', 'index,follow');
  }, [location.pathname]);

  const handleShortcut = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      navigate('/admin');
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
      onKeyDown={handleShortcut}
      tabIndex={0}
    >
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <ScrollToTop />

      <button
        onClick={() => navigate('/admin')}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600"
        title="Ctrl+Shift+A for Admin Access"
      >
        Admin
      </button>
    </div>
  );
}

function MainApp() {
  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminRouteWrapper />} />
        <Route
          element={(
            <LanguageProvider storageKey="lang_public" defaultLanguage="fa">
              <SettingsProvider>
                <ServicesProvider>
                  <SeoDefaultsProvider>
                    <PublicLayout />
                  </SeoDefaultsProvider>
                </ServicesProvider>
              </SettingsProvider>
            </LanguageProvider>
          )}
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServicesPage />} />
          <Route path="/videos" element={<VideoGalleryPage />} />
          <Route path="/videos/:slug" element={<VideoGalleryPage />} />
          <Route path="/magazine" element={<MagazinePage />} />
          <Route path="/magazine/:slug" element={<MagazinePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default function App() {
  return <MainApp />;
}
