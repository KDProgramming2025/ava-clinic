import { resolveMediaUrl } from './media';

export type VideoStatus = 'DRAFT' | 'PUBLISHED';

export type VideoMediaItem = {
  id: string;
  type: 'VIDEO' | 'IMAGE';
  url: string;
  previewUrl?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
};

export type VideoRecord = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  caption?: string | null;
  thumbnail?: string | null;
  durationSeconds?: number | null;
  takenAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sourceUrl?: string | null;
  authorUsername?: string | null;
  authorFullName?: string | null;
  status?: VideoStatus;
  media?: { items?: VideoMediaItem[] } | null;
};

export const mediaItemsFor = (video?: VideoRecord | null): VideoMediaItem[] => {
  if (!video?.media) return [];
  const raw = video.media.items;
  return Array.isArray(raw) ? raw.filter((item): item is VideoMediaItem => Boolean(item && item.url)) : [];
};

export const primaryMediaFor = (video?: VideoRecord | null): VideoMediaItem | undefined => {
  const items = mediaItemsFor(video);
  return items.find((item) => item.type === 'VIDEO') || items[0];
};

export const previewUrlFor = (video: VideoRecord): string | null => {
  const media = primaryMediaFor(video);
  const candidate = media?.previewUrl || media?.url || video.thumbnail || null;
  if (!candidate) return null;
  const resolved = resolveMediaUrl(candidate);
  return resolved || null;
};

export const resolveVideoMediaUrl = (value?: string | null): string => {
  return resolveMediaUrl(value);
};

export const formatVideoDuration = (seconds?: number | null): string | null => {
  if (!seconds && seconds !== 0) return null;
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
