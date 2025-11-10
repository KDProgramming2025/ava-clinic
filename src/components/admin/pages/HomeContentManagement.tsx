import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Edit, Plus, Trash2, Save, RefreshCcw, LayoutGrid, Activity, Sparkles } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface HomeHero { title?: string|null; subtitle?: string|null; description?: string|null; ctaPrimaryLabel?: string|null; ctaSecondaryLabel?: string|null; }
interface HomeStat { id: string; label: string; value: number; icon?: string|null; }
interface HomeFeature { id: string; title: string; description?: string|null; icon?: string|null; }
interface HomeCTA { heading?: string|null; subheading?: string|null; buttonLabel?: string|null; }
interface HomeData { hero?: HomeHero|null; stats: HomeStat[]; features: HomeFeature[]; cta?: HomeCTA|null; }

export function HomeContentManagement() {
  const [data, setData] = useState<HomeData>({ hero: null, stats: [], features: [], cta: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // Local editable copies
  const [hero, setHero] = useState<HomeHero>({ title: '', subtitle: '', description: '', ctaPrimaryLabel: '', ctaSecondaryLabel: '' });
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [cta, setCta] = useState<HomeCTA>({ heading: '', subheading: '', buttonLabel: '' });

  const [statDialogOpen, setStatDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<HomeStat|null>(null);
  const [editingFeature, setEditingFeature] = useState<HomeFeature|null>(null);
  const [statForm, setStatForm] = useState<{ label: string; value: string; icon: string }>({ label: '', value: '', icon: '' });
  const [featureForm, setFeatureForm] = useState<{ title: string; description: string; icon: string }>({ title: '', description: '', icon: '' });

  const fetchHome = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<HomeData>('/home');
      setData(res);
      setHero({
        title: res.hero?.title || '',
        subtitle: res.hero?.subtitle || '',
        description: res.hero?.description || '',
        ctaPrimaryLabel: res.hero?.ctaPrimaryLabel || '',
        ctaSecondaryLabel: res.hero?.ctaSecondaryLabel || '',
      });
      setStats(res.stats || []);
      setFeatures(res.features || []);
      setCta({
        heading: res.cta?.heading || '',
        subheading: res.cta?.subheading || '',
        buttonLabel: res.cta?.buttonLabel || '',
      });
      setDirty(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to load home content');
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchHome(); }, []);

  const openNewStat = () => { setEditingStat(null); setStatForm({ label: '', value: '', icon: '' }); setStatDialogOpen(true); };
  const openEditStat = (s: HomeStat) => { setEditingStat(s); setStatForm({ label: s.label, value: String(s.value), icon: s.icon || '' }); setStatDialogOpen(true); };
  const saveStat = () => {
    if (!statForm.label.trim() || !statForm.value.trim()) { toast.error('Stat label & value required'); return; }
    const valueNum = parseInt(statForm.value, 10); if (isNaN(valueNum)) { toast.error('Value must be number'); return; }
    if (editingStat) {
      setStats(prev => prev.map(x => x.id === editingStat.id ? { ...editingStat, label: statForm.label.trim(), value: valueNum, icon: statForm.icon.trim() || undefined } : x));
    } else {
      setStats(prev => [...prev, { id: crypto.randomUUID(), label: statForm.label.trim(), value: valueNum, icon: statForm.icon.trim() || undefined }]);
    }
    setStatDialogOpen(false); setEditingStat(null); setDirty(true);
  };
  const deleteStat = (s: HomeStat) => { if (!confirm('Delete stat?')) return; setStats(prev => prev.filter(x => x.id !== s.id)); setDirty(true); };

  const openNewFeature = () => { setEditingFeature(null); setFeatureForm({ title: '', description: '', icon: '' }); setFeatureDialogOpen(true); };
  const openEditFeature = (f: HomeFeature) => { setEditingFeature(f); setFeatureForm({ title: f.title, description: f.description || '', icon: f.icon || '' }); setFeatureDialogOpen(true); };
  const saveFeature = () => {
    if (!featureForm.title.trim()) { toast.error('Feature title required'); return; }
    if (editingFeature) {
      setFeatures(prev => prev.map(x => x.id === editingFeature.id ? { ...editingFeature, title: featureForm.title.trim(), description: featureForm.description.trim() || undefined, icon: featureForm.icon.trim() || undefined } : x));
    } else {
      setFeatures(prev => [...prev, { id: crypto.randomUUID(), title: featureForm.title.trim(), description: featureForm.description.trim() || undefined, icon: featureForm.icon.trim() || undefined }]);
    }
    setFeatureDialogOpen(false); setEditingFeature(null); setDirty(true);
  };
  const deleteFeature = (f: HomeFeature) => { if (!confirm('Delete feature?')) return; setFeatures(prev => prev.filter(x => x.id !== f.id)); setDirty(true); };

  const saveAll = async () => {
    try {
      const payload = {
        hero: {
          title: hero.title?.trim() || null,
          subtitle: hero.subtitle?.trim() || null,
          description: hero.description?.trim() || null,
          ctaPrimaryLabel: hero.ctaPrimaryLabel?.trim() || null,
          ctaSecondaryLabel: hero.ctaSecondaryLabel?.trim() || null,
        },
        stats: stats.map(s => ({ label: s.label, value: s.value, icon: s.icon || null })),
        features: features.map(f => ({ title: f.title, description: f.description || null, icon: f.icon || null })),
        cta: {
          heading: cta.heading?.trim() || null,
          subheading: cta.subheading?.trim() || null,
          buttonLabel: cta.buttonLabel?.trim() || null,
        }
      };
      await apiFetch('/home', { method: 'PUT', body: payload });
      toast.success('Home content saved');
      setDirty(false);
      await fetchHome();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
  };

  const resetChanges = () => {
    setHero({
      title: data.hero?.title || '',
      subtitle: data.hero?.subtitle || '',
      description: data.hero?.description || '',
      ctaPrimaryLabel: data.hero?.ctaPrimaryLabel || '',
      ctaSecondaryLabel: data.hero?.ctaSecondaryLabel || '',
    });
    setStats(data.stats || []);
    setFeatures(data.features || []);
    setCta({ heading: data.cta?.heading || '', subheading: data.cta?.subheading || '', buttonLabel: data.cta?.buttonLabel || '' });
    setDirty(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Home Content Management</h1>
          <p className="text-gray-600">Edit hero, stats, features and CTA section</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={resetChanges} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />Reset</Button>
          <Button onClick={saveAll} disabled={!dirty} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
        </div>
      </div>

      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          {/* Hero Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" />Hero</h2></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={hero.title || ''} onChange={(e)=> { setHero(h=>({...h,title:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={hero.subtitle || ''} onChange={(e)=> { setHero(h=>({...h,subtitle:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={hero.description || ''} onChange={(e)=> { setHero(h=>({...h,description:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" rows={3} />
              </div>
              <div>
                <Label>Primary CTA Label</Label>
                <Input value={hero.ctaPrimaryLabel || ''} onChange={(e)=> { setHero(h=>({...h,ctaPrimaryLabel:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label>Secondary CTA Label</Label>
                <Input value={hero.ctaSecondaryLabel || ''} onChange={(e)=> { setHero(h=>({...h,ctaSecondaryLabel:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" />Stats</h2>
              <Button size="sm" onClick={openNewStat} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Stat</Button>
            </div>
            {stats.length === 0 && <p className="text-gray-500">No stats defined.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map(s => (
                <Card key={s.id} className="p-4 shadow-sm border border-gray-100 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{s.label}</span>
                    <Badge className="bg-pink-100 text-pink-700">{s.value}</Badge>
                  </div>
                  {s.icon && <p className="text-xs text-gray-500">Icon: {s.icon}</p>}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditStat(s)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteStat(s)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Features Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-500" />Features</h2>
              <Button size="sm" onClick={openNewFeature} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Feature</Button>
            </div>
            {features.length === 0 && <p className="text-gray-500">No features defined.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => (
                <Card key={f.id} className="p-4 shadow-sm border border-gray-100 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 line-clamp-1" title={f.title}>{f.title}</span>
                    <Badge className="bg-purple-100 text-purple-700">{f.icon || '—'}</Badge>
                  </div>
                  {f.description && <p className="text-sm text-gray-600 line-clamp-3">{f.description}</p>}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditFeature(f)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteFeature(f)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <h2 className="text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" />Call To Action Block</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Heading</Label>
                <Input value={cta.heading || ''} onChange={(e)=> { setCta(c=>({...c,heading:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label>Subheading</Label>
                <Input value={cta.subheading || ''} onChange={(e)=> { setCta(c=>({...c,subheading:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label>Button Label</Label>
                <Input value={cta.buttonLabel || ''} onChange={(e)=> { setCta(c=>({...c,buttonLabel:e.target.value})); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Stat Dialog */}
  <Dialog open={statDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setStatDialogOpen(false); setEditingStat(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingStat? 'Edit Stat':'Add Stat'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stat-label">Label*</Label>
              <Input id="stat-label" value={statForm.label} onChange={(e)=> setStatForm(f=>({...f,label:e.target.value}))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="stat-value">Value*</Label>
              <Input id="stat-value" value={statForm.value} onChange={(e)=> setStatForm(f=>({...f,value:e.target.value.replace(/[^0-9]/g,'')}))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="stat-icon">Icon</Label>
              <Input id="stat-icon" value={statForm.icon} onChange={(e)=> setStatForm(f=>({...f,icon:e.target.value}))} className="mt-2 rounded-xl" placeholder="lucide icon name (optional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setStatDialogOpen(false); setEditingStat(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveStat}>{editingStat? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
  <Dialog open={featureDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setFeatureDialogOpen(false); setEditingFeature(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingFeature? 'Edit Feature':'Add Feature'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feat-title">Title*</Label>
              <Input id="feat-title" value={featureForm.title} onChange={(e)=> setFeatureForm(f=>({...f,title:e.target.value}))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="feat-desc">Description</Label>
              <Textarea id="feat-desc" value={featureForm.description} onChange={(e)=> setFeatureForm(f=>({...f,description:e.target.value}))} className="mt-2 rounded-xl" rows={3} />
            </div>
            <div>
              <Label htmlFor="feat-icon">Icon</Label>
              <Input id="feat-icon" value={featureForm.icon} onChange={(e)=> setFeatureForm(f=>({...f,icon:e.target.value}))} className="mt-2 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setFeatureDialogOpen(false); setEditingFeature(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveFeature}>{editingFeature? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
