import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, HelpCircle, Plus, Edit, Trash2, Save, RefreshCcw, Share2, Link as LinkIcon } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
// Use existing sonner setup (import path without version tag)
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

// Types based on backend schema
interface ContactInfoBlock { id?: string; type: 'phone'|'email'|'address'|'hours'; title: string; values: string[] }
interface ContactFaq { id?: string; question: string; answer: string }
interface SocialLink { id?: string; platform: string; url: string; icon?: string|null }
interface QuickAction { id?: string; label: string; type: 'call'|'email'|'chat'|'custom'; target: string }
interface ContactData { blocks: ContactInfoBlock[]; faq: ContactFaq[]; social: SocialLink[]; quickActions: QuickAction[] }

export function ContactContentManagement() {
  const [data, setData] = useState<ContactData>({ blocks: [], faq: [], social: [], quickActions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [dirty, setDirty] = useState(false);

  // Local editable copies
  const [blocks, setBlocks] = useState<ContactInfoBlock[]>([]);
  const [faq, setFaq] = useState<ContactFaq[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  // Dialog states & forms
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContactInfoBlock|null>(null);
  const [blockForm, setBlockForm] = useState<{ type: 'phone'|'email'|'address'|'hours'; title: string; values: string[] }>({ type: 'phone', title: '', values: [''] });

  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ContactFaq|null>(null);
  const [faqForm, setFaqForm] = useState<{ question: string; answer: string }>({ question: '', answer: '' });

  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink|null>(null);
  const [socialForm, setSocialForm] = useState<{ platform: string; url: string; icon: string }>({ platform: '', url: '', icon: '' });

  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [editingQuick, setEditingQuick] = useState<QuickAction|null>(null);
  const [quickForm, setQuickForm] = useState<{ label: string; type: 'call'|'email'|'chat'|'custom'; target: string }>({ label: '', type: 'call', target: '' });

  const fetchContact = async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiFetch<ContactData>('/contact');
      setData(res);
      setBlocks(res.blocks || []);
      setFaq(res.faq || []);
      setSocial(res.social || []);
      setQuickActions(res.quickActions || []);
      setDirty(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to load contact content');
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchContact(); }, []);

  // Block handlers
  const openNewBlock = () => { setEditingBlock(null); setBlockForm({ type: 'phone', title: '', values: [''] }); setBlockDialogOpen(true); };
  const openEditBlock = (b: ContactInfoBlock) => { setEditingBlock(b); setBlockForm({ type: b.type, title: b.title, values: b.values.length? b.values:[""] }); setBlockDialogOpen(true); };
  const saveBlock = () => {
    if (!blockForm.title.trim()) { toast.error('Block title required'); return; }
    const cleanedValues = blockForm.values.map(v=>v.trim()).filter(v=>v);
    if (!cleanedValues.length) { toast.error('At least one value required'); return; }
    if (editingBlock) {
      setBlocks(prev => prev.map(x => x === editingBlock ? { ...editingBlock, type: blockForm.type, title: blockForm.title.trim(), values: cleanedValues } : x));
    } else {
      setBlocks(prev => [...prev, { id: crypto.randomUUID(), type: blockForm.type, title: blockForm.title.trim(), values: cleanedValues }]);
    }
    setBlockDialogOpen(false); setEditingBlock(null); setDirty(true);
  };
  const deleteBlock = (b: ContactInfoBlock) => { if (!confirm('Delete block?')) return; setBlocks(prev => prev.filter(x => x !== b)); setDirty(true); };
  const addBlockValueRow = () => setBlockForm(f=>({ ...f, values: [...f.values, ''] }));
  const updateBlockValue = (i: number, val: string) => setBlockForm(f=>({ ...f, values: f.values.map((v,idx)=> idx===i? val : v) }));
  const removeBlockValue = (i: number) => setBlockForm(f=>({ ...f, values: f.values.filter((_,idx)=> idx!==i) }));

  // FAQ handlers
  const openNewFaq = () => { setEditingFaq(null); setFaqForm({ question: '', answer: '' }); setFaqDialogOpen(true); };
  const openEditFaq = (f: ContactFaq) => { setEditingFaq(f); setFaqForm({ question: f.question, answer: f.answer }); setFaqDialogOpen(true); };
  const saveFaq = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) { toast.error('Question and answer required'); return; }
    if (editingFaq) setFaq(prev => prev.map(x => x === editingFaq ? { ...editingFaq, question: faqForm.question.trim(), answer: faqForm.answer.trim() } : x));
    else setFaq(prev => [...prev, { id: crypto.randomUUID(), question: faqForm.question.trim(), answer: faqForm.answer.trim() }]);
    setFaqDialogOpen(false); setEditingFaq(null); setDirty(true);
  };
  const deleteFaq = (f: ContactFaq) => { if (!confirm('Delete FAQ?')) return; setFaq(prev => prev.filter(x => x !== f)); setDirty(true); };

  // Social handlers
  const openNewSocial = () => { setEditingSocial(null); setSocialForm({ platform: '', url: '', icon: '' }); setSocialDialogOpen(true); };
  const openEditSocial = (s: SocialLink) => { setEditingSocial(s); setSocialForm({ platform: s.platform, url: s.url, icon: s.icon || '' }); setSocialDialogOpen(true); };
  const saveSocial = () => {
    if (!socialForm.platform.trim() || !socialForm.url.trim()) { toast.error('Platform and URL required'); return; }
    if (editingSocial) setSocial(prev => prev.map(x => x === editingSocial ? { ...editingSocial, platform: socialForm.platform.trim(), url: socialForm.url.trim(), icon: socialForm.icon.trim() || undefined } : x));
    else setSocial(prev => [...prev, { id: crypto.randomUUID(), platform: socialForm.platform.trim(), url: socialForm.url.trim(), icon: socialForm.icon.trim() || undefined }]);
    setSocialDialogOpen(false); setEditingSocial(null); setDirty(true);
  };
  const deleteSocial = (s: SocialLink) => { if (!confirm('Delete social link?')) return; setSocial(prev => prev.filter(x => x !== s)); setDirty(true); };

  // Quick action handlers
  const openNewQuick = () => { setEditingQuick(null); setQuickForm({ label: '', type: 'call', target: '' }); setQuickDialogOpen(true); };
  const openEditQuick = (q: QuickAction) => { setEditingQuick(q); setQuickForm({ label: q.label, type: q.type, target: q.target }); setQuickDialogOpen(true); };
  const saveQuick = () => {
    if (!quickForm.label.trim() || !quickForm.target.trim()) { toast.error('Label and target required'); return; }
    if (editingQuick) setQuickActions(prev => prev.map(x => x === editingQuick ? { ...editingQuick, label: quickForm.label.trim(), type: quickForm.type, target: quickForm.target.trim() } : x));
    else setQuickActions(prev => [...prev, { id: crypto.randomUUID(), label: quickForm.label.trim(), type: quickForm.type, target: quickForm.target.trim() }]);
    setQuickDialogOpen(false); setEditingQuick(null); setDirty(true);
  };
  const deleteQuick = (q: QuickAction) => { if (!confirm('Delete quick action?')) return; setQuickActions(prev => prev.filter(x => x !== q)); setDirty(true); };

  const saveAll = async () => {
    try {
      const payload = {
        blocks: blocks.map(b => ({ type: b.type, title: b.title, values: b.values })),
        faq: faq.map(f => ({ question: f.question, answer: f.answer })),
        social: social.map(s => ({ platform: s.platform, url: s.url, icon: s.icon || null })),
        quickActions: quickActions.map(q => ({ label: q.label, type: q.type, target: q.target })),
      };
      await apiFetch('/contact', { method: 'PUT', body: payload });
      toast.success('Contact content saved');
      setDirty(false);
      await fetchContact();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
  };

  const resetChanges = () => {
    setBlocks(data.blocks || []);
    setFaq(data.faq || []);
    setSocial(data.social || []);
    setQuickActions(data.quickActions || []);
    setDirty(false);
  };

  const blockIcon = (type: ContactInfoBlock['type']) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4 text-pink-500" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'address': return <MapPin className="w-4 h-4 text-indigo-500" />;
      case 'hours': return <Clock className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Contact Content Management</h1>
          <p className="text-gray-600">Edit contact info blocks, FAQs, social links, quick actions</p>
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
          {/* Info Blocks */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-pink-500" />Info Blocks</h2>
              <Button size="sm" onClick={openNewBlock} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Block</Button>
            </div>
            {blocks.length === 0 && <p className="text-gray-500">No info blocks defined.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((b, idx) => (
                <Card key={(b.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {blockIcon(b.type)}
                      <span className="font-medium text-gray-900 line-clamp-1" title={b.title}>{b.title}</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 capitalize">{b.type}</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {b.values.map((v,i)=>(<li key={i}>{v}</li>))}
                  </ul>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditBlock(b)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteBlock(b)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* FAQ */}
            <Card className="p-6 border-0 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500" />FAQ</h2>
                <Button size="sm" onClick={openNewFaq} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add FAQ</Button>
              </div>
              {faq.length === 0 && <p className="text-gray-500">No FAQ items.</p>}
              <div className="space-y-4">
                {faq.map((f, idx) => (
                  <Card key={(f.id||'')+idx} className="p-4 relative group">
                    <div className="font-medium text-gray-900 mb-2 line-clamp-1" title={f.question}>{f.question}</div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{f.answer}</p>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={()=> openEditFaq(f)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={()=> deleteFaq(f)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

          {/* Social Links */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Share2 className="w-5 h-5 text-green-600" />Social Links</h2>
              <Button size="sm" onClick={openNewSocial} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Link</Button>
            </div>
            {social.length === 0 && <p className="text-gray-500">No social links.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {social.map((s, idx) => (
                <Card key={(s.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 line-clamp-1" title={s.platform}>{s.platform}</span>
                    <Badge className="bg-pink-100 text-pink-700">{s.icon || '—'}</Badge>
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"><LinkIcon className="w-3 h-3" />{s.url}</a>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditSocial(s)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteSocial(s)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 flex items-center gap-2"><Phone className="w-5 h-5 text-purple-600" />Quick Actions</h2>
              <Button size="sm" onClick={openNewQuick} className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Add Action</Button>
            </div>
            {quickActions.length === 0 && <p className="text-gray-500">No quick actions.</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((q, idx) => (
                <Card key={(q.id||'')+idx} className="p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 line-clamp-1" title={q.label}>{q.label}</span>
                    <Badge className="bg-indigo-100 text-indigo-700 capitalize">{q.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 break-all">{q.target}</p>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={()=> openEditQuick(q)} className="rounded-md"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={()=> deleteQuick(q)} className="rounded-md text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Block Dialog */}
  <Dialog open={blockDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setBlockDialogOpen(false); setEditingBlock(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingBlock? 'Edit Block':'Add Block'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blk-type">Type*</Label>
                <select id="blk-type" value={blockForm.type} onChange={(e)=> setBlockForm(f=>({ ...f, type: e.target.value as any }))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="phone">phone</option>
                  <option value="email">email</option>
                  <option value="address">address</option>
                  <option value="hours">hours</option>
                </select>
              </div>
              <div>
                <Label htmlFor="blk-title">Title*</Label>
                <Input id="blk-title" value={blockForm.title} onChange={(e)=> setBlockForm(f=>({ ...f, title: e.target.value }))} className="mt-2 rounded-xl" />
              </div>
            </div>
            <div>
              <Label>Values*</Label>
              <div className="space-y-2 mt-2">
                {blockForm.values.map((v,i)=>(
                  <div key={i} className="flex gap-2">
                    <Input value={v} onChange={(e)=> updateBlockValue(i, e.target.value)} className="rounded-xl flex-1" />
                    <Button variant="outline" size="sm" onClick={()=> removeBlockValue(i)} disabled={blockForm.values.length===1} className="rounded-xl text-red-600">✕</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addBlockValueRow} className="rounded-xl">Add Value</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setBlockDialogOpen(false); setEditingBlock(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveBlock}>{editingBlock? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
  <Dialog open={faqDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setFaqDialogOpen(false); setEditingFaq(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingFaq? 'Edit FAQ':'Add FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fq-question">Question*</Label>
              <Input id="fq-question" value={faqForm.question} onChange={(e)=> setFaqForm(f=>({ ...f, question: e.target.value }))} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="fq-answer">Answer*</Label>
              <Textarea id="fq-answer" value={faqForm.answer} onChange={(e)=> setFaqForm(f=>({ ...f, answer: e.target.value }))} className="mt-2 rounded-xl" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setFaqDialogOpen(false); setEditingFaq(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveFaq}>{editingFaq? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Dialog */}
  <Dialog open={socialDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setSocialDialogOpen(false); setEditingSocial(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingSocial? 'Edit Social Link':'Add Social Link'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="soc-platform">Platform*</Label>
                <Input id="soc-platform" value={socialForm.platform} onChange={(e)=> setSocialForm(f=>({ ...f, platform: e.target.value }))} className="mt-2 rounded-xl" placeholder="Instagram" />
              </div>
              <div>
                <Label htmlFor="soc-icon">Icon</Label>
                <Input id="soc-icon" value={socialForm.icon} onChange={(e)=> setSocialForm(f=>({ ...f, icon: e.target.value }))} className="mt-2 rounded-xl" placeholder="lucide icon name" />
              </div>
            </div>
            <div>
              <Label htmlFor="soc-url">URL*</Label>
              <Input id="soc-url" value={socialForm.url} onChange={(e)=> setSocialForm(f=>({ ...f, url: e.target.value }))} className="mt-2 rounded-xl" placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setSocialDialogOpen(false); setEditingSocial(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveSocial}>{editingSocial? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action Dialog */}
  <Dialog open={quickDialogOpen} onOpenChange={(o: boolean)=> { if(!o){ setQuickDialogOpen(false); setEditingQuick(null);} }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingQuick? 'Edit Quick Action':'Add Quick Action'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qa-label">Label*</Label>
                <Input id="qa-label" value={quickForm.label} onChange={(e)=> setQuickForm(f=>({ ...f, label: e.target.value }))} className="mt-2 rounded-xl" placeholder="Call Now" />
              </div>
              <div>
                <Label htmlFor="qa-type">Type*</Label>
                <select id="qa-type" value={quickForm.type} onChange={(e)=> setQuickForm(f=>({ ...f, type: e.target.value as any }))} className="mt-2 rounded-xl w-full border-gray-300">
                  <option value="call">call</option>
                  <option value="email">email</option>
                  <option value="chat">chat</option>
                  <option value="custom">custom</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="qa-target">Target*</Label>
              <Input id="qa-target" value={quickForm.target} onChange={(e)=> setQuickForm(f=>({ ...f, target: e.target.value }))} className="mt-2 rounded-xl" placeholder="tel:+15551234567" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> { setQuickDialogOpen(false); setEditingQuick(null);} }>Cancel</Button>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600" onClick={saveQuick}>{editingQuick? 'Update':'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
