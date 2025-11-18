import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { resolveMediaUrl } from '../utils/media';

export function Footer() {
  const { t, isRTL, trc, language } = useLanguage();
  const { settings: settingsData, footerLinks: footerLinksData } = useSettings();
  const [footerLinks, setFooterLinks] = useState<any[]>([]);
  const [social, setSocial] = useState<any[]>([]);
  const [contactBlocks, setContactBlocks] = useState<any[]>([]);
  const [brand, setBrand] = useState<{ title?: string; titleEn?: string | null; titleFa?: string | null; logoUrl?: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const contact = await api.contact();
        if (cancelled) return;
        setFooterLinks(footerLinksData || []);
        setBrand({
          title: settingsData?.siteTitle,
          titleEn: settingsData?.siteTitleEn,
          titleFa: settingsData?.siteTitleFa,
          logoUrl: resolveMediaUrl(settingsData?.logoUrl),
        });
        setSocial(contact?.social || []);
        setContactBlocks(contact?.blocks || []);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [settingsData, footerLinksData]);

  const grouped = useMemo(() => {
    const groups: Record<string, { links: any[]; titleEn?: string | null; titleFa?: string | null; fallback: string }> = {};
    for (const link of footerLinks) {
      const fallbackTitle = link.group || link.groupEn || link.groupFa || t('footer.linksGroupDefault');
      const key = fallbackTitle || 'default';
      if (!groups[key]) {
        groups[key] = { links: [], titleEn: link.groupEn, titleFa: link.groupFa, fallback: fallbackTitle };
      } else {
        groups[key].titleEn = groups[key].titleEn || link.groupEn;
        groups[key].titleFa = groups[key].titleFa || link.groupFa;
      }
      groups[key].links.push(link);
    }
    return groups;
  }, [footerLinks, t]);

  const mapHashToPath = (hashUrl: string) => {
    const id = (hashUrl || '').replace('#', '');
    if (id === 'home') return '/';
    if (id === 'about') return '/about';
    if (id === 'services') return '/services';
    if (id === 'video-gallery' || id === 'videos') return '/videos';
    if (id === 'magazine') return '/magazine';
    if (id === 'contact') return '/contact';
    if (id === 'booking') return '/booking';
    return '/';
  };

  const brandDisplayName = useMemo(() => {
    const localizedTitle = language === 'fa'
      ? ((brand?.titleFa || '').trim() || (brand?.title || '').trim() || (brand?.titleEn || '').trim())
      : ((brand?.titleEn || '').trim() || (brand?.title || '').trim() || (brand?.titleFa || '').trim());
    const translationOverride = '';
    return localizedTitle || translationOverride || t('brand.name');
  }, [brand, language, t, trc]);

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-6">
              {brand?.logoUrl ? (
                <img src={brand.logoUrl} alt={brandDisplayName} className="w-12 h-12 rounded-full object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white">✨</span>
                </div>
              )}
              <span className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                {brandDisplayName}
              </span>
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
          {Object.entries(grouped).map(([groupName, meta]) => (
            <div key={groupName}>
              <h3 className="mb-6">
                {(() => {
                  const localizedTitle = language === 'fa'
                    ? (meta.titleFa || meta.titleEn || meta.fallback)
                    : (meta.titleEn || meta.titleFa || meta.fallback);
                  return localizedTitle || t('footer.linksGroupDefault');
                })()}
              </h3>
              <ul className="space-y-3">
                {meta.links.map((l: any, i: number) => {
                  const localizedLabel = language === 'fa'
                    ? (l.labelFa || l.label || l.label)
                    : (l.labelEn || l.label || l.label);
                  const fallbackLabel = l.label;
                  const labelText = localizedLabel || fallbackLabel || l.url;
                  const isInternal = typeof l.url === 'string' && l.url.startsWith('/');
                  const isHash = typeof l.url === 'string' && l.url.startsWith('#');
                  return (
                  <li key={i}>
                      {isInternal ? (
                        <Link to={l.url} className="text-gray-300 hover:text-white transition-colors">
                          {labelText}
                        </Link>
                      ) : isHash ? (
                        <Link to={mapHashToPath(l.url)} className="text-gray-300 hover:text-white transition-colors">
                          {labelText}
                        </Link>
                      ) : (
                        <a href={l.url} className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noreferrer">{labelText}</a>
                      )}
                  </li>
                  );
                })}
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
                  <span className="text-gray-300">{(b.values || []).map((v: any, i: number) => v.value || v).join(' | ')}</span>
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
