import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from './LanguageContext';
import { useSeoDefaults } from './SeoDefaultsProvider';

// Canonical origin for absolute URLs; uses env override then falls back to production domain.
const CANONICAL_ORIGIN = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  || (typeof window !== 'undefined' ? window.location.origin : 'https://avakasht.ir');

function toAbsolute(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${CANONICAL_ORIGIN}${normalized}`;
}

function withLang(url: string, lang: 'fa' | 'en') {
  try {
    const u = new URL(url, CANONICAL_ORIGIN);
    u.searchParams.set('l', lang);
    return u.toString();
  } catch {
    return url;
  }
}

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
  const currentUrl = typeof window !== 'undefined'
    ? `${CANONICAL_ORIGIN}${window.location.pathname}${window.location.search}`
    : undefined;
  const resolvedCanonical = canonical
    ? toAbsolute(canonical)
    : (currentUrl ? withLang(currentUrl, language) : undefined);
  const effectiveRobots = noIndex ? 'noindex,nofollow' : robots;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const ogLocale = language === 'fa' ? 'fa_IR' : 'en_US';
  const altLocale = language === 'fa' ? 'en_US' : 'fa_IR';
  const siteName = defaults.siteTitle || 'Ava Beauty';
  const absoluteImage = toAbsolute(finalImage);

  const alternateFa = currentUrl ? withLang(currentUrl, 'fa') : undefined;
  const alternateEn = currentUrl ? withLang(currentUrl, 'en') : undefined;

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
      {alternateFa && <link rel="alternate" hrefLang="fa" href={alternateFa} />}
      {alternateEn && <link rel="alternate" hrefLang="en" href={alternateEn} />}
      {resolvedCanonical && <link rel="alternate" hrefLang="x-default" href={resolvedCanonical.replace(/([?&])l=(fa|en)(&|$)/, '$1').replace(/[?&]$/, '')} />}

      {/* Open Graph */}
  {finalTitle && <meta property="og:title" content={finalTitle} />}
  {finalDescription && <meta property="og:description" content={finalDescription} />}
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={altLocale} />
  {absoluteImage && <meta property="og:image" content={absoluteImage} />}
  {absoluteImage && <meta property="og:image:alt" content={finalTitle || siteName} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
  {finalTitle && <meta name="twitter:title" content={finalTitle} />}
  {finalDescription && <meta name="twitter:description" content={finalDescription} />}
  {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}
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
