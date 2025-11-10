import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Star, Tag as TagIcon, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { apiFetch } from '../../../api/client';
import { useEffect, useState } from 'react';

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  readTimeMinutes?: number | null;
  status: string;
  featured: boolean;
  publishedAt?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  tags?: { id: string; name: string; slug: string }[];
};
type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };

export function MagazineManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<{ title: string; slug: string; excerpt: string; image: string; readTimeMinutes: string; status: string; featured: boolean; categoryId: string; tagIds: string[] }>({
    title: '', slug: '', excerpt: '', image: '', readTimeMinutes: '', status: 'DRAFT', featured: false, categoryId: '', tagIds: []
  });

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      const [arts, cats, tgs] = await Promise.all([
        apiFetch<Article[]>('/articles'),
        apiFetch<Category[]>('/categories'),
        apiFetch<Tag[]>('/tags'),
      ]);
      setArticles(arts); setCategories(cats); setTags(tgs);
    } catch (e: any) {
      setError(e?.message || 'Failed to load content');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', image: '', readTimeMinutes: '', status: 'DRAFT', featured: false, categoryId: '', tagIds: [] });
    setIsDialogOpen(true);
  };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || '',
      image: a.image || '',
      readTimeMinutes: a.readTimeMinutes?.toString() || '',
      status: a.status,
      featured: a.featured,
      categoryId: a.category?.id || '',
      tagIds: (a.tags || []).map(t => t.id),
    });
    setIsDialogOpen(true);
  };
  const saveArticle = async () => {
    try {
      if (!form.title.trim() || !form.slug.trim()) { toast.error('Title & Slug required'); return; }
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || undefined,
        image: form.image.trim() || undefined,
        readTimeMinutes: form.readTimeMinutes ? parseInt(form.readTimeMinutes) : undefined,
        status: form.status,
        featured: form.featured,
        categoryId: form.categoryId || undefined,
        tagIds: form.tagIds,
      };
      if (editing) {
        await apiFetch(`/articles/${editing.id}`, { method: 'PUT', body: payload });
        toast.success('Article updated');
      } else {
        await apiFetch('/articles', { method: 'POST', body: payload });
        toast.success('Article created');
      }
      setIsDialogOpen(false); setEditing(null); await fetchAll();
    } catch (e: any) {
      if (e?.code === 'slug_conflict') toast.error('Slug already exists'); else toast.error(e?.message || 'Save failed');
    }
  };
  const toggleFeatured = async (a: Article) => {
    try {
      const updated = await apiFetch<Article>(`/articles/${a.id}/feature`, { method: 'PATCH', body: { featured: !a.featured } });
      setArticles(prev => prev.map(x => x.id === a.id ? updated : x));
      toast.success(updated.featured ? 'Marked featured' : 'Unfeatured');
    } catch (e: any) { toast.error(e?.message || 'Feature toggle failed'); }
  };
  const handleDelete = async (a: Article) => {
    if (!confirm(`Delete article "${a.title}"?`)) return;
    try { await apiFetch(`/articles/${a.id}`, { method: 'DELETE' }); setArticles(prev => prev.filter(x => x.id !== a.id)); toast.success('Deleted'); }
    catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{articles.length} articles total</p>
        <Button onClick={openNew} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>
      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}
      {!loading && !error && (
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="flex">
                <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100">
                  {article.image ? (
                    <ImageWithFallback src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-10 h-10" /></div>
                  )}
                  {article.category && (
                    <Badge className="absolute top-2 left-2 bg-blue-500 text-white">{article.category.name}</Badge>
                  )}
                  {article.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 flex items-center gap-1"><Star className="w-3 h-3" /> Featured</Badge>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="mb-2 text-gray-900 line-clamp-2">{article.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.tags?.map(t => (
                      <Badge key={t.id} className="bg-purple-100 text-purple-700 flex items-center gap-1"><TagIcon className="w-3 h-3" />{t.name}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    {article.readTimeMinutes && <span>{article.readTimeMinutes} min read</span>}
                    <span>•</span>
                    <span>{article.status.toLowerCase()}</span>
                  </div>
                  <div className="mt-auto">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{article.status}</Badge>
                      <Badge className="bg-gray-100 text-gray-700">Slug: {article.slug}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(article)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toggleFeatured(article)}>
                        <Star className={`w-4 h-4 mr-2 ${article.featured ? 'text-yellow-500' : 'text-gray-400'}`} />
                        {article.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-red-600"
                        onClick={() => handleDelete(article)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

  <Dialog open={isDialogOpen} onOpenChange={(o: boolean) => { if(!o){ setIsDialogOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="a-title">Title*</Label>
              <Input id="a-title" value={form.title} onChange={(e)=> setForm(f=>({...f,title:e.target.value}))} placeholder="Article title" className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="a-slug">Slug*</Label>
              <Input id="a-slug" value={form.slug} onChange={(e)=> setForm(f=>({...f,slug:e.target.value.replace(/\s+/g,'-').toLowerCase()}))} placeholder="article-slug" className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="a-excerpt">Excerpt</Label>
              <Textarea id="a-excerpt" value={form.excerpt} onChange={(e)=> setForm(f=>({...f,excerpt:e.target.value}))} placeholder="Short summary" className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="a-image">Image URL</Label>
              <Input id="a-image" value={form.image} onChange={(e)=> setForm(f=>({...f,image:e.target.value}))} placeholder="https://..." className="mt-2 rounded-xl" />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-32 w-full object-cover rounded-xl border" />}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="a-read">Read Time (min)</Label>
                <Input id="a-read" value={form.readTimeMinutes} onChange={(e)=> setForm(f=>({...f,readTimeMinutes:e.target.value}))} placeholder="10" className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e)=> setForm(f=>({...f,status:e.target.value}))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
              <div className="flex items-center pt-6 gap-2">
                <input type="checkbox" id="a-featured" checked={form.featured} onChange={(e)=> setForm(f=>({...f,featured:e.target.checked}))} className="rounded" />
                <Label htmlFor="a-featured" className="cursor-pointer flex items-center gap-1"><Star className="w-4 h-4" /> Featured</Label>
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.categoryId} onChange={(e)=> setForm(f=>({...f,categoryId:e.target.value}))} className="mt-2 rounded-xl w-full border-gray-300">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map(t => {
                  const active = form.tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, tagIds: active ? f.tagIds.filter(id => id !== t.id) : [...f.tagIds, t.id] }))}
                      className={`px-3 py-1 rounded-full text-sm border transition ${active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >{t.name}</button>
                  );
                })}
                {!tags.length && <div className="text-xs text-gray-500">No tags</div>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setIsDialogOpen(false); setEditing(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveArticle}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
