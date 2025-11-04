import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { VideoGalleryPage } from './components/pages/VideoGalleryPage';
import { MagazinePage } from './components/pages/MagazinePage';
import { ContactPage } from './components/pages/ContactPage';
import { BookingPage } from './components/pages/BookingPage';
import { Footer } from './components/Footer';
import { LanguageProvider } from './components/LanguageContext';
import { ChatWidget } from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import { AdminProvider, useAdmin } from './components/admin/AdminContext';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/pages/AdminDashboard';
import { BookingsManagement } from './components/admin/pages/BookingsManagement';
import { ClientsManagement } from './components/admin/pages/ClientsManagement';
import { ServicesManagement } from './components/admin/pages/ServicesManagement';
import { ContentManagement } from './components/admin/pages/ContentManagement';
import { MessagesManagement } from './components/admin/pages/MessagesManagement';
import { TeamManagement } from './components/admin/pages/TeamManagement';
import { SettingsManagement } from './components/admin/pages/SettingsManagement';

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
      case 'team':
        return <TeamManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={adminPage} onNavigate={setAdminPage}>
      {renderAdminPage()}
    </AdminLayout>
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
      return <AdminLogin />;
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
          {renderPage()}
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
