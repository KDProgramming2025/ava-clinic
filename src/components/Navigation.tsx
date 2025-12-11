import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useServices } from '../contexts/ServicesContext';
import { Button } from './ui/button';
import { resolveMediaUrl } from '../utils/media';
import { useMobileHistoryState } from '../hooks/useMobileHistoryState';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useMobileHistoryState(isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  const { t, toggleLanguage, language, isRTL, trc } = useLanguage();
  const { settings: settingsData, navigation: navData } = useSettings();
  const { services: servicesData } = useServices();
  const [navItems, setNavItems] = useState<Array<{ id: string; label: string; path?: string; hasDropdown?: boolean }>>([]);
  const [services, setServices] = useState<Array<{ id: string; label: string }>>([]);
  const [brand, setBrand] = useState<{ title?: string; logoUrl?: string }>({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleMobileNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    // Wait for history state cleanup to happen before navigating
    setTimeout(() => navigate(path), 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        // Navigation from context
        const items = (navData || []).filter((n: any) => n.visible !== false).sort((a: any,b: any)=> (a.order??0)-(b.order??0));
        if (items.length) {
          const mapPathToKey = (path: string) => {
            const p = (path || '').replace(/\/$/, '');
            if (p === '' || p === '/') return 'home';
            if (p === '/about') return 'about';
            if (p === '/services') return 'services';
            if (p === '/videos') return 'videoGallery';
            if (p === '/magazine') return 'magazine';
            if (p === '/contact') return 'contact';
            if (p === '/booking') return 'booking';
            return '';
          };
          setNavItems(items.map((n: any) => {
            const id = (n.path || n.label || '').replace(/^\//, '') || 'home';
            const key = mapPathToKey(n.path || '');
            const contentLabel = language === 'fa'
              ? (n.labelFa || n.label)
              : (n.labelEn || n.label);
            const dictionaryLabel = key ? ('' || t(key)) : '';
            const finalLabel = contentLabel || dictionaryLabel || n.label || n.path || '';
            return {
              id,
              label: finalLabel,
              hasDropdown: (n.path || '') === '/services',
              path: n.path || `/${id === 'home' ? '' : id}`
            };
          }));
        } else {
          setNavItems([
            { id: 'home', label: t('home'), path: '/' },
            { id: 'about', label: t('about'), path: '/about' },
            { id: 'services', label: t('services'), hasDropdown: true, path: '/services' },
            { id: 'video-gallery', label: t('videoGallery'), path: '/videos' },
            { id: 'magazine', label: t('magazine'), path: '/magazine' },
            { id: 'contact', label: t('contact'), path: '/contact' },
          ]);
        }
        setServices((servicesData || []).map((s: any) => {
          const localized = language === 'fa'
            ? (s.titleFa || s.title || s.title)
            : (s.titleEn || s.title || s.title);
          const fallback = s.title;
          return { id: s.id, label: localized || fallback || s.title };
        }));
        const s = settingsData || {};
        const siteTitle = language === 'fa'
          ? (s.siteTitleFa || s.siteTitle)
          : (s.siteTitleEn || s.siteTitle);
        const translationOverride = '';
        const normalizedTitle = (siteTitle || '').trim();
        const finalTitle = normalizedTitle || translationOverride || t('brand.name');
        setBrand({ title: finalTitle, logoUrl: resolveMediaUrl(s.logoUrl) });
      } catch {
        setNavItems([
          { id: 'home', label: t('home'), path: '/' },
          { id: 'about', label: t('about'), path: '/about' },
          { id: 'services', label: t('services'), hasDropdown: true, path: '/services' },
          { id: 'video-gallery', label: t('videoGallery'), path: '/videos' },
          { id: 'magazine', label: t('magazine'), path: '/magazine' },
          { id: 'contact', label: t('contact'), path: '/contact' },
        ]);
        setBrand({ title: t('brand.name'), logoUrl: '' });
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, navData, settingsData, servicesData]);

  const [viewMode, setViewMode] = useState<string>(() => localStorage.getItem('view_mode') || 'public');
  const toggleViewMode = () => {
    const next = viewMode === 'admin' ? 'public' : 'admin';
    setViewMode(next);
    localStorage.setItem('view_mode', next);
    // Reload to let App.tsx pick up mode change cleanly
    window.location.reload();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center cursor-pointer"
            as-child="true"
          >
            <Link 
              to="/" 
              aria-label={brand.title || 'Home'} 
              className="flex items-center"
              onClick={(e) => {
                if (isMobileMenuOpen) {
                  handleMobileNavClick(e, '/');
                }
              }}
            >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.title || 'Logo'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white">✨</span>
              </div>
            )}
            <span className={`${isRTL ? 'mr-3' : 'ml-3'} bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent`}>
              {brand.title || t('brand.name')}
            </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                {item.hasDropdown ? (
                  <div
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <button
                      className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        location.pathname === (item.path || '/')
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => {/* open dropdown; do not navigate */}}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-2xl shadow-xl overflow-hidden`}
                        >
                          {services.map((service, index) => (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="w-full"
                            >
                              <Link
                                to="/services"
                                onClick={() => setIsServicesOpen(false)}
                                className={`block w-full px-4 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                              >
                                {service.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    to={item.path || '/'}
                    className={({ isActive }) => `px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="icon"
              className="rounded-xl hover:scale-110 transition-transform"
            >
              <Globe className="w-5 h-5" />
            </Button>
            <Button
              onClick={toggleViewMode}
              variant="outline"
              size="sm"
              className="rounded-xl hidden md:inline-flex"
            >
              <Shield className="w-4 h-4 mr-2" />
              {viewMode === 'admin' ? t('admin.toggleToPublic') : t('admin.toggleToAdmin')}
            </Button>
            <Button
              asChild
              className="hidden md:flex bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg"
            >
              <Link to="/booking">{t('booking')}</Link>
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.id}>
                  <NavLink
                    to={item.path || '/'}
                    onClick={(e) => handleMobileNavClick(e, item.path || '/')}
                    className={({ isActive }) => `block w-full px-4 py-3 rounded-xl transition-all ${isRTL ? 'text-right' : 'text-left'} ${
                      isActive ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                  {item.hasDropdown && (
                    <div className="mt-1 space-y-1">
                      {services.map((service) => (
                        <Link
                          key={service.id}
                          to="/services"
                          onClick={(e) => handleMobileNavClick(e, '/services')}
                          className={`block w-full px-8 py-2 rounded-xl text-gray-600 hover:bg-gray-100 ${isRTL ? 'text-right pr-8' : 'text-left pl-8'}`}
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
                <Link to="/booking" onClick={(e) => handleMobileNavClick(e, '/booking')}>
                  {t('booking')}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
