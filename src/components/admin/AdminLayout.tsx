import { useState, useEffect, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Video,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useAdmin } from './AdminContext';
import { useLanguage } from '../LanguageContext';
import { api } from '../../api/client';
import { resolveMediaUrl } from '../../utils/media';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { adminLogout } = useAdmin();
  const { t, toggleLanguage, language, trc } = useLanguage();

  const [branding, setBranding] = useState<{ title?: string | null; titleEn?: string | null; titleFa?: string | null; logoUrl?: string | null }>({});
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.settings();
        if (cancelled) return;
        const s = data?.settings || {};
        setBranding({
          title: s.siteTitle,
          titleEn: s.siteTitleEn,
          titleFa: s.siteTitleFa,
          logoUrl: resolveMediaUrl(s.logoUrl),
        });
      } catch {
        if (!cancelled) {
          setBranding({});
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchCount = async () => {
      try {
        const items = await api.messages({ status: 'NEW' });
        if (!cancelled) setNewMessageCount(Array.isArray(items) ? items.length : 0);
      } catch {
        if (!cancelled) setNewMessageCount(0);
      }
    };

    fetchCount();
    interval = setInterval(fetchCount, 60000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  const brandDisplayName = useMemo(() => {
    const localized = language === 'fa'
      ? ((branding.titleFa || '').trim() || (branding.title || '').trim() || (branding.titleEn || '').trim())
      : ((branding.titleEn || '').trim() || (branding.title || '').trim() || (branding.titleFa || '').trim());
    const override = '';
    return localized || override || t('brand.name');
  }, [branding.title, branding.titleEn, branding.titleFa, language, trc, t]);

  const menuItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'bookings', label: t('admin.bookings'), icon: Calendar, badge: 12 },
    { id: 'clients', label: t('admin.clients'), icon: Users },
    { id: 'testimonials', label: t('admin.testimonials'), icon: Users },
    { id: 'home-content', label: t('admin.homeContent'), icon: LayoutDashboard },
    { id: 'services', label: 'Services Content', icon: Briefcase },
    { id: 'about-content', label: t('admin.aboutContent'), icon: LayoutDashboard },
    { id: 'contact-content', label: t('admin.contactContent'), icon: LayoutDashboard },
    { id: 'seo-settings', label: t('admin.seoSettings'), icon: Search },
    { id: 'booking-config', label: t('admin.bookingConfig'), icon: Calendar },
    { id: 'booking-info', label: t('admin.bookingInfo'), icon: LayoutDashboard },
    { id: 'newsletter', label: t('admin.newsletter'), icon: BookOpen },
    { id: 'media', label: t('admin.media'), icon: Video },
    { id: 'videos', label: t('admin.videos'), icon: Video },
    { id: 'magazine', label: t('admin.magazine'), icon: BookOpen },
    { id: 'messages', label: t('admin.messages'), icon: MessageSquare, badge: newMessageCount > 0 ? newMessageCount : undefined },
    { id: 'team', label: t('admin.team'), icon: Users },
    { id: 'navigation', label: t('admin.navigation'), icon: LayoutDashboard },
    { id: 'footer-links', label: t('admin.footerLinks'), icon: LayoutDashboard },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
    { id: 'admin-users', label: t('admin.accessControl'), icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={brandDisplayName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white">✨</span>
                </div>
              )}
              <div>
                <h1 className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {brandDisplayName}
                </h1>
                <p className="text-gray-500">{t('admin.panel') || 'Admin Portal'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('admin.searchPlaceholder')}
                  className="pl-10 w-64 rounded-full bg-gray-50"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-pink-500">
                3
              </Badge>
            </Button>

            {/* Language Switcher */}
            <Button
              variant="outline"
              onClick={toggleLanguage}
              className="rounded-full hidden md:inline-flex"
            >
              {t('admin.switchLanguage')}: {language.toUpperCase()}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="md:hidden rounded-full"
              aria-label={t('admin.switchLanguage')}
            >
              {language === 'fa' ? 'FA' : 'EN'}
            </Button>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full" />
                  <span className="hidden md:inline">{t('admin.panel')}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>{t('admin.profileSettings')}</DropdownMenuItem>
                <DropdownMenuItem>{t('admin.preferences')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={adminLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('admin.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm z-30 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        className={`${
                          currentPage === item.id
                            ? 'bg-white text-pink-600'
                            : 'bg-pink-100 text-pink-600'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
