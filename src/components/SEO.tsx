import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from './LanguageContext';
import { useSeoDefaults } from './SeoDefaultsProvider';

// Simple base config (assumption). TODO: Externalize to settings or .env.
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';

export interface SEOProps {
  title?: string;            // Localized page title
  description?: string;      // Localized description
  image?: string;            // Absolute/relative OG image
  type?: string;             // og:type (website/article/product)
  canonical?: string;        // Absolute canonical URL
  robots?: string;           // robots meta content (default index,follow)
  alternates?: Array<{ hrefLang: string; href: string }>; // hreflang links
  jsonLd?: any | any[];      // Structured data to inject
  noIndex?: boolean;         // Force noindex (e.g., admin pages)
  twitterHandle?: string;    // @handle
}

// Contract:
// Inputs: SEOProps describing head tags & structured data.
// Outputs: Helmet-managed <title>, meta/link/script tags.
// Error Modes: Silently skip creation of empty values.
// Success: All provided SEO fields rendered once; avoids duplication.
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  type = 'website',
  canonical,
  robots = 'index,follow',
  alternates = [],
  jsonLd,
  noIndex,
  twitterHandle,
}) => {
  const { language } = useLanguage();
  const defaults = useSeoDefaults();
  const finalTitle = title || defaults.siteTitle || undefined;
  const finalDescription = description || defaults.metaDescription || undefined;
  const finalImage = image || defaults.ogImage || undefined;
  const resolvedCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
  const effectiveRobots = noIndex ? 'noindex,nofollow' : robots;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      {/* Sync html attributes for language and direction */}
      <html lang={language === 'fa' ? 'fa' : 'en'} dir={language === 'fa' ? 'rtl' : 'ltr'} />
  {finalTitle && <title>{finalTitle}</title>}
  {finalDescription && <meta name="description" content={finalDescription} />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Language / hreflang alternates */}
      {alternates.map(a => (
        <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
      ))}
      {/* Self language tag */}
      {resolvedCanonical && <link rel="alternate" hrefLang={language === 'fa' ? 'fa' : 'en'} href={resolvedCanonical} />}

      {/* Open Graph */}
  {finalTitle && <meta property="og:title" content={finalTitle} />}
  {finalDescription && <meta property="og:description" content={finalDescription} />}
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:type" content={type} />
  {finalImage && <meta property="og:image" content={finalImage.startsWith('http') ? finalImage : `${BASE_URL}${finalImage}`} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
  {finalTitle && <meta name="twitter:title" content={finalTitle} />}
  {finalDescription && <meta name="twitter:description" content={finalDescription} />}
  {finalImage && <meta name="twitter:image" content={finalImage.startsWith('http') ? finalImage : `${BASE_URL}${finalImage}`} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Robots */}
      <meta name="robots" content={effectiveRobots} />

      {/* Structured Data */}
      {ldArray.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
};
