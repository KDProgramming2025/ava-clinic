import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { SEO } from '../SEO';
import { useLanguage } from '../LanguageContext';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { api } from '../../api/client';
import {
  VideoRecord,
  mediaItemsFor,
  primaryMediaFor,
  previewUrlFor,
  formatVideoDuration,
  resolveVideoMediaUrl,
} from '../../utils/videoMedia';

const truncateText = (value?: string | null, limit = 140): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > limit ? `${trimmed.slice(0, limit).trim()}…` : trimmed;
};

export function VideoGalleryPage() {
  const { t, language } = useLanguage();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.videos({ status: 'PUBLISHED' });
        if (!cancelled) {
          setVideos(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'load_failed');
          setVideos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenVideo = (video: VideoRecord) => {
    const primary = primaryMediaFor(video);
    setSelectedVideo(video);
    setActiveMediaId(primary?.id || null);
    setViewerOpen(true);
  };

  const handleViewerChange = (open: boolean) => {
    setViewerOpen(open);
    if (!open) {
      setSelectedVideo(null);
      setActiveMediaId(null);
    }
  };

  const activeMedia = selectedVideo
    ? mediaItemsFor(selectedVideo).find((item) => item.id === activeMediaId) || primaryMediaFor(selectedVideo)
    : null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.example.com';
  const canonical = `${origin}/videos`;
  const alternates = useMemo(() => [
    { hrefLang: 'fa', href: `${origin}/videos` },
    { hrefLang: 'en', href: `${origin}/videos?lang=en` },
  ], [origin]);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: t('videos.title'), item: canonical },
    ],
  };

  const videoStructuredData = videos.slice(0, 12).map((video) => {
    const primary = primaryMediaFor(video);
    const preview = previewUrlFor(video);
    const uploadDate = video.takenAt || video.createdAt || new Date().toISOString();
    const payload: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title,
      description: video.caption || video.description || t('videos.subtitle'),
      uploadDate,
      url: `${canonical}#video-${video.slug || video.id}`,
    };
    if (preview) {
      payload.thumbnailUrl = preview.startsWith('http') ? preview : `${origin}${preview}`;
    }
    if (primary?.url) {
      payload.contentUrl = primary.url.startsWith('http') ? primary.url : `${origin}${primary.url}`;
    }
    if (video.sourceUrl) {
      payload.embedUrl = video.sourceUrl;
    }
    return payload;
  });

  const structuredData = [breadcrumb, ...videoStructuredData];

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const locale = language === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
  };

  const renderLoading = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div 
          key={`video-skeleton-${index}`} 
          className="border border-gray-100 shadow-sm p-0 overflow-hidden bg-card text-card-foreground flex flex-col gap-6"
          style={{ borderRadius: '40px' }}
        >
          <Skeleton className="h-56 w-full" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-8 py-12 text-center">
      <p className="text-2xl font-semibold text-gray-900">{t('videos.emptyStateTitle')}</p>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{t('videos.emptyStateBody')}</p>
    </div>
  );

  const renderError = () => (
    <div className="rounded-3xl border border-red-100 bg-red-50 px-8 py-6 text-red-700">
      <p className="font-semibold">{t('videos.loadFailed')}</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );

  const renderVideoCard = (video: VideoRecord, index: number) => {
    const preview = previewUrlFor(video);
    const captionPreview = truncateText(video.caption || video.description);
    const primaryMedia = primaryMediaFor(video);
    const duration = formatVideoDuration(video.durationSeconds || primaryMedia?.durationSeconds);
    const mediaItems = mediaItemsFor(video);
    const isPortrait = (primaryMedia?.height ?? 0) > (primaryMedia?.width ?? 0);
    const mediaRatioClass = isPortrait ? 'aspect-[9/16]' : 'aspect-video';
    // Prefer username (handle) over full name as per user request
    const authorLine = video.authorUsername || video.authorFullName || null;
    const mediaLabel = mediaItems.length > 1
      ? t('videos.typeCarousel', { count: mediaItems.length })
      : (primaryMedia?.type === 'VIDEO' ? t('videos.typeVideo') : t('videos.typeImage'));
    const capturedDate = formatDate(video.takenAt || video.createdAt);

    return (
      <motion.div
        key={video.id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative h-full"
      >
        <div className="group relative h-full">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[45px] bg-gradient-to-r from-pink-200/30 via-purple-200/20 to-blue-200/30 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />
          <div 
            className="relative h-full overflow-hidden border border-white/60 bg-white/85 shadow-xl ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl isolate"
            style={{ 
              borderRadius: '40px',
              transform: 'translateZ(0)', // Force GPU layer for proper clipping
              WebkitMaskImage: '-webkit-radial-gradient(white, black)', // Force clipping in some browsers
              overflow: 'hidden'
            }}
          >
            <button
              type="button"
              onClick={() => handleOpenVideo(video)}
              className="flex h-full flex-col text-left focus:outline-none w-full"
              aria-label={`${t('videos.watch')} – ${video.title}`}
            >
              <div className={`relative w-full overflow-hidden ${mediaRatioClass}`}>
                {preview ? (
                  <img src={preview} alt={video.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge className="rounded-full bg-white/80 text-xs font-semibold text-gray-700 shadow">
                    {mediaLabel}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <PlayCircle className="h-6 w-6" />
                  <span className="text-sm font-semibold">{t('videos.watch')}</span>
                  {duration && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {duration}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <h3 className="text-xl font-semibold text-gray-900 text-right" dir="rtl">{video.title}</h3>
                <div className="mt-auto flex items-center justify-between text-sm text-gray-500 w-full">
                  {capturedDate && <span>{capturedDate}</span>}
                  {authorLine && <span className="text-gray-400" dir="ltr">@{authorLine}</span>}
                </div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const mediaItems = selectedVideo ? mediaItemsFor(selectedVideo) : [];
  const isActivePortrait = activeMedia ? (activeMedia.height ?? 0) > (activeMedia.width ?? 0) : false;
  const { playerStyle, dialogMaxWidth } = useMemo(() => {
    if (isActivePortrait) {
      return {
        playerStyle: {
          aspectRatio: '9 / 16',
          maxHeight: '80vh',
          width: '100%',
          borderRadius: '25px',
        } as CSSProperties,
        dialogMaxWidth: 'min(500px, 98vw)',
      };
    }
    return {
      playerStyle: {
        aspectRatio: '16 / 9',
        maxHeight: '60vh',
        width: '100%',
        borderRadius: '25px',
      } as CSSProperties,
      dialogMaxWidth: 'min(1200px, 98vw)',
    };
  }, [isActivePortrait]);
  return (
    <div className="min-h-screen bg-white pt-20">
      <SEO
        title={t('videos.title')}
        description={t('videos.subtitle')}
        canonical={canonical}
        alternates={alternates}
        image="/og-image.jpg"
        type="website"
        jsonLd={structuredData}
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          {error && renderError()}
          {loading && renderLoading()}
          {!loading && !error && videos.length === 0 && renderEmpty()}
          {!loading && !error && videos.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => renderVideoCard(video, index))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={viewerOpen} onOpenChange={handleViewerChange}>
        <DialogContent
          className="border border-white/80 bg-white/95 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.45)] backdrop-blur-md max-h-[calc(100vh-2rem)] overflow-hidden p-0"
          style={{ width: '100%', maxWidth: dialogMaxWidth, borderRadius: '2rem' }}
        >
          <div className="sr-only">
            <DialogTitle>{selectedVideo?.title || t('videos.watch')}</DialogTitle>
          </div>
          {selectedVideo && (
            <div
              className="flex flex-col px-8 md:px-14 overflow-y-auto h-full w-full"
              style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}
            >
              <div className="flex-1 min-h-0 flex flex-col gap-6">
                <div
                  className="relative mx-auto w-full overflow-hidden rounded-[25px] bg-black shadow-inner flex-shrink-0"
                  style={playerStyle}
                >
                  {(() => {
                    // If we have active media (local video/image), show it first
                    if (activeMedia?.type === 'VIDEO') {
                      return (
                        <video
                          key={activeMedia.id}
                          className="h-full w-full object-contain bg-black rounded-[25px]"
                          controls
                          preload="metadata"
                          poster={resolveVideoMediaUrl(activeMedia.previewUrl || selectedVideo.thumbnail || undefined)}
                        >
                          <source src={resolveVideoMediaUrl(activeMedia.url)} type="video/mp4" />
                        </video>
                      );
                    }
                    
                    if (activeMedia?.type === 'IMAGE') {
                      return (
                        <img 
                          src={resolveVideoMediaUrl(activeMedia.url)} 
                          alt={selectedVideo.title} 
                          className="h-full w-full object-contain bg-black rounded-[25px]" 
                        />
                      );
                    }

                    // Fallback to Instagram Embed if no local media but sourceUrl is Instagram
                    const instagramEmbedUrl = selectedVideo.sourceUrl && selectedVideo.sourceUrl.includes('instagram.com/p/') 
                      ? `${selectedVideo.sourceUrl.replace(/\/$/, '')}/embed` 
                      : null;

                    if (instagramEmbedUrl) {
                      return (
                        <iframe
                          src={instagramEmbedUrl}
                          className="h-full w-full rounded-[25px] bg-white"
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency
                        />
                      );
                    }

                    return (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    );
                  })()}
                </div>

                <div className="mt-6 flex-1 min-h-0 space-y-4 overflow-y-auto rounded-2xl border border-gray-100 bg-white/80 p-6">
                  {mediaItems.length > 1 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">{t('videos.relatedMediaLabel')}</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {mediaItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveMediaId(item.id)}
                            className={`relative h-20 w-32 overflow-hidden rounded-xl border transition ${item.id === activeMedia?.id ? 'border-pink-500 ring-2 ring-pink-100' : 'border-gray-200'}`}
                            aria-label={item.type === 'VIDEO' ? t('videos.typeVideo') : t('videos.typeImage')}
                          >
                            {item.previewUrl || item.url ? (
                              <img src={resolveVideoMediaUrl(item.previewUrl || item.url)} alt={selectedVideo.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gray-100" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVideo.caption && (
                    <div className="rounded-2xl bg-gray-50/90 p-5 text-sm leading-relaxed text-gray-700 mb-10 text-right" dir="rtl">
                      <p className="whitespace-pre-wrap">{selectedVideo.caption}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {selectedVideo.sourceUrl && (
                      <Button asChild variant="outline" className="rounded-2xl">
                        <a href={selectedVideo.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {t('videos.sourceLink')}
                        </a>
                      </Button>
                    )}
                    {activeMedia?.durationSeconds && (
                      <Badge className="bg-gray-900 text-white">
                        {formatVideoDuration(activeMedia.durationSeconds)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
