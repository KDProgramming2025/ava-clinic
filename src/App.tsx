import { useState, lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LanguageProvider } from './components/LanguageContext';
import { ChatWidget } from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import { AdminProvider, useAdmin } from './components/admin/AdminContext';

// Public pages (code-split via lazy)
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./components/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const VideoGalleryPage = lazy(() => import('./components/pages/VideoGalleryPage').then(m => ({ default: m.VideoGalleryPage })));
const MagazinePage = lazy(() => import('./components/pages/MagazinePage').then(m => ({ default: m.MagazinePage })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BookingPage = lazy(() => import('./components/pages/BookingPage').then(m => ({ default: m.BookingPage })));

// Admin area (code-split)
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./components/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const BookingsManagement = lazy(() => import('./components/admin/pages/BookingsManagement').then(m => ({ default: m.BookingsManagement })));
const ClientsManagement = lazy(() => import('./components/admin/pages/ClientsManagement').then(m => ({ default: m.ClientsManagement })));
const ServicesManagement = lazy(() => import('./components/admin/pages/ServicesManagement').then(m => ({ default: m.ServicesManagement })));
const ContentManagement = lazy(() => import('./components/admin/pages/ContentManagement').then(m => ({ default: m.ContentManagement })));
const MessagesManagement = lazy(() => import('./components/admin/pages/MessagesManagement').then(m => ({ default: m.MessagesManagement })));
const TeamManagement = lazy(() => import('./components/admin/pages/TeamManagement').then(m => ({ default: m.TeamManagement })));
const SettingsManagement = lazy(() => import('./components/admin/pages/SettingsManagement').then(m => ({ default: m.SettingsManagement })));
// Simpler dynamic imports relying on default exports; TS complaints earlier likely due to module resolution config. Keeping consistent pattern used by other pages.
// Use explicit relative path with .tsx extension to satisfy module resolution for certain TS configs
const AdminUsersManagement = lazy(() => import('./components/admin/pages/AdminUsersManagement.tsx').then(m => ({ default: m.default || (m as any).AdminUsersManagement })));
const TestimonialsManagement = lazy(() => import('./components/admin/pages/TestimonialsManagement.tsx').then(m => ({ default: m.default || (m as any).TestimonialsManagement })));
const HomeContentManagement = lazy(() => import('./components/admin/pages/HomeContentManagement').then(m => ({ default: m.HomeContentManagement })));
const AboutContentManagement = lazy(() => import('./components/admin/pages/AboutContentManagement').then(m => ({ default: m.AboutContentManagement })));
const ContactContentManagement = lazy(() => import('./components/admin/pages/ContactContentManagement').then(m => ({ default: m.ContactContentManagement })));
const NewsletterSettings = lazy(() => import('./components/admin/pages/NewsletterSettings').then(m => ({ default: m.NewsletterSettings })));
const SEOSettings = lazy(() => import('./components/admin/pages/SEOSettings').then(m => ({ default: m.SEOSettings })));
const TranslationsManagement = lazy(() => import('./components/admin/pages/TranslationsManagement.tsx').then(m => ({ default: m.default || (m as any).TranslationsManagement })));
const MediaLibrary = lazy(() => import('./components/admin/pages/MediaLibrary.tsx').then(m => ({ default: m.default || (m as any).MediaLibrary })));

function AdminApp() {
  const [adminPage, setAdminPage] = useState('dashboard');

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'bookings':
        return <BookingsManagement />;
      case 'clients':
        return <ClientsManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'videos':
      case 'magazine':
        return <ContentManagement />;
      case 'messages':
        return <MessagesManagement />;
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'home-content':
        return <HomeContentManagement />;
      case 'about-content':
        return <AboutContentManagement />;
      case 'contact-content':
        return <ContactContentManagement />;
      case 'seo-settings':
        return <SEOSettings />;
      case 'newsletter':
        return <NewsletterSettings />;
      case 'translations':
        return <TranslationsManagement />;
      case 'team':
        return <TeamManagement />;
      case 'media':
        return <MediaLibrary />;
      case 'settings':
        return <SettingsManagement />;
      case 'admin-users':
        return <Suspense fallback={<div>Loading Admin Users...</div>}><AdminUsersManagement /></Suspense>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading admin…</div>}>
      <AdminLayout currentPage={adminPage} onNavigate={setAdminPage}>
        {renderAdminPage()}
      </AdminLayout>
    </Suspense>
  );
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const { isAdminAuthenticated } = useAdmin();

  // Add admin access button (hidden shortcut)
  const checkAdminAccess = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      setViewMode('admin');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'video-gallery':
        return <VideoGalleryPage />;
      case 'magazine':
        return <MagazinePage />;
      case 'contact':
        return <ContactPage />;
      case 'booking':
        return <BookingPage />;
      default:
        return <HomePage />;
    }
  };

  // Show admin panel if in admin mode
  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading…</div>}>
          <AdminLogin />
        </Suspense>
      );
    }
    return <AdminApp />;
  }

  return (
    <LanguageProvider>
      <div 
        className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        onKeyDown={checkAdminAccess}
        tabIndex={0}
      >
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <main>
          <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading…</div>}>
            {renderPage()}
          </Suspense>
        </main>
        <Footer onNavigate={setCurrentPage} />
        <ChatWidget />
        <ScrollToTop />
        <Toaster />
        
        {/* Hidden Admin Access Button */}
        <button
          onClick={() => setViewMode('admin')}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600"
          title="Ctrl+Shift+A for Admin Access"
        >
          Admin
        </button>
      </div>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <MainApp />
      <Toaster />
    </AdminProvider>
  );
}
