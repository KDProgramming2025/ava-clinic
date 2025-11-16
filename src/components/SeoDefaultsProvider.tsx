import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../api/client';

interface SeoDefaults {
  siteTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  loaded: boolean;
}

const SeoDefaultsContext = createContext<SeoDefaults>({ loaded: false });

export const SeoDefaultsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defaults, setDefaults] = useState<SeoDefaults>({ loaded: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settingsBundle: any = await api.settings?.(); // api.settings() returns { settings, navigation, footerLinks, trendingTopics }
        const s = settingsBundle?.settings || settingsBundle; // fallback if shape differs
        if (cancelled) return;
          // Prefer language-specific title/description if present
          const siteTitle = s.siteTitle || 'Ava Beauty';
          const metaDescription = s.metaDescription || '';
          setDefaults({
            siteTitle,
            metaDescription,
            ogImage: s?.ogImage || null,
            loaded: true,
          });
      } catch {
        if (!cancelled) setDefaults({
          siteTitle: 'Ava Beauty',
          metaDescription: 'Leading clinic for hair & eyebrow implant procedures delivering natural results.',
          ogImage: '/og-image.jpg',
          loaded: true,
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <SeoDefaultsContext.Provider value={defaults}>
      {children}
    </SeoDefaultsContext.Provider>
  );
};

export function useSeoDefaults() {
  return useContext(SeoDefaultsContext);
}
