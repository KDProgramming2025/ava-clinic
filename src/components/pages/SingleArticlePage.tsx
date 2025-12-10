import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowLeft, User, Tag as TagIcon, Share2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { apiFetch } from '../../api/client';
import { SEO } from '../SEO';
import { toast } from 'sonner';

export function SingleArticlePage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  const { t, isRTL } = useLanguage();
  
  const [article, setArticle] = useState<any | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch<any>(`/articles/${slug}`);
        if (cancelled) return;
        setArticle(data);
        
        // Fetch HTML content if available
        if (data.contentUrl) {
          try {
            const res = await fetch(data.contentUrl);
            if (res.ok) {
              const html = await res.text();
              // Extract body content
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              
              // Extract styles from head
              const styles = Array.from(doc.head.querySelectorAll('style'))
                .map(style => style.innerHTML)
                .join('\n');
                
              // Scope the styles to .article-content to prevent bleeding
              // This regex finds selectors and prepends .article-content
              const scopedStyles = styles.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
                 // Split by comma to handle multiple selectors like "h1, h2"
                 const scoped = selector.split(',').map((s: string) => {
                   const trimmed = s.trim();
                   // Skip keyframes or other @ rules if necessary, though simple check:
                   if (trimmed.startsWith('@')) return trimmed;
                   // If it's body, replace with .article-content
                   if (trimmed === 'body') return '.article-content';
                   return `.article-content ${trimmed}`;
                 }).join(', ');
                 return `${scoped}${suffix}`;
              });

              // Prepend styles to body content, wrapped in a style tag
              const content = (scopedStyles ? `<style>${scopedStyles}</style>` : '') + doc.body.innerHTML;
              setHtmlContent(content);
            }
          } catch (err) {
            console.error('Failed to load article content', err);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || t('magazine.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, t]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.copied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || t('magazine.notFound')}</h2>
        <Link to="/magazine">
          <Button>{t('magazine.backToMagazine')}</Button>
        </Link>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
  const canonical = `${origin}/magazine/${article.slug}`;
  
  // Structured Data for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.image ? [article.image] : [],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: [{
        '@type': 'Person',
        name: article.author?.name || 'Ava Beauty',
        url: origin
    }],
    publisher: {
        '@type': 'Organization',
        name: 'Ava Beauty',
        logo: {
            '@type': 'ImageObject',
            url: `${origin}/logo.png`
        }
    },
    description: article.excerpt
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gray-50">
      <SEO 
        title={article.title}
        description={article.excerpt || article.title}
        canonical={canonical}
        image={article.image}
        type="article"
        jsonLd={jsonLd}
      />

      {/* Header Image & Title */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {article.image ? (
          <ImageWithFallback 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl w-full px-4 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {article.category && (
                <Badge className="mb-4 bg-pink-500 hover:bg-pink-600 border-0 text-white">
                  {article.category.name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-white/90">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {article.readTimeMinutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTimeMinutes} {t('magazine.minReadSuffix')}
                  </div>
                )}
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {article.author.name}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <Card className="p-6 md:p-10 bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <Link to="/magazine">
              <Button variant="ghost" className="text-gray-600 hover:text-pink-600 pl-0 hover:bg-transparent">
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isRTL ? 'rotate-180' : ''}`} />
                {t('magazine.backToMagazine')}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              {t('common.share')}
            </Button>
          </div>

          {/* Content */}
          <div className="max-w-none">
            {htmlContent ? (
              <div className="article-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <div className="text-gray-600 italic text-center py-10">
                {t('magazine.noContent')}
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-pink-500" />
                {t('magazine.tagsLabel')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
