import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Button } from './ui/button';
import { api } from '../api/client';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { t, toggleLanguage, language, isRTL } = useLanguage();
  const [navItems, setNavItems] = useState<Array<{ id: string; label: string; path?: string; hasDropdown?: boolean }>>([]);
  const [services, setServices] = useState<Array<{ id: string; label: string }>>([]);
  const [brand, setBrand] = useState<{ title?: string; logoUrl?: string }>({});

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
        const [settings, svc] = await Promise.all([api.settings(), api.services()]);
        if (cancelled) return;
        // Navigation from settings; fallback to defaults
        const items = (settings?.navigation || []).filter((n: any) => n.visible !== false).sort((a: any,b: any)=> (a.order??0)-(b.order??0));
        if (items.length) {
          setNavItems(items.map((n: any) => ({ id: (n.path || n.label || '').replace(/^\//, '') || 'home', label: n.label || n.path || '', hasDropdown: (n.path || '') === '/services' })));
        } else {
          setNavItems([
            { id: 'home', label: t('home') },
            { id: 'about', label: t('about') },
            { id: 'services', label: t('services'), hasDropdown: true },
            { id: 'video-gallery', label: t('videoGallery') },
            { id: 'magazine', label: t('magazine') },
            { id: 'contact', label: t('contact') },
          ]);
        }
        setServices((svc || []).map((s: any) => ({ id: s.id, label: s.title })));
        setBrand({ title: settings?.settings?.siteTitle, logoUrl: settings?.settings?.logoUrl });
      } catch {
        setNavItems([
          { id: 'home', label: t('home') },
          { id: 'about', label: t('about') },
          { id: 'services', label: t('services'), hasDropdown: true },
          { id: 'video-gallery', label: t('videoGallery') },
          { id: 'magazine', label: t('magazine') },
          { id: 'contact', label: t('contact') },
        ]);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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
            onClick={() => onNavigate('home')}
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
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => onNavigate(item.id)}
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
                          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-2xl shadow-xl overflow-hidden`}
                        >
                          {services.map((service, index) => (
                            <motion.button
                              key={service.id}
                              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => {
                                onNavigate('services');
                                setIsServicesOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors"
                            >
                              {service.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </button>
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
              onClick={() => onNavigate('booking')}
              className="hidden md:flex bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-lg"
            >
              {t('booking')}
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
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                  {item.hasDropdown && (
                    <div className="mt-1 space-y-1">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            onNavigate('services');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-8 py-2 rounded-xl text-gray-600 hover:bg-gray-100 ${isRTL ? 'pr-8' : 'pl-8'}`}
                        >
                          {service.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button
                onClick={() => {
                  onNavigate('booking');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                {t('booking')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
