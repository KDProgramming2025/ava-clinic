import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SeoDefaults {
  siteTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  loaded: boolean;
}

const SeoDefaultsContext = createContext<SeoDefaults>({ loaded: false });

export const SeoDefaultsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defaults, setDefaults] = useState<SeoDefaults>({ loaded: false });
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading) return;
    
    if (settings) {
      setDefaults({
        siteTitle: settings.siteTitle || 'Ava Beauty',
        metaDescription: settings.metaDescription || '',
        ogImage: settings.ogImage || null,
        loaded: true,
      });
    } else {
      setDefaults({
        siteTitle: 'Ava Beauty',
        metaDescription: 'Leading clinic for hair & eyebrow implant procedures delivering natural results.',
        ogImage: '/og-image.jpg',
        loaded: true,
      });
    }
  }, [settings, loading]);

  return (
    <SeoDefaultsContext.Provider value={defaults}>
      {children}
    </SeoDefaultsContext.Provider>
  );
};

export function useSeoDefaults() {
  return useContext(SeoDefaultsContext);
}
