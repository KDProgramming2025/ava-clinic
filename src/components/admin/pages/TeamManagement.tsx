import { ChangeEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Edit, Trash2, UserPlus, Image as ImageIcon, CheckCircle, XCircle, UploadCloud } from 'lucide-react';
import { Card } from '../../ui/card';
import { useLanguage } from '../../LanguageContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { resolveMediaUrl } from '../../../utils/media';

type TeamMember = {
  id: string;
  name: string;
  nameEn?: string | null;
  nameFa?: string | null;
  role: string;
  roleEn?: string | null;
  roleFa?: string | null;
  bio?: string | null;
  bioEn?: string | null;
  bioFa?: string | null;
  image?: string | null;
  active: boolean;
  createdAt?: string;
};

export function TeamManagement() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<{ 
    nameEn: string; 
    nameFa: string; 
    roleEn: string; 
    roleFa: string; 
    bioEn: string; 
    bioFa: string; 
    image: string; 
    active: boolean;
  }>({ nameEn: '', nameFa: '', roleEn: '', roleFa: '', bioEn: '', bioFa: '', image: '', active: true });
  const [imageProcessing, setImageProcessing] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      // Admin needs to see all members including inactive ones
      const data = await apiFetch<TeamMember[]>('/team?includeInactive=true');
      setMembers(data);
    } catch (e: any) {
  setError(e?.message || t('admin.saveFailed'));
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { 
    setEditing(null); 
    setForm({ nameEn: '', nameFa: '', roleEn: '', roleFa: '', bioEn: '', bioFa: '', image: '', active: true }); 
    setIsDialogOpen(true); 
  };
  
  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ 
      nameEn: m.nameEn || m.name || '', 
      nameFa: m.nameFa || m.name || '', 
      roleEn: m.roleEn || m.role || '', 
      roleFa: m.roleFa || m.role || '', 
      bioEn: m.bioEn || m.bio || '', 
      bioFa: m.bioFa || m.bio || '', 
      image: m.image || '', 
      active: m.active 
    });
    setIsDialogOpen(true);
  };

  const persistImage = async (nextUrl: string | null) => {
    setForm(f => ({ ...f, image: nextUrl || '' }));
  };

  const uploadImage = async (file: File) => {
    const previousUrl = form.image || null;
    try {
      setImageProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      const alt = form.nameFa || form.nameEn;
      if (alt) formData.append('alt', alt);
      const created = await apiFetch<{ url: string; publicUrl?: string | null }>('/media/upload', { 
        method: 'POST', 
        body: formData 
      });
      if (created?.url) {
        await persistImage(created.url);
      }
    } catch (e: any) {
      setForm(f => ({ ...f, image: previousUrl || '' }));
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setImageProcessing(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    event.target.value = '';
  };

  const removeImage = async () => {
    if (!form.image) return;
    setImageProcessing(true);
    await persistImage(null);
    setImageProcessing(false);
  };

  const save = async () => {
    try {
      if ((!form.nameEn.trim() && !form.nameFa.trim()) || (!form.roleEn.trim() && !form.roleFa.trim())) { 
        toast.error(t('admin.name') + ' & ' + t('admin.role') + ' ' + t('admin.required')); 
        return; 
      }
      
      const canonicalName = form.nameFa.trim() || form.nameEn.trim();
      const canonicalRole = form.roleFa.trim() || form.roleEn.trim();
      const canonicalBio = form.bioFa.trim() || form.bioEn.trim();
      
      const payload = {
        name: canonicalName,
        nameEn: form.nameEn.trim() || null,
        nameFa: form.nameFa.trim() || null,
        role: canonicalRole,
        roleEn: form.roleEn.trim() || null,
        roleFa: form.roleFa.trim() || null,
        bio: canonicalBio || null,
        bioEn: form.bioEn.trim() || null,
        bioFa: form.bioFa.trim() || null,
        image: form.image.trim() || null,
        active: form.active,
      };
      
      if (editing) { 
        await apiFetch(`/team/${editing.id}`, { method: 'PUT', body: payload }); 
        toast.success(t('admin.memberUpdated')); 
      } else { 
        await apiFetch('/team', { method: 'POST', body: payload }); 
        toast.success(t('admin.memberAdded')); 
      }
      setIsDialogOpen(false); 
      setEditing(null); 
      await fetchAll();
    } catch (e: any) { 
      toast.error(e?.message || t('admin.saveFailed')); 
    }
  };
  const del = async (m: TeamMember) => {
  if (!confirm(`${t('admin.deleteMemberConfirm')} "${m.name}"?`)) return;
  try { await apiFetch(`/team/${m.id}`, { method: 'DELETE' }); setMembers(prev => prev.filter(x => x.id !== m.id)); toast.success(t('admin.deleted')); }
  catch (e: any) { toast.error(e?.message || t('admin.deleteFailed')); }
  };
  const toggleActive = async (m: TeamMember) => {
    try { const updated = await apiFetch<TeamMember>(`/team/${m.id}`, { method: 'PUT', body: { active: !m.active } }); setMembers(prev => prev.map(x => x.id === m.id ? updated : x)); }
  catch (e: any) { toast.error(e?.message || t('admin.statusUpdateFailed')); }
  };

  const activeCount = members.filter(m => m.active).length;

  const initials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase();
  
  const imagePreviewUrl = resolveMediaUrl(form.image);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.teamManagement')}</h1>
          <p className="text-gray-600">{t('admin.teamManagementSubtitle')}</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
          <UserPlus className="w-4 h-4 mr-2" /> {t('admin.newMember')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          { [
          { label: t('admin.totalMembers'), value: members.length, color: 'from-pink-500 to-rose-600' },
          { label: t('admin.activeMembers'), value: activeCount, color: 'from-green-500 to-emerald-600' },
          { label: t('admin.inactiveMembers'), value: members.length - activeCount, color: 'from-purple-500 to-violet-600' },
          { label: t('admin.visibilityPercent'), value: members.length? Math.round(activeCount / members.length * 100) + '%' : '—', color: 'from-blue-500 to-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Team Grid */}
  {loading && <div className="p-4 text-gray-500">{t('common.loading')}</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="text-center mb-4">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                    {m.image ? (
                      <ImageWithFallback src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <Avatar className="w-full h-full"><AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl">{initials(m.name)}</AvatarFallback></Avatar>
                    )}
                  </div>
                  <h3 className="text-gray-900 mb-1">{m.name}</h3>
                  <p className="text-pink-600 mb-2">{m.role}</p>
                  <div className="flex items-center justify-center mb-2">
                    <Badge className={m.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}>{m.active ? t('admin.active') : t('admin.inactive')}</Badge>
                  </div>
                  {m.bio && <p className="text-gray-600 text-sm line-clamp-3">{m.bio}</p>}
                </div>
                <div className="flex gap-2 mb-3">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(m)}><Edit className="w-4 h-4 mr-2" />{t('admin.edit')}</Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl text-red-600" onClick={() => del(m)}><Trash2 className="w-4 h-4 mr-2" />{t('admin.delete')}</Button>
                </div>
                <Button variant="outline" size="sm" className={`w-full rounded-xl ${m.active? 'text-green-700 hover:bg-green-50':'text-gray-700 hover:bg-gray-100'}`} onClick={() => toggleActive(m)}>
                  {m.active ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} {m.active ? t('admin.deactivate') : t('admin.activate')}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

  <Dialog open={isDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setIsDialogOpen(false); setEditing(null);} }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('admin.editMember') : t('admin.newMemberDialog')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tm-name-en">{t('admin.name')} (EN)*</Label>
                <Input id="tm-name-en" value={form.nameEn} onChange={(e)=> setForm(f=>({...f,nameEn:e.target.value}))} className="mt-2 rounded-xl" placeholder="Dr. Jane Smith" />
              </div>
              <div>
                <Label htmlFor="tm-name-fa">{t('admin.name')} (FA)*</Label>
                <Input id="tm-name-fa" dir="rtl" value={form.nameFa} onChange={(e)=> setForm(f=>({...f,nameFa:e.target.value}))} className="mt-2 rounded-xl text-right" placeholder="دکتر جین اسمیت" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tm-role-en">{t('admin.role')} (EN)*</Label>
                <Input id="tm-role-en" value={form.roleEn} onChange={(e)=> setForm(f=>({...f,roleEn:e.target.value}))} className="mt-2 rounded-xl" placeholder="Senior Specialist" />
              </div>
              <div>
                <Label htmlFor="tm-role-fa">{t('admin.role')} (FA)*</Label>
                <Input id="tm-role-fa" dir="rtl" value={form.roleFa} onChange={(e)=> setForm(f=>({...f,roleFa:e.target.value}))} className="mt-2 rounded-xl text-right" placeholder="متخصص ارشد" />
              </div>
            </div>
            
            <div>
              <Label>{t('admin.imageUrl')}</Label>
              <div className="mt-2 space-y-3">
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  {form.image ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-inner">
                        <img src={imagePreviewUrl || form.image || undefined} alt="Team member" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 w-full">
                        <p className="text-sm text-gray-900 truncate" title={form.image || undefined}>{form.image}</p>
                        {imagePreviewUrl && (
                          <p className="text-xs text-gray-500 break-all mt-1">{imagePreviewUrl}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={removeImage} disabled={imageProcessing}>
                        {t('admin.remove')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">{t('admin.homeContent.heroImageEmpty')}</p>
                    </div>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleImageChange} disabled={imageProcessing} className="rounded-xl" />
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <UploadCloud className={`w-4 h-4 ${imageProcessing ? 'animate-spin' : ''}`} />
                  {imageProcessing ? t('admin.media.uploading') : t('admin.homeContent.heroImageUploadHint')}
                </div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tm-bio-en">{t('admin.bio')} (EN)</Label>
                <Textarea id="tm-bio-en" value={form.bioEn} onChange={(e)=> setForm(f=>({...f,bioEn:e.target.value}))} className="mt-2 rounded-xl" rows={4} placeholder="Short bio / expertise" />
              </div>
              <div>
                <Label htmlFor="tm-bio-fa">{t('admin.bio')} (FA)</Label>
                <Textarea id="tm-bio-fa" dir="rtl" value={form.bioFa} onChange={(e)=> setForm(f=>({...f,bioFa:e.target.value}))} className="mt-2 rounded-xl text-right" rows={4} placeholder="بیوگرافی کوتاه / تخصص" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input id="tm-active" type="checkbox" checked={form.active} onChange={(e)=> setForm(f=>({...f,active:e.target.checked}))} className="rounded border-gray-300" />
              <Label htmlFor="tm-active">{t('admin.activeVisible')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setIsDialogOpen(false); setEditing(null); }}>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={save}>{editing ? t('admin.update') : t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
