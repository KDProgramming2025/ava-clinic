import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white">✨</span>
              </div>
              <span className={`${isRTL ? 'mr-3' : 'ml-3'}`}>Beauty Implant</span>
            </div>
            <p className="text-gray-300 mb-6">
              Your trusted partner for natural beauty enhancement
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['home', 'about', 'services', 'contact'].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => onNavigate(page)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t(page)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-6">Services</h3>
            <ul className="space-y-3">
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                {t('hairImplant')}
              </li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                {t('eyebrowImplant')}
              </li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                {t('eyelashImplant')}
              </li>
              <li className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                {t('prp')}
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6">{t('contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">123 Beauty Street, Medical District, City 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span className="text-gray-300">info@beautyimplant.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
          <p>{t('allRights')}</p>
        </div>
      </div>
    </footer>
  );
}
