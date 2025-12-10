import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Skeleton } from '../../ui/skeleton';
import { useLanguage } from '../../LanguageContext';
import { api, ApiError } from '../../../api/client';
import {
  VideoRecord,
  VideoStatus,
  mediaItemsFor,
  previewUrlFor,
  primaryMediaFor,
  formatVideoDuration,
  resolveVideoMediaUrl,
} from '../../../utils/videoMedia';
import {
  ExternalLink,
  Eye,
  Info,
  Link2,
  Loader2,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  ShieldOff,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';

type AdminVideo = VideoRecord & { status: VideoStatus };
type IconComponent = (props: { className?: string }) => JSX.Element;

const statusOptions: VideoStatus[] = ['DRAFT', 'PUBLISHED'];

const instagramErrorToMessage = (t: (key: string, vars?: Record<string, string | number>) => string, code?: string) => {
  switch (code) {
    case 'instagram_invalid_url':
    case 'instagram_invalid_host':
      return t('admin.videos.error.invalidUrl');
    case 'instagram_unsupported_url':
      return t('admin.videos.error.unsupportedUrl');
    case 'instagram_fetch_failed':
      return t('admin.videos.error.fetchFailed');
    case 'instagram_parse_failed':
      return t('admin.videos.error.parseFailed');
    case 'instagram_no_media':
      return t('admin.videos.error.noMedia');
    default:
      return t('admin.videos.importFailed');
  }
};

const formatDate = (language: string, value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
};

export function VideosManagement() {
  const { t, language } = useLanguage();
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<VideoStatus>('DRAFT');
  const [importing, setImporting] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderList, setReorderList] = useState<AdminVideo[]>([]);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.videos();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || t('videos.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const openReorder = () => {
    setReorderList(videos);
    setReorderOpen(true);
  };

  const saveOrder = async () => {
    try {
      const items = reorderList.map((v, i) => ({ id: v.id, order: i }));
      await api.reorderVideos(items);
      toast.success(t('admin.videos.reorderSuccess') || 'Order saved');
      setReorderOpen(false);
      fetchVideos();
    } catch (e) {
      toast.error(t('admin.videos.reorderFailed') || 'Failed to save order');
    }
  };

  const publishedCount = useMemo(() => videos.filter((video) => video.status === 'PUBLISHED').length, [videos]);
  const draftCount = useMemo(() => videos.filter((video) => video.status !== 'PUBLISHED').length, [videos]);

  const handleImport = async () => {
    const trimmed = importUrl.trim();
    if (!trimmed) {
      toast.error(t('admin.videos.urlMissing'));
      return;
    }
    try {
      setImporting(true);
      const created = await api.importInstagramVideo(trimmed, importStatus);
      setVideos((prev) => [created, ...prev]);
      setImportUrl('');
      toast.success(t('admin.videos.importSuccess'));
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(instagramErrorToMessage(t, apiErr?.code));
    } finally {
      setImporting(false);
    }
  };

  const handleStatusChange = async (video: AdminVideo, nextStatus: VideoStatus) => {
    try {
      const updated = await api.updateVideo(video.id, { status: nextStatus });
      setVideos((prev) => prev.map((item) => (item.id === video.id ? updated : item)));
      toast.success(t('admin.videos.updateSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('admin.saveFailed'));
    }
  };

  const handleDelete = async (video: AdminVideo) => {
    const confirmed = window.confirm(t('admin.videos.deleteConfirm', { title: video.title }));
    if (!confirmed) return;
    try {
      await api.deleteVideo(video.id);
      setVideos((prev) => prev.filter((item) => item.id !== video.id));
      toast.success(t('admin.videos.deleteSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('admin.deleteFailed'));
    }
  };

  const openViewer = (video: AdminVideo) => {
    const primary = primaryMediaFor(video);
    setSelectedVideo(video);
    setActiveMediaId(primary?.id || null);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedVideo(null);
    setActiveMediaId(null);
  };

  const mediaItems = selectedVideo ? mediaItemsFor(selectedVideo) : [];
  const activeMedia = selectedVideo
    ? mediaItems.find((item) => item.id === activeMediaId) || primaryMediaFor(selectedVideo)
    : null;
  const capturedDate = selectedVideo ? formatDate(language, selectedVideo.takenAt || selectedVideo.createdAt) : null;
  const authorLabel = selectedVideo?.authorFullName || selectedVideo?.authorUsername || null;
  const metadataParts = [
    capturedDate ? t('videos.capturedOn', { date: capturedDate }) : null,
    authorLabel,
  ].filter((value): value is string => Boolean(value));

  const renderStatCard = (label: string, value: string, Icon: IconComponent, accent: string) => (
    <Card className={`border ${accent} rounded-2xl p-5 shadow-sm flex items-center gap-3`}>
      <div className="rounded-2xl bg-white/70 p-2 text-gray-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  const renderLoading = () => (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={`video-skel-${idx}`} className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-8 py-12 text-center">
      <p className="text-2xl font-semibold text-gray-900">{t('admin.videos.libraryEmpty')}</p>
      <p className="mt-3 text-gray-600">{t('admin.videos.libraryEmptyCta')}</p>
    </div>
  );

  const renderVideoCard = (video: AdminVideo, index: number) => {
    const preview = previewUrlFor(video);
    const duration = formatVideoDuration(video.durationSeconds || primaryMediaFor(video)?.durationSeconds);
    const mediaCount = mediaItemsFor(video).length;
    const mediaLabel = mediaCount === 1
      ? t('admin.videos.mediaCount', { count: mediaCount })
      : t('admin.videos.mediaCountPlural', { count: mediaCount });
    const captured = formatDate(language, video.takenAt || video.createdAt);

    return (
      <motion.div
        key={video.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="overflow-hidden border border-gray-100 shadow-lg rounded-3xl flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden">
            {preview ? (
              <img src={preview} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge className={video.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {video.status === 'PUBLISHED' ? t('admin.videos.statusPublished') : t('admin.videos.statusDraft')}
              </Badge>
              {duration && (
                <Badge className="bg-white/20 text-white border border-white/40">
                  {duration}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">{video.title}</h3>
              <p className="text-sm text-gray-500">
                {captured && <span className="mr-2">{captured}</span>}
                {video.authorUsername && <span>@{video.authorUsername}</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">{mediaLabel}</Badge>
              {video.sourceUrl && (
                <Button variant="ghost" size="sm" className="text-pink-600 px-2" asChild>
                  <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Link2 className="h-4 w-4 mr-1" />
                    {t('admin.videos.sourceLink')}
                  </a>
                </Button>
              )}
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openViewer(video)}>
                <Eye className="h-4 w-4 mr-2" />
                {t('admin.videos.view')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => handleStatusChange(video, video.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
              >
                {video.status === 'PUBLISHED' ? (
                  <>
                    <ShieldOff className="h-4 w-4 mr-2 text-amber-600" />
                    {t('admin.videos.unpublish')}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                    {t('admin.videos.publish')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-red-600"
                onClick={() => handleDelete(video)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('admin.videos.delete')}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('admin.videos.importManagerTitle')}</h1>
          <p className="text-gray-500">{t('admin.videos.importManagerSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={openReorder} disabled={loading || videos.length === 0}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {t('admin.videos.reorder') || 'Reorder'}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={fetchVideos} disabled={loading || importing}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            {t('admin.reload')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {renderStatCard(t('admin.videos.statusPublished'), publishedCount.toString(), ShieldCheck, 'border-green-100 bg-green-50')}
        {renderStatCard(t('admin.videos.statusDraft'), draftCount.toString(), ShieldOff, 'border-amber-100 bg-amber-50')}
        {renderStatCard(t('admin.videos.totalSuffix'), videos.length.toString(), PlayCircle, 'border-blue-100 bg-blue-50')}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      <Card className="p-6 border border-gray-100 shadow-sm rounded-3xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div>
              <Label htmlFor="instagram-url">{t('admin.videos.urlLabel')}</Label>
              <Input
                id="instagram-url"
                type="url"
                value={importUrl}
                onChange={(event) => setImportUrl(event.target.value)}
                placeholder={t('admin.videos.urlPlaceholder')}
                className="mt-2 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="instagram-status">{t('admin.videos.statusLabel')}</Label>
              <select
                id="instagram-status"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                value={importStatus}
                onChange={(event) => setImportStatus(event.target.value as VideoStatus)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'PUBLISHED' ? t('admin.videos.statusPublished') : t('admin.videos.statusDraft')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-amber-900">
            <div className="flex items-center gap-2 text-amber-900">
              <Info className="h-4 w-4" />
              <h3 className="font-semibold">{t('admin.videos.instructionsTitle')}</h3>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>{t('admin.videos.instructionsStep1')}</li>
              <li>{t('admin.videos.instructionsStep2')}</li>
              <li>{t('admin.videos.instructionsStep3')}</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600"
              onClick={handleImport}
              disabled={importing}
            >
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.videos.importButton')}
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => setImportUrl('')} disabled={importing}>
              {t('admin.clear')}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-500">{t('admin.videos.libraryTitle')}</p>
            <h2 className="text-2xl font-semibold text-gray-900">{t('admin.videos.librarySubtitle')}</h2>
          </div>
          <Button variant="ghost" className="text-pink-600" onClick={fetchVideos} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('admin.reload')}
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          {loading && renderLoading()}
          {!loading && videos.length === 0 && renderEmpty()}
          {!loading && videos.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video, index) => renderVideoCard(video, index))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={viewerOpen} onOpenChange={(open) => (open ? setViewerOpen(true) : closeViewer())}>
        <DialogContent className="w-full max-w-4xl rounded-3xl border border-gray-100 bg-white p-0 shadow-2xl">
          {selectedVideo && (
            <>
              <DialogHeader className="px-6 pt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-pink-500">{t('admin.videos.view')}</p>
                <DialogTitle className="text-2xl font-semibold text-gray-900">{selectedVideo.title}</DialogTitle>
                {metadataParts.length > 0 && (
                  <DialogDescription className="text-gray-500">
                    {metadataParts.join(' · ')}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-6 px-6 pb-6">
                <div className="overflow-hidden rounded-2xl bg-black">
                  {activeMedia?.type === 'VIDEO' ? (
                    <video
                      key={activeMedia.id}
                      className="h-full w-full"
                      controls
                      preload="metadata"
                      poster={resolveVideoMediaUrl(activeMedia.previewUrl || selectedVideo.thumbnail || undefined)}
                    >
                      <source src={resolveVideoMediaUrl(activeMedia.url)} type="video/mp4" />
                    </video>
                  ) : activeMedia ? (
                    <img src={resolveVideoMediaUrl(activeMedia.url)} alt={selectedVideo.title} className="h-full w-full object-contain bg-black" />
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>

                {mediaItems.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {mediaItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMediaId(item.id)}
                        className={`relative h-20 w-32 overflow-hidden rounded-xl border ${item.id === activeMedia?.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'}`}
                      >
                        {item.previewUrl || item.url ? (
                          <img src={resolveVideoMediaUrl(item.previewUrl || item.url)} alt={selectedVideo.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedVideo.caption && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
                    <p className="mb-2 font-semibold text-gray-900">{t('videos.captionLabel')}</p>
                    {selectedVideo.caption}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {selectedVideo.sourceUrl && (
                    <Button asChild variant="outline" className="rounded-2xl">
                      <a href={selectedVideo.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {t('admin.videos.sourceLink')}
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
        <DialogContent className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-0 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold text-gray-900">{t('admin.videos.reorderTitle') || 'Reorder Videos'}</DialogTitle>
            <DialogDescription>{t('admin.videos.reorderDesc') || 'Drag and drop to reorder videos'}</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <Reorder.Group axis="y" values={reorderList} onReorder={setReorderList} className="space-y-2">
              {reorderList.map((video) => (
                <Reorder.Item key={video.id} value={video} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow">
                   <div className="h-12 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                     {video.thumbnail ? (
                       <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                     ) : (
                       <div className="h-full w-full bg-gray-200" />
                     )}
                   </div>
                   <span className="truncate font-medium text-gray-700 text-sm">{video.title}</span>
                   <div className="ml-auto text-gray-400">
                     <ArrowUpDown className="h-4 w-4" />
                   </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          <div className="flex justify-end gap-2 p-6 pt-2 border-t border-gray-100 bg-white sticky bottom-0 z-10">
            <Button variant="outline" className="rounded-xl" onClick={() => setReorderOpen(false)}>{t('admin.cancel')}</Button>
            <Button className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white" onClick={saveOrder}>{t('admin.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
