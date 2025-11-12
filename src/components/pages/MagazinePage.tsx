import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, ArrowRight, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { api } from '../../api/client';

export function MagazinePage() {
  const { t, isRTL } = useLanguage();

  const [featured, setFeatured] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [newsletter, setNewsletter] = useState<{ headline?: string; description?: string; buttonLabel?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [allArticles, featuredArticles, cats, tgs, settings, nl] = await Promise.all([
          api.articles(),
          api.articles({ featured: true }),
          api.categories(),
          api.tags(),
          api.settings(),
          api.newsletter(),
        ]);
        if (cancelled) return;
        setArticles(allArticles || []);
        setFeatured((featuredArticles && featuredArticles[0]) || (allArticles || []).find((a: any) => a.featured) || null);
        setCategories(cats || []);
        setTags(tgs || []);
        setTrending(((settings?.trendingTopics) || []).map((t: any) => t.text));
        setNewsletter(nl || null);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load magazine data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      const id = a.category?.id || a.categoryId || a.category?.slug || 'uncategorized';
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const formatDate = (d?: string | null) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return String(d); }
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('magazine.title')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('magazine.subtitle')}
            </p>
          </motion.div>

          {/* Featured Article */}
          {!loading && !error && featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-96 lg:h-auto overflow-hidden">
                  <ImageWithFallback
                    src={featured.image || ''}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      {t('magazine.featured')}
                    </Badge>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-pink-50/30">
                  <Badge className="mb-4 w-fit bg-pink-100 text-pink-700 border-0">
                    {featured.category?.name || t('magazine.general')}
                  </Badge>
                  <h2 className="mb-4 text-gray-900">{featured.title}</h2>
                  <p className="text-gray-600 mb-6">{featured.excerpt}</p>
                  <div className="flex items-center gap-6 text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featured.author?.name || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featured.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featured.readTimeMinutes ? `${featured.readTimeMinutes} min read` : ''}</span>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full w-fit px-8">
                    {t('readMore')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Articles */}
            <div className="lg:col-span-2">
              <h2 className="mb-8 text-gray-900">{t('magazine.latest')}</h2>
              <div className="space-y-8">
                {loading && <div className="text-center py-8">Loading...</div>}
                {error && !loading && <div className="text-center py-8 text-red-600">{error}</div>}
                {!loading && !error && articles.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative md:w-80 h-56 overflow-hidden group flex-shrink-0">
                          <ImageWithFallback
                            src={article.image || ''}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <Badge className="mb-3 w-fit bg-purple-100 text-purple-700 border-0">
                            {article.category?.name || t('magazine.general')}
                          </Badge>
                          <h3 className="mb-3 text-gray-900">{article.title}</h3>
                          <p className="text-gray-600 mb-4 flex-1">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-gray-500">
                              <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {article.author?.name || '—'}
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {article.readTimeMinutes ? `${article.readTimeMinutes} min` : ''}
                              </span>
                            </div>
                            <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-full">
                              {t('readMore')} <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" className="rounded-full px-8 border-2 border-pink-500 text-pink-600 hover:bg-pink-50">
                  {t('magazine.loadMore')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                  <h3 className="mb-6 text-gray-900">{t('magazine.categories')}</h3>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: isRTL ? -5 : 5 }}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:shadow-md transition-all group"
                      >
                        <span className="text-gray-700 group-hover:text-gray-900">{category.name}</span>
                        <Badge className={`bg-gradient-to-r ${category.color || 'from-pink-500 to-purple-600'} text-white border-0`}>
                          {categoryCounts[category.id] || 0}
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Trending */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    <h3 className="text-gray-900">{t('magazine.trending')}</h3>
                  </div>
                  <div className="space-y-4">
                    {trending.map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-pink-500 mt-1">{index + 1}.</span>
                          <span className="text-gray-700 group-hover:text-gray-900 flex-1">
                            {item}
                          </span>
                          <ArrowRight className={`w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Newsletter */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                  
                  <div className="relative z-10">
                    <Sparkles className="w-8 h-8 mb-4" />
                    <h3 className="mb-3 text-white">{newsletter?.headline || 'Subscribe to Newsletter'}</h3>
                    <p className="text-white/90 mb-6">
                      {newsletter?.description || 'Get the latest beauty tips and exclusive offers directly to your inbox'}
                    </p>
                    <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-full">
                      {newsletter?.buttonLabel || 'Subscribe Now'}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Popular Tags */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="mb-6 text-gray-900">{t('magazine.popularTags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full hover:from-pink-100 hover:to-purple-100 transition-all"
                      >
                        {tag.name}
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
