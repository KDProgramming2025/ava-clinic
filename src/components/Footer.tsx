import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t, isRTL } = useLanguage();
  const [footerLinks, setFooterLinks] = useState<any[]>([]);
  const [social, setSocial] = useState<any[]>([]);
  const [contactBlocks, setContactBlocks] = useState<any[]>([]);
  const [brand, setBrand] = useState<{ title?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [settings, contact] = await Promise.all([api.settings(), api.contact()]);
        if (cancelled) return;
        setFooterLinks(settings?.footerLinks || []);
        setBrand({ title: settings?.settings?.siteTitle });
        setSocial(contact?.social || []);
        setContactBlocks(contact?.blocks || []);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const link of footerLinks) {
      const g = link.group || t('footer.linksGroupDefault');
      if (!groups[g]) groups[g] = [];
      groups[g].push(link);
    }
    return groups;
  }, [footerLinks]);

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
              <span className={`${isRTL ? 'mr-3' : 'ml-3'}`}>{brand?.title || t('brand.name')}</span>
            </div>
            <p className="text-gray-300 mb-6">
              {t('brand.tagline')}
            </p>
            <div className="flex gap-3">
              {social.map((s, idx) => (
                <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  {(() => {
                    const p = String(s.platform || s.name || '').toLowerCase();
                    if (p === 'facebook') return <Facebook className="w-5 h-5" />;
                    if (p === 'instagram') return <Instagram className="w-5 h-5" />;
                    if (p === 'twitter' || p === 'x') return <Twitter className="w-5 h-5" />;
                    if (p === 'youtube') return <Youtube className="w-5 h-5" />;
                    return <Facebook className="w-5 h-5" />;
                  })()}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Link Groups */}
          {Object.entries(grouped).map(([groupName, links]) => (
            <div key={groupName}>
              <h3 className="mb-6">{groupName}</h3>
              <ul className="space-y-3">
                {links.map((l: any, i: number) => (
                  <li key={i}>
                    {l.url && l.url.startsWith('#') ? (
                      <button
                        onClick={() => onNavigate(l.url.replace('#',''))}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {l.label}
                      </button>
                    ) : (
                      <a href={l.url} className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noreferrer">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="mb-6">{t('contact')}</h3>
            <ul className="space-y-4">
              {contactBlocks.map((b, idx) => (
                <li key={idx} className={`flex ${b.type === 'address' ? 'items-start' : 'items-center'} gap-3`}>
                  {b.type === 'address' && <MapPin className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />}
                  {b.type === 'phone' && <Phone className="w-5 h-5 text-pink-400 flex-shrink-0" />}
                  {b.type === 'email' && <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />}
                  <span className="text-gray-300">{(b.values || []).map((v: any) => v.value || v).join(' | ')}</span>
                </li>
              ))}
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
