import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { AdminLayout } from './AdminLayout';

// Admin pages
import { AdminDashboard } from './pages/AdminDashboard';
import { BookingsManagement } from './pages/BookingsManagement';
import { ClientsManagement } from './pages/ClientsManagement';
import { ServicesManagement } from './pages/ServicesManagement';
import { TestimonialsManagement } from './pages/TestimonialsManagement';
import { HomeContentManagement } from './pages/HomeContentManagement';
import { AboutContentManagement } from './pages/AboutContentManagement';
import { ContactContentManagement } from './pages/ContactContentManagement';
import { NewsletterSettings } from './pages/NewsletterSettings';
import { MediaLibrary } from './pages/MediaLibrary';
import { VideosManagement } from './pages/VideosManagement';
import { MagazineManagement } from './pages/MagazineManagement';
import { MessagesManagement } from './pages/MessagesManagement';
import { TeamManagement } from './pages/TeamManagement';
import NavigationManagement from './pages/NavigationManagement';
import FooterLinksManagement from './pages/FooterLinksManagement';
import { SettingsManagement } from './pages/SettingsManagement';
import { AdminUsersManagement } from './pages/AdminUsersManagement';
import { BookingFlowConfig } from './pages/BookingFlowConfig';
import BookingInfoManagement from './pages/BookingInfoManagement';

export default function AdminAppShell() {
  const [currentPage, setCurrentPage] = useState<string>(() => localStorage.getItem('admin_page') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('admin_page', currentPage);
  }, [currentPage]);

  const pageEl = useMemo(() => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'bookings':
        return <BookingsManagement />;
      case 'clients':
        return <ClientsManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'home-content':
        return <HomeContentManagement />;
      case 'about-content':
        return <AboutContentManagement />;
      case 'contact-content':
        return <ContactContentManagement />;
      case 'booking-config':
        return <BookingFlowConfig />;
      case 'booking-info':
        return <BookingInfoManagement />;
      case 'newsletter':
        return <NewsletterSettings />;
      case 'media':
        return <MediaLibrary />;
      case 'videos':
        return <VideosManagement />;
      case 'magazine':
        return <MagazineManagement />;
      case 'messages':
        return <MessagesManagement />;
      case 'team':
        return <TeamManagement />;
      case 'navigation':
        return <NavigationManagement />;
      case 'footer-links':
        return <FooterLinksManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'admin-users':
        return <AdminUsersManagement />;
      default:
        return <AdminDashboard />;
    }
  }, [currentPage]);
  const { t } = useLanguage();
  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => { window.open('/', '_blank', 'noopener,noreferrer'); }}>
          {t('admin.toggleToPublic')}
        </Button>
      </div>
      {pageEl}
    </AdminLayout>
  );
}
