import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Target, ListChecks, Quote, Plus, Edit, Trash2, Save, RefreshCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface AboutTimeline { id?: string; year: number; title: string; description?: string|null }
interface AboutValue { id?: string; title: string; description?: string|null; icon?: string|null }
interface AboutSkill { id?: string; name: string; level: number }
interface AboutMission { heading?: string|null; paragraph?: string|null }
interface AboutBullet { id?: string; text: string }
interface AboutData { timeline: AboutTimeline[]; values: AboutValue[]; skills: AboutSkill[]; mission?: AboutMission|null; missionBullets: AboutBullet[] }

export function AboutContentManagement() {
  const [data, setData] = useState<AboutData>({ timeline: [], values: [], skills: [], mission: { heading: '', paragraph: '' }, missionBullets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // locals
  const [timeline, setTimeline] = useState<AboutTimeline[]>([]);
  const [values, setValues] = useState<AboutValue[]>([]);
  const [skills, setSkills] = useState<AboutSkill[]>([]);
  const [mission, setMission] = useState<AboutMission>({ heading: '', paragraph: '' });
  const [bullets, setBullets] = useState<AboutBullet[]>([]);

  // dialogs state
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [valueDialogOpen, setValueDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [bulletDialogOpen, setBulletDialogOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<AboutTimeline|null>(null);
  const [editingValue, setEditingValue] = useState<AboutValue|null>(null);
  const [editingSkill, setEditingSkill] = useState<AboutSkill|null>(null);
  const [editingBullet, setEditingBullet] = useState<AboutBullet|null>(null);

  const [timelineForm, setTimelineForm] = useState<{ year: string; title: string; description: string }>({ year: '', title: '', description: '' });
  const [valueForm, setValueForm] = useState<{ title: string; description: string; icon: string }>({ title: '', description: '', icon: '' });
  const [skillForm, setSkillForm] = useState<{ name: string; level: string }>({ name: '', level: '' });
  const [bulletForm, setBulletForm] = useState<{ text: string }>({ text: '' });

  const fetchAbout = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<AboutData>('/about');
      setData(res);
      setTimeline((res.timeline || []).sort((a,b)=>a.year-b.year));
      setValues(res.values || []);
      setSkills(res.skills || []);
      setMission({ heading: res.mission?.heading || '', paragraph: res.mission?.paragraph || '' });
      setBullets(res.missionBullets || []);
      setDirty(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to load About content');
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchAbout(); }, []);

  // Timeline handlers
  const openNewTimeline = () => { setEditingTimeline(null); setTimelineForm({ year: '', title: '', description: '' }); setTimelineDialogOpen(true); };
  const openEditTimeline = (t: AboutTimeline) => { setEditingTimeline(t); setTimelineForm({ year: String(t.year), title: t.title, description: t.description || '' }); setTimelineDialogOpen(true); };
  const saveTimeline = () => {
    if (!timelineForm.year.trim() || !timelineForm.title.trim()) { toast.error('Year & Title required'); return; }
    const year = parseInt(timelineForm.year,10);
    if (isNaN(year)) { toast.error('Year must be a number'); return; }
    if (editingTimeline) {
      setTimeline(prev => prev.map(x => x === editingTimeline ? { ...editingTimeline, year, title: timelineForm.title.trim(), description: timelineForm.description.trim() || undefined } : x));
    } else {
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), year, title: timelineForm.title.trim(), description: timelineForm.description.trim() || undefined }]);
    }
    setTimelineDialogOpen(false); setEditingTimeline(null); setDirty(true);
  };
  const deleteTimeline = (t: AboutTimeline) => { if (!confirm('Delete timeline item?')) return; setTimeline(prev => prev.filter(x => x !== t)); setDirty(true); };

  // Values handlers
  const openNewValue = () => { setEditingValue(null); setValueForm({ title: '', description: '', icon: '' }); setValueDialogOpen(true); };
  const openEditValue = (v: AboutValue) => { setEditingValue(v); setValueForm({ title: v.title, description: v.description || '', icon: v.icon || '' }); setValueDialogOpen(true); };
  const saveValue = () => {
    if (!valueForm.title.trim()) { toast.error('Value title required'); return; }
    if (editingValue) setValues(prev => prev.map(x => x === editingValue ? { ...editingValue, title: valueForm.title.trim(), description: valueForm.description.trim() || undefined, icon: valueForm.icon.trim() || undefined } : x));
    else setValues(prev => [...prev, { id: crypto.randomUUID(), title: valueForm.title.trim(), description: valueForm.description.trim() || undefined, icon: valueForm.icon.trim() || undefined }]);
    setValueDialogOpen(false); setEditingValue(null); setDirty(true);
  };
  const deleteValue = (v: AboutValue) => { if (!confirm('Delete value?')) return; setValues(prev => prev.filter(x => x !== v)); setDirty(true); };

  // Skills handlers
  const openNewSkill = () => { setEditingSkill(null); setSkillForm({ name: '', level: '' }); setSkillDialogOpen(true); };
  const openEditSkill = (s: AboutSkill) => { setEditingSkill(s); setSkillForm({ name: s.name, level: String(s.level) }); setSkillDialogOpen(true); };
  const saveSkill = () => {
    if (!skillForm.name.trim() || !skillForm.level.trim()) { toast.error('Skill name & level required'); return; }
    const level = parseInt(skillForm.level, 10);
    if (isNaN(level) || level < 0 || level > 100) { toast.error('Level must be 0-100'); return; }
    if (editingSkill) setSkills(prev => prev.map(x => x === editingSkill ? { ...editingSkill, name: skillForm.name.trim(), level } : x));
    else setSkills(prev => [...prev, { id: crypto.randomUUID(), name: skillForm.name.trim(), level }]);
    setSkillDialogOpen(false); setEditingSkill(null); setDirty(true);
  };
  const deleteSkill = (s: AboutSkill) => { if (!confirm('Delete skill?')) return; setSkills(prev => prev.filter(x => x !== s)); setDirty(true); };

  // Bullets handlers
  const openNewBullet = () => { setEditingBullet(null); setBulletForm({ text: '' }); setBulletDialogOpen(true); };
  const openEditBullet = (b: AboutBullet) => { setEditingBullet(b); setBulletForm({ text: b.text }); setBulletDialogOpen(true); };
  const saveBullet = () => {
    if (!bulletForm.text.trim()) { toast.error('Bullet text required'); return; }
    if (editingBullet) setBullets(prev => prev.map(x => x === editingBullet ? { ...editingBullet, text: bulletForm.text.trim() } : x));
    else setBullets(prev => [...prev, { id: crypto.randomUUID(), text: bulletForm.text.trim() }]);
    setBulletDialogOpen(false); setEditingBullet(null); setDirty(true);
  };
  const deleteBullet = (b: AboutBullet) => { if (!confirm('Delete bullet?')) return; setBullets(prev => prev.filter(x => x !== b)); setDirty(true); };

  const saveAll = async () => {
    try {
      const payload = {
        timeline: timeline.sort((a,b)=>a.year-b.year).map(t => ({ year: t.year, title: t.title, description: t.description || null })),
        values: values.map(v => ({ title: v.title, description: v.description || null, icon: v.icon || null })),
        skills: skills.map(s => ({ name: s.name, level: s.level })),
        mission: { heading: mission.heading?.trim() || null, paragraph: mission.paragraph?.trim() || null },
        missionBullets: bullets.map(b => ({ text: b.text })),
      };
      await apiFetch('/about', { method: 'PUT', body: payload });
      toast.success('About content saved');
      setDirty(false);
      await fetchAbout();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
  };

  const resetChanges = () => {
    setTimeline((data.timeline || []).sort((a,b)=>a.year-b.year));
    setValues(data.values || []);
    setSkills(data.skills || []);
    setMission({ heading: data.mission?.heading || '', paragraph: data.mission?.paragraph || '' });
    setBullets(data.missionBullets || []);
    setDirty(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">About Content Management</h1>
          <p className="text-gray-600">Edit timeline, values, skills, and mission</p>
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
          {/* Timeline */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-pink-500" />Timeline</h2>
              <Button size="sm" onClick={openNewTimeline} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Timeline Item</Button>
            </div>
            {timeline.length === 0 && <p className="text-gray-500">No timeline items.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeline.map((t, idx) => (
                <Card key={(t.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-purple-100 text-purple-700">{t.year}</Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={()=> openEditTimeline(t)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={()=> deleteTimeline(t)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 mb-1 line-clamp-1" title={t.title}>{t.title}</div>
                  {t.description && <p className="text-sm text-gray-600 line-clamp-3">{t.description}</p>}
                </Card>
              ))}
            </div>
          </Card>

          {/* Values */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" />Values</h2>
              <Button size="sm" onClick={openNewValue} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Value</Button>
            </div>
            {values.length === 0 && <p className="text-gray-500">No values defined.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map((v, idx) => (
                <Card key={(v.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900 line-clamp-1" title={v.title}>{v.title}</div>
                    <Badge className="bg-pink-100 text-pink-700">{v.icon || '—'}</Badge>
                  </div>
                  {v.description && <p className="text-sm text-gray-600 line-clamp-3">{v.description}</p>}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditValue(v)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteValue(v)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-green-600" />Skills</h2>
              <Button size="sm" onClick={openNewSkill} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
            </div>
            {skills.length === 0 && <p className="text-gray-500">No skills added.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((s, idx) => (
                <Card key={(s.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900 line-clamp-1" title={s.name}>{s.name}</div>
                    <Badge className="bg-blue-100 text-blue-700">{s.level}%</Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditSkill(s)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteSkill(s)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Mission */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Quote className="w-5 h-5 text-purple-600" />Mission</h2>
              <div className="hidden md:block text-gray-500 text-sm">Short statement and supporting bullet points</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Heading</Label>
                <Input value={mission.heading || ''} onChange={(e)=> { setMission(m=>({ ...m, heading: e.target.value })); setDirty(true);} } className="mt-2 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label>Paragraph</Label>
                <Textarea value={mission.paragraph || ''} onChange={(e)=> { setMission(m=>({ ...m, paragraph: e.target.value })); setDirty(true);} } className="mt-2 rounded-xl" rows={3} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">Mission Bullet Points</h3>
              <Button size="sm" onClick={openNewBullet} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Bullet</Button>
            </div>
            {bullets.length === 0 && <p className="text-gray-500">No bullet points yet.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bullets.map((b, idx) => (
                <Card key={(b.id||'')+idx} className="p-4 relative group">
                  <p className="text-gray-700">{b.text}</p>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditBullet(b)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteBullet(b)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Timeline Dialog */}
  <Dialog open={timelineDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setTimelineDialogOpen(false); setEditingTimeline(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingTimeline? 'Edit Timeline':'Add Timeline'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tl-year">Year*</Label>
              <Input id="tl-year" value={timelineForm.year} onChange={(e)=> setTimelineForm(f=>({ ...f, year: e.target.value.replace(/[^0-9]/g,'').slice(0,4) }))} className="mt-2 rounded-xl" placeholder="2020" />
            </div>
            <div>
              <Label htmlFor="tl-title">Title*</Label>
              <Input id="tl-title" value={timelineForm.title} onChange={(e)=> setTimelineForm(f=>({ ...f, title: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="tl-desc">Description</Label>
              <Textarea id="tl-desc" value={timelineForm.description} onChange={(e)=> setTimelineForm(f=>({ ...f, description: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setTimelineDialogOpen(false); setEditingTimeline(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveTimeline}>{editingTimeline? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Value Dialog */}
  <Dialog open={valueDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setValueDialogOpen(false); setEditingValue(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingValue? 'Edit Value':'Add Value'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="val-title">Title*</Label>
              <Input id="val-title" value={valueForm.title} onChange={(e)=> setValueForm(f=>({ ...f, title: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="val-desc">Description</Label>
              <Textarea id="val-desc" value={valueForm.description} onChange={(e)=> setValueForm(f=>({ ...f, description: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
            </div>
            <div>
              <Label htmlFor="val-icon">Icon</Label>
              <Input id="val-icon" value={valueForm.icon} onChange={(e)=> setValueForm(f=>({ ...f, icon: e.target.value }))} className="mt-2 rounded-xl" placeholder="lucide icon name (optional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setValueDialogOpen(false); setEditingValue(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveValue}>{editingValue? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
  <Dialog open={skillDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setSkillDialogOpen(false); setEditingSkill(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingSkill? 'Edit Skill':'Add Skill'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sk-name">Name*</Label>
              <Input id="sk-name" value={skillForm.name} onChange={(e)=> setSkillForm(f=>({ ...f, name: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="sk-level">Level (0-100)*</Label>
              <Input id="sk-level" value={skillForm.level} onChange={(e)=> setSkillForm(f=>({ ...f, level: e.target.value.replace(/[^0-9]/g,'').slice(0,3) }))} className="mt-2 rounded-xl" placeholder="85" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setSkillDialogOpen(false); setEditingSkill(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveSkill}>{editingSkill? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bullet Dialog */}
  <Dialog open={bulletDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setBulletDialogOpen(false); setEditingBullet(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingBullet? 'Edit Bullet':'Add Bullet'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bl-text">Text*</Label>
              <Textarea id="bl-text" value={bulletForm.text} onChange={(e)=> setBulletForm(f=>({ ...f, text: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setBulletDialogOpen(false); setEditingBullet(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveBullet}>{editingBullet? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
