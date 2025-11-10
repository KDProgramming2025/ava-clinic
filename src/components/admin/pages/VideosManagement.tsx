import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Video as VideoIcon, Plus, Edit, Trash2, Play, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { apiFetch } from '../../../api/client';

type Video = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  durationSeconds?: number | null;
  views?: number;
  status: 'DRAFT' | 'PUBLISHED';
  category?: { id: string; name: string; slug: string } | null;
};
type VideoCategory = { id: string; name: string; slug: string };

export function VideosManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<{ title: string; slug: string; description: string; thumbnail: string; durationSeconds: string; status: 'DRAFT' | 'PUBLISHED'; categoryId: string }>({
    title: '', slug: '', description: '', thumbnail: '', durationSeconds: '', status: 'DRAFT', categoryId: ''
  });

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      const [vids, cats] = await Promise.all([
        apiFetch<Video[]>('/videos'),
        apiFetch<VideoCategory[]>('/video-categories'),
      ]);
      setVideos(vids); setCategories(cats);
    } catch (e: any) {
      setError(e?.message || 'Failed to load videos');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', description: '', thumbnail: '', durationSeconds: '', status: 'DRAFT', categoryId: '' });
    setIsDialogOpen(true);
  };
  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({
      title: v.title,
      slug: v.slug || '',
      description: v.description || '',
      thumbnail: v.thumbnail || '',
      durationSeconds: v.durationSeconds?.toString() || '',
      status: v.status,
      categoryId: v.category?.id || '',
    });
    setIsDialogOpen(true);
  };
  const saveVideo = async () => {
    try {
      if (!form.title.trim()) { toast.error('Title is required'); return; }
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        durationSeconds: form.durationSeconds ? parseInt(form.durationSeconds) : undefined,
        status: form.status,
        categoryId: form.categoryId || undefined,
      };
      if (editing) {
        await apiFetch(`/videos/${editing.id}`, { method: 'PUT', body: payload });
        toast.success('Video updated');
      } else {
        await apiFetch('/videos', { method: 'POST', body: payload });
        toast.success('Video created');
      }
      setIsDialogOpen(false); setEditing(null); await fetchAll();
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };
  const handleDelete = async (v: Video) => {
    if (!confirm(`Delete video "${v.title}"?`)) return;
    try { await apiFetch(`/videos/${v.id}`, { method: 'DELETE' }); setVideos(prev => prev.filter(x => x.id !== v.id)); toast.success('Deleted'); }
    catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  };

  const fmtDuration = (s?: number | null) => {
    if (!s || s <= 0) return '—';
    const m = Math.floor(s / 60); const ss = s % 60; return `${m}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{videos.length} videos total</p>
        <Button onClick={openNew} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Video
        </Button>
      </div>

      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="relative h-48 overflow-hidden group">
                {video.thumbnail ? (
                  <ImageWithFallback src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="w-10 h-10" /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {fmtDuration(video.durationSeconds)}
                </div>
                {video.category && (
                  <Badge className="absolute top-2 left-2 bg-purple-500 text-white">{video.category.name}</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-gray-900 line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between text-gray-600 mb-4">
                  <span>{(video.views ?? 0).toLocaleString()} views</span>
                  <Badge className={video.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {video.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(video)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-red-600"
                    onClick={() => handleDelete(video)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

  <Dialog open={isDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setIsDialogOpen(false); setEditing(null);} }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Video' : 'New Video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="v-title">Title*</Label>
              <Input id="v-title" value={form.title} onChange={(e)=> setForm(f=>({...f,title:e.target.value}))} className="mt-2 rounded-xl" placeholder="Video title" />
            </div>
            <div>
              <Label htmlFor="v-slug">Slug</Label>
              <Input id="v-slug" value={form.slug} onChange={(e)=> setForm(f=>({...f,slug:e.target.value.replace(/\s+/g,'-').toLowerCase()}))} className="mt-2 rounded-xl" placeholder="optional-slug" />
            </div>
            <div>
              <Label htmlFor="v-desc">Description</Label>
              <Textarea id="v-desc" value={form.description} onChange={(e)=> setForm(f=>({...f,description:e.target.value}))} className="mt-2 rounded-xl" placeholder="Short description" />
            </div>
            <div>
              <Label htmlFor="v-thumb">Thumbnail URL</Label>
              <Input id="v-thumb" value={form.thumbnail} onChange={(e)=> setForm(f=>({...f,thumbnail:e.target.value}))} className="mt-2 rounded-xl" placeholder="https://..." />
              {form.thumbnail && <img src={form.thumbnail} alt="preview" className="mt-2 h-28 w-full object-cover rounded-xl border" />}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="v-duration">Duration (sec)</Label>
                <Input id="v-duration" value={form.durationSeconds} onChange={(e)=> setForm(f=>({...f,durationSeconds:e.target.value}))} className="mt-2 rounded-xl" placeholder="300" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e)=> setForm(f=>({...f,status:e.target.value as 'DRAFT'|'PUBLISHED'}))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
              <div>
                <Label>Category</Label>
                <select value={form.categoryId} onChange={(e)=> setForm(f=>({...f,categoryId:e.target.value}))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setIsDialogOpen(false); setEditing(null); }}>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveVideo}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
