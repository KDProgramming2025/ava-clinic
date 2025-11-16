import { useEffect, useState } from 'react';
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
import { useLanguage } from '../../LanguageContext';

interface AboutTimeline {
  id?: string;
  year: number;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
}
interface AboutValue {
  id?: string;
  title: string;
  titleEn?: string | null;
  titleFa?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
  icon?: string | null;
}
interface AboutSkill {
  id?: string;
  name: string;
  nameEn?: string | null;
  nameFa?: string | null;
  level: number;
}
interface AboutMission {
  heading?: string | null;
  headingEn?: string | null;
  headingFa?: string | null;
  paragraph?: string | null;
  paragraphEn?: string | null;
  paragraphFa?: string | null;
  imageHeroUrl?: string | null;
  imageSecondaryUrl?: string | null;
}
interface AboutBullet {
  id?: string;
  text: string;
  textEn?: string | null;
  textFa?: string | null;
}
interface AboutData {
  timeline: AboutTimeline[];
  values: AboutValue[];
  skills: AboutSkill[];
  mission?: AboutMission | null;
  missionBullets: AboutBullet[];
}

export function AboutContentManagement() {
  const { t } = useLanguage();
  const [data, setData] = useState<AboutData>({ timeline: [], values: [], skills: [], mission: { heading: '', paragraph: '' }, missionBullets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // locals
  const [timeline, setTimeline] = useState<AboutTimeline[]>([]);
  const [values, setValues] = useState<AboutValue[]>([]);
  const [skills, setSkills] = useState<AboutSkill[]>([]);
  const [mission, setMission] = useState<AboutMission>({ heading: '', headingEn: '', headingFa: '', paragraph: '', paragraphEn: '', paragraphFa: '', imageHeroUrl: '', imageSecondaryUrl: '' });
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

  const [timelineForm, setTimelineForm] = useState<{ year: string; titleEn: string; titleFa: string; descriptionEn: string; descriptionFa: string }>({ year: '', titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '' });
  const [valueForm, setValueForm] = useState<{ titleEn: string; titleFa: string; descriptionEn: string; descriptionFa: string; icon: string }>({ titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '', icon: '' });
  const [skillForm, setSkillForm] = useState<{ nameEn: string; nameFa: string; level: string }>({ nameEn: '', nameFa: '', level: '' });
  const [bulletForm, setBulletForm] = useState<{ textEn: string; textFa: string }>({ textEn: '', textFa: '' });

  const pickInput = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) return trimmed;
      }
    }
    return '';
  };
  const trimOrNull = (value?: string | null) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };
  const canonicalFrom = (fa?: string | null, en?: string | null, fallback?: string | null) => trimOrNull(fa) || trimOrNull(en) || trimOrNull(fallback);
  const hydrateTimeline = (items?: AboutTimeline[] | null): AboutTimeline[] =>
    (items || []).map((item) => ({
      ...item,
      title: pickInput(item.title, item.titleFa, item.titleEn),
      titleEn: pickInput(item.titleEn, item.title),
      titleFa: pickInput(item.titleFa, item.title),
      description: pickInput(item.description, item.descriptionFa, item.descriptionEn),
      descriptionEn: pickInput(item.descriptionEn, item.description),
      descriptionFa: pickInput(item.descriptionFa, item.description),
    }));
  const hydrateValues = (items?: AboutValue[] | null): AboutValue[] =>
    (items || []).map((item) => ({
      ...item,
      title: pickInput(item.title, item.titleFa, item.titleEn),
      titleEn: pickInput(item.titleEn, item.title),
      titleFa: pickInput(item.titleFa, item.title),
      description: pickInput(item.description, item.descriptionFa, item.descriptionEn),
      descriptionEn: pickInput(item.descriptionEn, item.description),
      descriptionFa: pickInput(item.descriptionFa, item.description),
      icon: pickInput(item.icon) || null,
    }));
  const hydrateSkills = (items?: AboutSkill[] | null): AboutSkill[] =>
    (items || []).map((item) => ({
      ...item,
      name: pickInput(item.name, item.nameFa, item.nameEn),
      nameEn: pickInput(item.nameEn, item.name),
      nameFa: pickInput(item.nameFa, item.name),
      level: Number.isFinite(Number(item.level)) ? Number(item.level) : 0,
    }));
  const hydrateMission = (source?: AboutMission | null): AboutMission => ({
    heading: pickInput(source?.heading, source?.headingFa, source?.headingEn),
    headingEn: pickInput(source?.headingEn, source?.heading),
    headingFa: pickInput(source?.headingFa, source?.heading),
    paragraph: pickInput(source?.paragraph, source?.paragraphFa, source?.paragraphEn),
    paragraphEn: pickInput(source?.paragraphEn, source?.paragraph),
    paragraphFa: pickInput(source?.paragraphFa, source?.paragraph),
    imageHeroUrl: pickInput(source?.imageHeroUrl),
    imageSecondaryUrl: pickInput(source?.imageSecondaryUrl),
  });
  const hydrateBullets = (items?: AboutBullet[] | null): AboutBullet[] =>
    (items || []).map((item) => ({
      ...item,
      text: pickInput(item.text, item.textFa, item.textEn),
      textEn: pickInput(item.textEn, item.text),
      textFa: pickInput(item.textFa, item.text),
    }));

  const fetchAbout = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<AboutData>('/about');
        setData(res);
        setTimeline(hydrateTimeline(res.timeline).sort((a, b) => a.year - b.year));
        setValues(hydrateValues(res.values));
        setSkills(hydrateSkills(res.skills));
        setMission(hydrateMission(res.mission));
        setBullets(hydrateBullets(res.missionBullets));
      setDirty(false);
    } catch (e: any) {
      setError(e?.message || t('admin.aboutContent.loadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchAbout(); }, []);

  // Timeline handlers
  const openNewTimeline = () => { setEditingTimeline(null); setTimelineForm({ year: '', titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '' }); setTimelineDialogOpen(true); };
  const openEditTimeline = (t: AboutTimeline) => {
    setEditingTimeline(t);
    setTimelineForm({
      year: String(t.year),
      titleEn: t.titleEn || t.title || '',
      titleFa: t.titleFa || t.title || '',
      descriptionEn: t.descriptionEn || t.description || '',
      descriptionFa: t.descriptionFa || t.description || '',
    });
    setTimelineDialogOpen(true);
  };
  const saveTimeline = () => {
    if (!timelineForm.year.trim() || (!timelineForm.titleEn.trim() && !timelineForm.titleFa.trim())) { toast.error(t('admin.aboutContent.timelineRequired')); return; }
    const year = parseInt(timelineForm.year,10);
    if (isNaN(year)) { toast.error(t('admin.aboutContent.timelineYearNumber')); return; }
    const canonicalTitle = timelineForm.titleFa.trim() || timelineForm.titleEn.trim();
    const canonicalDescription = timelineForm.descriptionFa.trim() || timelineForm.descriptionEn.trim();
    const next = {
      year,
      title: canonicalTitle || 'Timeline',
      titleEn: timelineForm.titleEn.trim() || null,
      titleFa: timelineForm.titleFa.trim() || null,
      description: canonicalDescription || null,
      descriptionEn: timelineForm.descriptionEn.trim() || null,
      descriptionFa: timelineForm.descriptionFa.trim() || null,
    };
    if (editingTimeline) {
      setTimeline(prev => prev.map(x => x === editingTimeline ? { ...editingTimeline, ...next } : x));
    } else {
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), ...next }]);
    }
    setTimelineDialogOpen(false); setEditingTimeline(null); setDirty(true);
  };
  const deleteTimeline = (t: AboutTimeline) => { if (!confirm(t('admin.aboutContent.deleteTimelineConfirm'))) return; setTimeline(prev => prev.filter(x => x !== t)); setDirty(true); };

  // Values handlers
  const openNewValue = () => { setEditingValue(null); setValueForm({ titleEn: '', titleFa: '', descriptionEn: '', descriptionFa: '', icon: '' }); setValueDialogOpen(true); };
  const openEditValue = (v: AboutValue) => {
    setEditingValue(v);
    setValueForm({
      titleEn: v.titleEn || v.title || '',
      titleFa: v.titleFa || v.title || '',
      descriptionEn: v.descriptionEn || v.description || '',
      descriptionFa: v.descriptionFa || v.description || '',
      icon: v.icon || '',
    });
    setValueDialogOpen(true);
  };
  const saveValue = () => {
    if (!valueForm.titleEn.trim() && !valueForm.titleFa.trim()) { toast.error(t('admin.aboutContent.valueTitleRequired')); return; }
    const canonicalTitle = valueForm.titleFa.trim() || valueForm.titleEn.trim();
    const canonicalDescription = valueForm.descriptionFa.trim() || valueForm.descriptionEn.trim();
    const next = {
      title: canonicalTitle || 'Value',
      titleEn: valueForm.titleEn.trim() || null,
      titleFa: valueForm.titleFa.trim() || null,
      description: canonicalDescription || null,
      descriptionEn: valueForm.descriptionEn.trim() || null,
      descriptionFa: valueForm.descriptionFa.trim() || null,
      icon: valueForm.icon.trim() || null,
    };
    if (editingValue) setValues(prev => prev.map(x => x === editingValue ? { ...editingValue, ...next } : x));
    else setValues(prev => [...prev, { id: crypto.randomUUID(), ...next }]);
    setValueDialogOpen(false); setEditingValue(null); setDirty(true);
  };
  const deleteValue = (v: AboutValue) => { if (!confirm(t('admin.aboutContent.deleteValueConfirm'))) return; setValues(prev => prev.filter(x => x !== v)); setDirty(true); };

  // Skills handlers
  const openNewSkill = () => { setEditingSkill(null); setSkillForm({ nameEn: '', nameFa: '', level: '' }); setSkillDialogOpen(true); };
  const openEditSkill = (s: AboutSkill) => {
    setEditingSkill(s);
    setSkillForm({
      nameEn: s.nameEn || s.name || '',
      nameFa: s.nameFa || s.name || '',
      level: String(s.level ?? ''),
    });
    setSkillDialogOpen(true);
  };
  const saveSkill = () => {
    if ((!skillForm.nameEn.trim() && !skillForm.nameFa.trim()) || !skillForm.level.trim()) { toast.error(t('admin.aboutContent.skillRequired')); return; }
    const level = parseInt(skillForm.level, 10);
    if (isNaN(level) || level < 0 || level > 100) { toast.error(t('admin.aboutContent.skillLevelRange')); return; }
    const canonicalName = skillForm.nameFa.trim() || skillForm.nameEn.trim();
    const next = {
      name: canonicalName || 'Skill',
      nameEn: skillForm.nameEn.trim() || null,
      nameFa: skillForm.nameFa.trim() || null,
      level,
    };
    if (editingSkill) setSkills(prev => prev.map(x => x === editingSkill ? { ...editingSkill, ...next } : x));
    else setSkills(prev => [...prev, { id: crypto.randomUUID(), ...next }]);
    setSkillDialogOpen(false); setEditingSkill(null); setDirty(true);
  };
  const deleteSkill = (s: AboutSkill) => { if (!confirm(t('admin.aboutContent.deleteSkillConfirm'))) return; setSkills(prev => prev.filter(x => x !== s)); setDirty(true); };

  // Bullets handlers
  const openNewBullet = () => { setEditingBullet(null); setBulletForm({ textEn: '', textFa: '' }); setBulletDialogOpen(true); };
  const openEditBullet = (b: AboutBullet) => {
    setEditingBullet(b);
    setBulletForm({ textEn: b.textEn || b.text || '', textFa: b.textFa || b.text || '' });
    setBulletDialogOpen(true);
  };
  const saveBullet = () => {
    if (!bulletForm.textEn.trim() && !bulletForm.textFa.trim()) { toast.error(t('admin.aboutContent.bulletTextRequired')); return; }
    const canonicalText = bulletForm.textFa.trim() || bulletForm.textEn.trim();
    const next = {
      text: canonicalText || 'Bullet',
      textEn: bulletForm.textEn.trim() || null,
      textFa: bulletForm.textFa.trim() || null,
    };
    if (editingBullet) setBullets(prev => prev.map(x => x === editingBullet ? { ...editingBullet, ...next } : x));
    else setBullets(prev => [...prev, { id: crypto.randomUUID(), ...next }]);
    setBulletDialogOpen(false); setEditingBullet(null); setDirty(true);
  };
  const deleteBullet = (b: AboutBullet) => { if (!confirm(t('admin.aboutContent.deleteBulletConfirm'))) return; setBullets(prev => prev.filter(x => x !== b)); setDirty(true); };

  const saveAll = async () => {
    try {
      const payload = {
        timeline: [...timeline].sort((a,b)=>a.year-b.year).map(t => ({
          id: t.id,
          year: t.year,
          title: canonicalFrom(t.titleFa, t.titleEn, t.title),
          titleEn: trimOrNull(t.titleEn),
          titleFa: trimOrNull(t.titleFa),
          description: canonicalFrom(t.descriptionFa, t.descriptionEn, t.description),
          descriptionEn: trimOrNull(t.descriptionEn),
          descriptionFa: trimOrNull(t.descriptionFa),
        })),
        values: values.map(v => ({
          id: v.id,
          title: canonicalFrom(v.titleFa, v.titleEn, v.title),
          titleEn: trimOrNull(v.titleEn),
          titleFa: trimOrNull(v.titleFa),
          description: canonicalFrom(v.descriptionFa, v.descriptionEn, v.description),
          descriptionEn: trimOrNull(v.descriptionEn),
          descriptionFa: trimOrNull(v.descriptionFa),
          icon: trimOrNull(v.icon),
        })),
        skills: skills.map(s => ({
          id: s.id,
          name: canonicalFrom(s.nameFa, s.nameEn, s.name),
          nameEn: trimOrNull(s.nameEn),
          nameFa: trimOrNull(s.nameFa),
          level: s.level,
        })),
        mission: {
          heading: canonicalFrom(mission.headingFa, mission.headingEn, mission.heading),
          headingEn: trimOrNull(mission.headingEn),
          headingFa: trimOrNull(mission.headingFa),
          paragraph: canonicalFrom(mission.paragraphFa, mission.paragraphEn, mission.paragraph),
          paragraphEn: trimOrNull(mission.paragraphEn),
          paragraphFa: trimOrNull(mission.paragraphFa),
          imageHeroUrl: trimOrNull(mission.imageHeroUrl),
          imageSecondaryUrl: trimOrNull(mission.imageSecondaryUrl),
        },
        missionBullets: bullets.map(b => ({
          id: b.id,
          text: canonicalFrom(b.textFa, b.textEn, b.text),
          textEn: trimOrNull(b.textEn),
          textFa: trimOrNull(b.textFa),
        })),
      };
      await apiFetch('/about', { method: 'PUT', body: payload });
  toast.success(t('admin.aboutContent.saved'));
      setDirty(false);
      await fetchAbout();
  } catch (e: any) { toast.error(e?.message || t('admin.aboutContent.saveFailed')); }
  };

  const resetChanges = () => {
    setTimeline(hydrateTimeline(data.timeline).sort((a,b)=>a.year-b.year));
    setValues(hydrateValues(data.values));
    setSkills(hydrateSkills(data.skills));
    setMission(hydrateMission(data.mission));
    setBullets(hydrateBullets(data.missionBullets));
    setDirty(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.aboutContent.title')}</h1>
          <p className="text-gray-600">{t('admin.aboutContent.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={resetChanges} className="rounded-xl"><RefreshCcw className="w-4 h-4 mr-2" />{t('admin.cancel')}</Button>
          <Button onClick={saveAll} disabled={!dirty} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"><Save className="w-4 h-4 mr-2" />{t('admin.saveChanges')}</Button>
        </div>
      </div>

  {loading && <div className="p-4 text-gray-500">{t('common.loading')}</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          {/* Timeline */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-pink-500" />{t('admin.aboutContent.timelineSection')}</h2>
              <Button size="sm" onClick={openNewTimeline} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.aboutContent.addTimeline')}</Button>
            </div>
            {timeline.length === 0 && <p className="text-gray-500">{t('admin.aboutContent.noTimeline')}</p>}
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
              <h2 className="text-gray-900 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" />{t('admin.aboutContent.valuesSection')}</h2>
              <Button size="sm" onClick={openNewValue} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.aboutContent.addValue')}</Button>
            </div>
            {values.length === 0 && <p className="text-gray-500">{t('admin.aboutContent.noValues')}</p>}
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
              <h2 className="text-gray-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-green-600" />{t('admin.aboutContent.skillsSection')}</h2>
              <Button size="sm" onClick={openNewSkill} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.aboutContent.addSkill')}</Button>
            </div>
            {skills.length === 0 && <p className="text-gray-500">{t('admin.aboutContent.noSkills')}</p>}
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
              <h2 className="text-gray-900 flex items-center gap-2"><Quote className="w-5 h-5 text-purple-600" />{t('admin.aboutContent.missionSection')}</h2>
              <div className="hidden md:block text-gray-500 text-sm">{t('admin.aboutContent.missionHelper')}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.homeContent.ctaHeadingLabel')} (EN)</Label>
                  <Input value={mission.headingEn || ''} onChange={(e)=> { const value = e.target.value; setMission(m=>({ ...m, headingEn: value })); setDirty(true);} } className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.homeContent.ctaHeadingLabel')} (FA)</Label>
                  <Input dir="rtl" value={mission.headingFa || ''} onChange={(e)=> { const value = e.target.value; setMission(m=>({ ...m, headingFa: value })); setDirty(true);} } className="mt-2 rounded-xl text-right" />
                </div>
              </div>
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t('admin.aboutContent.timeline.descriptionLabel')} (EN)</Label>
                  <Textarea value={mission.paragraphEn || ''} onChange={(e)=> { const value = e.target.value; setMission(m=>({ ...m, paragraphEn: value })); setDirty(true);} } className="mt-2 rounded-xl" rows={3} />
                </div>
                <div>
                  <Label>{t('admin.aboutContent.timeline.descriptionLabel')} (FA)</Label>
                  <Textarea dir="rtl" value={mission.paragraphFa || ''} onChange={(e)=> { const value = e.target.value; setMission(m=>({ ...m, paragraphFa: value })); setDirty(true);} } className="mt-2 rounded-xl text-right" rows={3} />
                </div>
              </div>
              <div>
                <Label>{t('admin.homeContent.heroImageLabel')}</Label>
                <Input value={mission.imageHeroUrl || ''} onChange={(e)=> { setMission(m=>({ ...m, imageHeroUrl: e.target.value })); setDirty(true);} } className="mt-2 rounded-xl" placeholder="https://..." />
              </div>
              <div>
                <Label>{t('admin.homeContent.heroImageLabel')}</Label>
                <Input value={mission.imageSecondaryUrl || ''} onChange={(e)=> { setMission(m=>({ ...m, imageSecondaryUrl: e.target.value })); setDirty(true);} } className="mt-2 rounded-xl" placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">{t('admin.aboutContent.missionBullets')}</h3>
              <Button size="sm" onClick={openNewBullet} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />{t('admin.aboutContent.addBullet')}</Button>
            </div>
            {bullets.length === 0 && <p className="text-gray-500">{t('admin.aboutContent.noBullets')}</p>}
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
          <DialogHeader><DialogTitle>{editingTimeline? t('admin.aboutContent.timeline.editTitle'): t('admin.aboutContent.timeline.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tl-year">{t('admin.aboutContent.timeline.yearLabel')}</Label>
              <Input id="tl-year" value={timelineForm.year} onChange={(e)=> setTimelineForm(f=>({ ...f, year: e.target.value.replace(/[^0-9]/g,'').slice(0,4) }))} className="mt-2 rounded-xl" placeholder="2020" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tl-title-en">{t('admin.aboutContent.timeline.titleLabel')} (EN)</Label>
                <Input id="tl-title-en" value={timelineForm.titleEn} onChange={(e)=> setTimelineForm(f=>({ ...f, titleEn: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="tl-title-fa">{t('admin.aboutContent.timeline.titleLabel')} (FA)</Label>
                <Input dir="rtl" id="tl-title-fa" value={timelineForm.titleFa} onChange={(e)=> setTimelineForm(f=>({ ...f, titleFa: e.target.value }))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tl-desc-en">{t('admin.aboutContent.timeline.descriptionLabel')} (EN)</Label>
                <Textarea id="tl-desc-en" value={timelineForm.descriptionEn} onChange={(e)=> setTimelineForm(f=>({ ...f, descriptionEn: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
              </div>
              <div>
                <Label htmlFor="tl-desc-fa">{t('admin.aboutContent.timeline.descriptionLabel')} (FA)</Label>
                <Textarea dir="rtl" id="tl-desc-fa" value={timelineForm.descriptionFa} onChange={(e)=> setTimelineForm(f=>({ ...f, descriptionFa: e.target.value }))} className="mt-2 rounded-xl text-right" rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setTimelineDialogOpen(false); setEditingTimeline(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveTimeline}>{editingTimeline? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Value Dialog */}
  <Dialog open={valueDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setValueDialogOpen(false); setEditingValue(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingValue? t('admin.aboutContent.value.editTitle'): t('admin.aboutContent.value.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="val-title-en">{t('admin.aboutContent.value.titleLabel')} (EN)</Label>
                <Input id="val-title-en" value={valueForm.titleEn} onChange={(e)=> setValueForm(f=>({ ...f, titleEn: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="val-title-fa">{t('admin.aboutContent.value.titleLabel')} (FA)</Label>
                <Input dir="rtl" id="val-title-fa" value={valueForm.titleFa} onChange={(e)=> setValueForm(f=>({ ...f, titleFa: e.target.value }))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="val-desc-en">{t('admin.aboutContent.value.descriptionLabel')} (EN)</Label>
                <Textarea id="val-desc-en" value={valueForm.descriptionEn} onChange={(e)=> setValueForm(f=>({ ...f, descriptionEn: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
              </div>
              <div>
                <Label htmlFor="val-desc-fa">{t('admin.aboutContent.value.descriptionLabel')} (FA)</Label>
                <Textarea dir="rtl" id="val-desc-fa" value={valueForm.descriptionFa} onChange={(e)=> setValueForm(f=>({ ...f, descriptionFa: e.target.value }))} className="mt-2 rounded-xl text-right" rows={3} />
              </div>
            </div>
            <div>
              <Label htmlFor="val-icon">{t('admin.aboutContent.value.iconLabel')}</Label>
              <Input id="val-icon" value={valueForm.icon} onChange={(e)=> setValueForm(f=>({ ...f, icon: e.target.value }))} className="mt-2 rounded-xl" placeholder="lucide icon name (optional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setValueDialogOpen(false); setEditingValue(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveValue}>{editingValue? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
  <Dialog open={skillDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setSkillDialogOpen(false); setEditingSkill(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingSkill? t('admin.aboutContent.skill.editTitle'): t('admin.aboutContent.skill.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sk-name-en">{t('admin.aboutContent.skill.nameLabel')} (EN)</Label>
                <Input id="sk-name-en" value={skillForm.nameEn} onChange={(e)=> setSkillForm(f=>({ ...f, nameEn: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="sk-name-fa">{t('admin.aboutContent.skill.nameLabel')} (FA)</Label>
                <Input dir="rtl" id="sk-name-fa" value={skillForm.nameFa} onChange={(e)=> setSkillForm(f=>({ ...f, nameFa: e.target.value }))} className="mt-2 rounded-xl text-right" />
              </div>
            </div>
            <div>
              <Label htmlFor="sk-level">{t('admin.aboutContent.skill.levelLabel')}</Label>
              <Input id="sk-level" value={skillForm.level} onChange={(e)=> setSkillForm(f=>({ ...f, level: e.target.value.replace(/[^0-9]/g,'').slice(0,3) }))} className="mt-2 rounded-xl" placeholder="85" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setSkillDialogOpen(false); setEditingSkill(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveSkill}>{editingSkill? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bullet Dialog */}
  <Dialog open={bulletDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setBulletDialogOpen(false); setEditingBullet(null);} }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingBullet? t('admin.aboutContent.bullet.editTitle'): t('admin.aboutContent.bullet.addTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bl-text-en">{t('admin.aboutContent.bullet.textLabel')} (EN)</Label>
                <Textarea id="bl-text-en" value={bulletForm.textEn} onChange={(e)=> setBulletForm(f=>({ ...f, textEn: e.target.value }))} className="mt-2 rounded-xl" rows={3} />
              </div>
              <div>
                <Label htmlFor="bl-text-fa">{t('admin.aboutContent.bullet.textLabel')} (FA)</Label>
                <Textarea dir="rtl" id="bl-text-fa" value={bulletForm.textFa} onChange={(e)=> setBulletForm(f=>({ ...f, textFa: e.target.value }))} className="mt-2 rounded-xl text-right" rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setBulletDialogOpen(false); setEditingBullet(null);} }>{t('admin.cancel')}</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveBullet}>{editingBullet? t('admin.update'): t('admin.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
