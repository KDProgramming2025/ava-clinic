import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, UploadCloud, Trash2, Search, Plus, Tag } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { resolveMediaUrl } from '../../../utils/media';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  url: string;
  publicUrl?: string | null;
  alt?: string | null;
  type?: string | null;
  labels?: any;
  createdAt?: string;
}

export function MediaLibrary() {
  const { t } = useLanguage();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filtered, setFiltered] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [labels, setLabels] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<MediaItem[]>('/media');
      setItems(data);
      setFiltered(data);
    } catch (e: any) {
  toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  useEffect(()=>{
    const q = search.toLowerCase();
    setFiltered(items.filter(i => i.alt?.toLowerCase().includes(q) || i.url.toLowerCase().includes(q) || JSON.stringify(i.labels||'').toLowerCase().includes(q)));
  }, [search, items]);

  const resetUpload = () => { setFile(null); setAlt(''); setLabels(''); };

  const handleUpload = async () => {
  if (!file) { toast.error(t('admin.media.selectFileError')); return; }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      if (alt.trim()) fd.append('alt', alt.trim());
      if (labels.trim()) fd.append('labels', labels.trim());
      const created = await apiFetch<MediaItem>('/media/upload', { method: 'POST', body: fd });
      setItems(prev => [created, ...prev]);
  toast.success(t('admin.media.uploaded'));
      resetUpload();
      setUploadOpen(false);
    } catch (e: any) {
  toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally { setUploading(false); }
  };

  const deleteItem = async (m: MediaItem) => {
  if (!confirm(t('admin.media.deleteConfirm'))) return;
    try {
      await apiFetch(`/media/${m.id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(x => x.id !== m.id));
  toast.success(t('admin.media.deleted'));
    } catch (e: any) {
  toast.error(e?.message || t('admin.media.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.mediaLibrary.title')}</h1>
          <p className="text-gray-600">{t('admin.mediaLibrary.subtitle')}</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> {t('admin.media.upload')}
        </Button>
      </div>

      {/* Search & Stats */}
      <Card className="p-4 border-0 shadow-lg flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input value={search} onChange={(e)=> setSearch(e.target.value)} placeholder={t('admin.media.searchPlaceholder')} className="pl-10 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">{t('admin.media.total')}</p>
            <p className="text-gray-900 font-semibold">{items.length}</p>
          </Card>
          <Card className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">{t('admin.media.filtered')}</p>
            <p className="text-gray-900 font-semibold">{filtered.length}</p>
          </Card>
        </div>
      </Card>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((m, idx) => {
          const mediaSrc = resolveMediaUrl(m.publicUrl || m.url).replace("https://avakasht.ir","");

          console.log("www: "+mediaSrc);
          return (
          <motion.div key={m.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.03 }}>
            <Card className="group relative overflow-hidden border-0 shadow-lg">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {(m.url || '').match(/\.(mp4|webm|mov|m4v)$/i) ? (
                  <video src={mediaSrc} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaSrc || m.url} alt={m.alt || ''} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-600" />
                  <span className="text-gray-900 text-xs truncate flex-1" title={m.url}>{m.url}</span>
                </div>
                {m.alt && <p className="text-xs text-gray-600 truncate">Alt: {m.alt}</p>}
                {m.labels && Array.isArray(m.labels) && (
                  <div className="flex flex-wrap gap-1">
                    {m.labels.slice(0,6).map((l: string) => <Badge key={l} className="bg-purple-100 text-purple-700 text-[10px]">{l}</Badge>)}
                    {m.labels.length > 6 && <Badge className="bg-purple-200 text-purple-700 text-[10px]">+{m.labels.length - 6}</Badge>}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => deleteItem(m)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );})}
  {!filtered.length && !loading && <p className="col-span-full text-center text-gray-500 py-10">{t('admin.media.noResults')}</p>}
  {loading && <p className="col-span-full text-center text-gray-500 py-10">{t('admin.media.loading')}</p>}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={(o: boolean) => { if(!o){ setUploadOpen(false); resetUpload(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('admin.media.uploadDialog')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-xl" />
            <Input placeholder={t('admin.media.altInput')} value={alt} onChange={(e)=> setAlt(e.target.value)} className="rounded-xl" />
            <Textarea placeholder={t('admin.media.labelsPlaceholder')} value={labels} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=> setLabels(e.target.value)} rows={3} />
            {file && (
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> {file.name} ({Math.round(file.size/1024)} KB)
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => { setUploadOpen(false); resetUpload(); }}>{t('admin.cancel')}</Button>
            <Button disabled={uploading} onClick={handleUpload} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              {uploading ? t('admin.media.uploading') : t('admin.media.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MediaLibrary;
