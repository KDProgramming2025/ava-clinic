import { useEffect, useMemo, useState, memo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Plus, Save, RefreshCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { ScrollArea } from '../../ui/scroll-area';
import { apiFetch } from '../../../api/client';
import { toast } from 'sonner';
import { useLanguage } from '../../LanguageContext';

interface TranslationMap { [key: string]: Record<string, string>; }
interface Row { key: string; values: Record<string, string>; dirty?: boolean; new?: boolean; }
// RTL language helper
const RTL_LANGS = new Set(['fa', 'fa-ir', 'ar', 'ar-sa', 'he', 'he-il', 'ur', 'ps']);
const isRtlLang = (lang: string) => RTL_LANGS.has((lang || '').toLowerCase());

export function TranslationsManagement() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<Row[]>([]);
  const [filtered, setFiltered] = useState<Row[]>([]);
  const [languages, setLanguages] = useState<string[]>(['en']);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValues, setNewValues] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  // Debounce search
  const debounce = useMemo(() => {
    let t: any; return (q: string, cb: (v: string)=>void) => { clearTimeout(t); t = setTimeout(()=>cb(q), 250); };
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<TranslationMap>('/translations');
      // Get languages by union of keys plus settings languages
      const settings = await apiFetch<any>('/settings');
      let langs: string[] = ['en'];
      if (settings?.settings?.languagesJson && Array.isArray(settings.settings.languagesJson)) {
        langs = settings.settings.languagesJson.filter((x: any) => typeof x === 'string');
      } else {
        // derive from data
        const set = new Set<string>();
        Object.values(data).forEach(obj => Object.keys(obj).forEach(l => set.add(l)));
        if (set.size) langs = Array.from(set);
      }
      const newRows: Row[] = Object.keys(data).sort().map(k => ({ key: k, values: langs.reduce((acc, l) => { acc[l] = data[k][l] || ''; return acc; }, {} as Record<string,string>) }));
      setLanguages(langs);
      setRows(newRows);
      setFiltered(newRows);
    } catch (e: any) {
      toast.error(e?.message || t('magazine.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);

  // Keep filtered list in sync with rows cheaply when no search is active
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(rows);
    }
  }, [rows, search]);

  // Recompute expensive filter only when search changes (and when rows structurally change)
  useEffect(() => {
    const q = search.trim();
    if (!q) return; // handled by cheap sync above
    debounce(q, (query) => {
      const lower = query.toLowerCase();
      // Use latest rows snapshot: filter by key or any language value
      setFiltered(rows.filter(r =>
        r.key.toLowerCase().includes(lower) ||
        Object.values(r.values).some(v => (v || '').toLowerCase().includes(lower))
      ));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, rows.length]);

  const markDirty = (key: string, lang: string, value: string) => {
    setRows(prev => prev.map(r => r.key === key ? { ...r, values: { ...r.values, [lang]: value }, dirty: true } : r));
  };

  const openAdd = () => {
    setNewKey('');
    setNewValues(languages.reduce((acc, l) => { acc[l] = ''; return acc; }, {} as Record<string,string>));
    setAddOpen(true);
  };

  const addRow = () => {
    const key = newKey.trim();
    if (!key) { toast.error(t('admin.translations.keyRequired')); return; }
    if (rows.some(r => r.key === key)) { toast.error(t('admin.translations.keyExists')); return; }
    const row: Row = { key, values: { ...newValues }, dirty: true, new: true };
    setRows(prev => [row, ...prev]);
    setFiltered(prev => [row, ...prev]);
    setAddOpen(false);
  };

  const dirtyCount = rows.filter(r => r.dirty).length;

  const bulkSave = async () => {
    if (!dirtyCount) { toast.message(t('admin.translations.nothingToSave')); return; }
    try {
      setSaving(true);
      // Ensure the currently edited field commits its value
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLTextAreaElement) {
        (document.activeElement as HTMLTextAreaElement).blur();
      }
      const payload: TranslationMap = {};
      rows.forEach(r => { if (r.dirty) payload[r.key] = r.values; });
      await apiFetch('/translations', { method: 'PUT', body: payload });
      toast.success(t('admin.translations.saved'));
      setRows(prev => prev.map(r => ({ ...r, dirty: false, new: false })));
    } catch (e: any) {
      toast.error(e?.message || t('admin.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.translations.title')}</h1>
          <p className="text-gray-600">{t('admin.translations.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openAdd} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> {t('admin.translations.addKey')}
          </Button>
          <Button variant="outline" onClick={load} className="rounded-xl" disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> {t('admin.reload')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: t('admin.translations.totalKeys'), value: rows.length, color: 'from-pink-500 to-rose-600' },
          { label: t('admin.translations.dirty'), value: dirtyCount, color: 'from-yellow-500 to-orange-600' },
          { label: t('admin.translations.languages'), value: languages.length, color: 'from-purple-500 to-violet-600' },
          { label: t('admin.translations.filtered'), value: filtered.length, color: 'from-green-500 to-emerald-600' }].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Save Bar */}
      <Card className="p-4 border-0 shadow-lg flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('admin.translations.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>
        <Button
          disabled={!dirtyCount || saving}
          onClick={bulkSave}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? t('admin.saving') : `${t('admin.save')} (${dirtyCount})`}
        </Button>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <ScrollArea className="max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-56">{t('admin.translations.key')}</th>
                {languages.map(l => (
                  <th key={l} className="text-left px-4 py-3 font-medium text-gray-600">{l.toUpperCase()}</th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <TranslationRow key={row.key} row={row} languages={languages} setRows={setRows} modifiedLabel={t('admin.translations.modified')} badgeNewLabel={t('admin.translations.badgeNew')} badgeKeyLabel={t('admin.translations.badgeKey')} />
              ))}
              {!filtered.length && !loading && (
                <tr>
                  <td colSpan={languages.length + 2} className="px-4 py-10 text-center text-gray-500">{t('admin.translations.noResults')}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={languages.length + 2} className="px-4 py-10 text-center text-gray-500">{t('admin.translations.loading')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      {/* Add Key Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('admin.translations.addDialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t('admin.translations.keyPlaceholder')}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="rounded-xl"
            />
            <div className="grid gap-4">
              {languages.map(l => (
                <div key={l}>
                  <label className="text-xs text-gray-500 mb-1 block">{l.toUpperCase()} {t('admin.translations.valueLabel')}</label>
                  <Textarea
                    rows={3}
                    dir={isRtlLang(l) ? 'rtl' : 'ltr'}
                    className={isRtlLang(l) ? 'text-right' : ''}
                    value={newValues[l]}
                    onChange={(e) => setNewValues(prev => ({ ...prev, [l]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)}>{t('admin.translations.cancel')}</Button>
            <Button onClick={addRow} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">{t('admin.translations.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TranslationsManagement;

type RowType = Row;

const TranslationRow = memo(function TranslationRow({ row, languages, setRows, modifiedLabel, badgeNewLabel, badgeKeyLabel }: {
  row: RowType;
  languages: string[];
  setRows: React.Dispatch<React.SetStateAction<RowType[]>>;
  modifiedLabel: string;
  badgeNewLabel: string;
  badgeKeyLabel: string;
}) {
  const onCommit = (lang: string, value: string) => {
    setRows(prev => prev.map(r => r.key === row.key ? { ...r, values: { ...r.values, [lang]: value }, dirty: true } : r));
  };
  return (
    <tr className={row.dirty ? 'bg-yellow-50' : ''}>
      <td className="align-top px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge className={row.new ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}>{row.new ? badgeNewLabel : badgeKeyLabel}</Badge>
          <span className="text-gray-900 font-mono break-all">{row.key}</span>
        </div>
      </td>
      {languages.map(l => (
        <td key={l} className="px-4 py-3">
          <Textarea
            key={`${row.key}-${l}`}
            rows={3}
            defaultValue={row.values[l]}
            onBlur={(e) => onCommit(l, e.target.value)}
            dir={isRtlLang(l) ? 'rtl' : 'ltr'}
            className={`rounded-md text-xs ${isRtlLang(l) ? 'text-right' : ''}`}
          />
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        {row.dirty && <span className="text-xs text-yellow-600">{modifiedLabel}</span>}
      </td>
    </tr>
  );
});
