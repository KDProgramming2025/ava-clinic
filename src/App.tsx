import { useEffect, useState, lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LanguageProvider } from './components/LanguageContext';
import { ChatWidget } from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import { AdminProvider, useAdmin } from './components/admin/AdminContext';
import { api } from './api/client';

// Public pages (code-split via lazy)
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./components/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const VideoGalleryPage = lazy(() => import('./components/pages/VideoGalleryPage').then(m => ({ default: m.VideoGalleryPage })));
const MagazinePage = lazy(() => import('./components/pages/MagazinePage').then(m => ({ default: m.MagazinePage })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BookingPage = lazy(() => import('./components/pages/BookingPage').then(m => ({ default: m.BookingPage })));

// Admin area (single lazy chunk) - reduce initial bundle by loading one entry point
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminModule = lazy(() => import('./components/admin/AdminLayout').then(async layout => {
  // Dynamically import sub-pages inside same chunk boundary (sequential imports still bundled together by Vite when inside this callback)
  const [pages] = await Promise.all([
    import('./components/admin/pages/AdminDashboard'),
    import('./components/admin/pages/BookingsManagement'),
    import('./components/admin/pages/ClientsManagement'),
    import('./components/admin/pages/ServicesManagement'),
    import('./components/admin/pages/ContentManagement'),
    import('./components/admin/pages/MessagesManagement'),
    import('./components/admin/pages/TeamManagement'),
    import('./components/admin/pages/SettingsManagement'),
    import('./components/admin/pages/AdminUsersManagement.tsx'),
    import('./components/admin/pages/TestimonialsManagement.tsx'),
    import('./components/admin/pages/HomeContentManagement'),
    import('./components/admin/pages/AboutContentManagement'),
    import('./components/admin/pages/ContactContentManagement'),
    import('./components/admin/pages/NewsletterSettings'),
    import('./components/admin/pages/SEOSettings'),
    import('./components/admin/pages/TranslationsManagement.tsx'),
    import('./components/admin/pages/MediaLibrary.tsx'),
    import('./components/admin/pages/BookingFlowConfig'),
    import('./components/admin/pages/BookingInfoManagement'),
    import('./components/admin/pages/NavigationManagement'),
    import('./components/admin/pages/FooterLinksManagement'),
  ]);
  return { default: layout.AdminLayout };
}));

// Lightweight indirection: actual admin page rendering happens inside AdminLayout chunk; keep minimal placeholder
function AdminApp() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500" data-robots="noindex">Loading admin…</div>}>
      <AdminModule />
    </Suspense>
  );
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const { isAdminAuthenticated } = useAdmin();

  // Runtime SEO/meta updates from settings
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.settings();
        if (cancelled) return;
        const meta = data?.settings || {};
        // Apply per-page override if set, else fallback to site title/description
        const pathMap: Record<string,string> = {
          home: '/',
          about: '/about',
          services: '/services',
          'video-gallery': '/videos',
          magazine: '/magazine',
          contact: '/contact',
          booking: '/booking'
        };
        const currentPath = pathMap[currentPage] || '/';
        const perPage = (meta.perPageSeo || {})[currentPath] || {};
        const title = perPage.title || meta.siteTitle;
        const description = perPage.description || meta.metaDescription;
        if (title) document.title = title;
        const md = document.querySelector('meta[name="description"]');
        if (description) {
          if (md) md.setAttribute('content', description);
          else {
            const el = document.createElement('meta');
            el.setAttribute('name', 'description');
            el.setAttribute('content', description);
            document.head.appendChild(el);
          }
        }
        const origin = window.location.origin;
        const canonicalHref = `${origin}${currentPath}`;
        // Canonical link
        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
        canonical.href = canonicalHref;

        // Open Graph
        const ensureOg = (property: string, content?: string) => {
          if (!content) return;
          let node = document.querySelector(`meta[property="${property}"]`);
          if (!node) { node = document.createElement('meta'); node.setAttribute('property', property); document.head.appendChild(node); }
          node.setAttribute('content', content);
        };
        ensureOg('og:type', currentPath === '/' ? 'website' : 'article');
        ensureOg('og:site_name', meta.siteTitle || undefined);
        ensureOg('og:title', title || undefined);
        ensureOg('og:description', description || undefined);
        ensureOg('og:url', canonicalHref);
        ensureOg('og:image', meta.ogImage || undefined);

        // Twitter Cards
        const ensureTw = (name: string, content?: string) => {
          if (!content) return;
          let node = document.querySelector(`meta[name="${name}"]`);
          if (!node) { node = document.createElement('meta'); node.setAttribute('name', name); document.head.appendChild(node); }
          node.setAttribute('content', content);
        };
        ensureTw('twitter:card', 'summary_large_image');
        ensureTw('twitter:title', title || undefined);
        ensureTw('twitter:description', description || undefined);
        ensureTw('twitter:image', meta.ogImage || undefined);
        if (meta.siteTitle) ensureTw('twitter:site', meta.siteTitle);

        // Link sitemap reference (optional hint)
        let sitemap = document.querySelector('link[rel="sitemap"]');
        if (!sitemap) { sitemap = document.createElement('link'); sitemap.setAttribute('rel', 'sitemap'); sitemap.setAttribute('type', 'application/xml'); sitemap.setAttribute('href', '/sitemap.xml'); document.head.appendChild(sitemap); }

        // Ensure robots allows indexing on public pages
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots); }
        robots.setAttribute('content', 'index,follow');
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [currentPage]);

  // Flip robots to noindex for admin view, reset on exit
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    if (viewMode === 'admin') {
      if (robots) robots.setAttribute('content', 'noindex,nofollow');
      else {
        const el = document.createElement('meta'); el.setAttribute('name', 'robots'); el.setAttribute('content', 'noindex,nofollow'); document.head.appendChild(el);
      }
    }
  }, [viewMode]);

  // Inject JSON-LD structured data on page changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pathMap: Record<string,string> = {
          home: '/',
          about: '/about',
          services: '/services',
          'video-gallery': '/videos',
          magazine: '/magazine',
          contact: '/contact',
          booking: '/booking'
        };
        const path = pathMap[currentPage] || '/';
        const res = await fetch(`/api/seo/jsonld?path=${encodeURIComponent(path)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // Remove previous injected json-ld nodes we created
        document.querySelectorAll('script[data-jsonld="dynamic"]').forEach(n => n.remove());
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
  }, [currentPage]);

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
    // Inject robots noindex meta for admin views
    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) robotsTag.setAttribute('content', 'noindex,nofollow');
    else {
      const el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      el.setAttribute('content', 'noindex,nofollow');
      document.head.appendChild(el);
    }
    if (!isAdminAuthenticated) {
      return (
        <Suspense fallback={<div className="p-6 text-center text-gray-500" data-robots="noindex">Loading…</div>}>
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
