import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Grid3x3, List, Filter, Search, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { api } from '../../api/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function VideoGalleryPage() {
  const { isRTL, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [vids, cats] = await Promise.all([api.videos(), api.videoCategories()]);
        if (cancelled) return;
  setVideos(vids || []);
  setCategories([{ id: 'all', name: t('videos.all'), slug: 'all' }, ...(cats || [])]);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load videos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredVideos = useMemo(() => {
    const lc = searchQuery.toLowerCase();
    return videos.filter(v => {
      const catSlug = v.category?.slug || v.category?.id || 'uncategorized';
      const matchesCategory = filterCategory === 'all' || catSlug === filterCategory;
      const matchesSearch = (v.title || '').toLowerCase().includes(lc) || (v.description || '').toLowerCase().includes(lc);
      return matchesCategory && matchesSearch;
    });
  }, [videos, filterCategory, searchQuery]);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds < 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const formatViews = (views?: number | null) => {
    if (views == null) return '0';
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return String(views);
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {t('videos.title')}
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('videos.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <Input
                  placeholder={t('videos.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-full`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 rounded-full">
                <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug || cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-full p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`rounded-full ${viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={`rounded-full ${viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}`}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mt-4">
            {t('videos.title')}: {filteredVideos.length}
          </p>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <div className="text-center py-20">Loading videos...</div>}
          {error && !loading && <div className="text-center py-20 text-red-600">{error}</div>}
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {!loading && !error && filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <div
                      className="relative h-56 overflow-hidden group"
                      onClick={() => setSelectedVideo(video.id)}
                    >
                      <ImageWithFallback
                        src={video.thumbnail || ''}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      
                      {/* Play Button */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-8 h-8 text-pink-500 ml-1" fill="currentColor" />
                        </div>
                      </motion.div>

                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDuration(video.durationSeconds)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>{formatViews(video.views)} views</span>
                        <span className="text-pink-500 capitalize">{video.category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {!loading && !error && filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-80 h-48 overflow-hidden group flex-shrink-0">
                        <ImageWithFallback
                          src={video.thumbnail || ''}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <Play className="w-8 h-8 text-pink-500 ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(video.durationSeconds)}
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="mb-3 text-gray-900">{video.title}</h3>
                        <p className="text-gray-600 mb-4">{video.description}</p>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>{formatViews(video.views)} views</span>
                          <span className="text-pink-500 capitalize">{video.category?.name || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">{t('videos.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Video Player</p>
                  <p className="text-white/50 mt-2">
                    {videos.find(v => v.id === selectedVideo)?.title}
                  </p>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="p-6 bg-gray-900 text-white">
                <h3 className="mb-2">
                  {videos.find(v => v.id === selectedVideo)?.title}
                </h3>
                <p className="text-white/70 mb-4">
                  {videos.find(v => v.id === selectedVideo)?.description}
                </p>
                <div className="flex items-center gap-4 text-white/60">
                  <span>{formatViews(videos.find(v => v.id === selectedVideo)?.views)} views</span>
                  <span>•</span>
                  <span className="capitalize">{videos.find(v => v.id === selectedVideo)?.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
