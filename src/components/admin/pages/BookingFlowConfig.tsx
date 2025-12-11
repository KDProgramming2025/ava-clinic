import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Save, RefreshCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';

interface Config {
  timeSlots?: string[];
  blackoutDates?: string[];
  disclaimer?: string;
  disclaimerEn?: string;
  disclaimerFa?: string;
  bufferMinutes?: number;
  defaultDurationMinutes?: number;
}

export function BookingFlowConfig() {
  const { t } = useLanguage();
  const [cfg, setCfg] = useState<Config>({ timeSlots: [], blackoutDates: [], disclaimer: '', disclaimerEn: '', disclaimerFa: '', bufferMinutes: 0, defaultDurationMinutes: 60 });
  const [rawTimeSlots, setRawTimeSlots] = useState('');
  const [rawBlackoutDates, setRawBlackoutDates] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Config>('/booking-config');
      setCfg({
        timeSlots: (data.timeSlots as any) || [],
        blackoutDates: (data.blackoutDates as any) || [],
        disclaimer: data.disclaimer || '',
        disclaimerEn: data.disclaimerEn || '',
        disclaimerFa: data.disclaimerFa || '',
        bufferMinutes: data.bufferMinutes ?? 0,
        defaultDurationMinutes: data.defaultDurationMinutes ?? 60,
      });
      setRawTimeSlots(((data.timeSlots as any) || []).join(', '));
      setRawBlackoutDates(((data.blackoutDates as any) || []).join(', '));
    } catch (e: any) {
      toast.error(e?.message || t('admin.bookingFlow.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const parseCSV = (s: string) => s.split(/[,\n]/).map(v => v.trim()).filter(Boolean);

  const save = async () => {
    try {
      setSaving(true);
      const timeSlots = parseCSV(rawTimeSlots);
      const blackoutDates = parseCSV(rawBlackoutDates);
      
      await apiFetch('/booking-config', {
        method: 'PUT',
        body: {
          ...cfg,
          timeSlots,
          blackoutDates,
        },
      });
      toast.success(t('admin.bookingFlow.saved'));
    } catch (e: any) {
      toast.error(e?.message || t('admin.bookingFlow.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.bookingFlow.title')}</h1>
          <p className="text-gray-600">{t('admin.bookingFlow.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={load} variant="outline" className="rounded-xl" disabled={loading}><RefreshCcw className="w-4 h-4 mr-2" /> {t('admin.reload')}</Button>
          <Button onClick={save} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" disabled={saving}><Save className="w-4 h-4 mr-2" /> {saving ? t('admin.saving') : t('admin.saveGeneric')}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-pink-500" />
              <h2 className="text-gray-900">{t('admin.bookingFlow.availableSlots')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">{t('admin.bookingFlow.availableSlotsHint')}</p>
            <Textarea
              rows={8}
              value={rawTimeSlots}
              onChange={(e)=> setRawTimeSlots(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm text-gray-600">{t('admin.bookingFlow.defaultDuration')}</label>
                <Input type="number" value={cfg.defaultDurationMinutes ?? 60} onChange={(e)=> setCfg(prev => ({ ...prev, defaultDurationMinutes: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('admin.bookingFlow.buffer')}</label>
                <Input type="number" value={cfg.bufferMinutes ?? 0} onChange={(e)=> setCfg(prev => ({ ...prev, bufferMinutes: Number(e.target.value) }))} className="mt-1" />
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h2 className="text-gray-900">{t('admin.bookingFlow.blackoutDates')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">{t('admin.bookingFlow.blackoutDatesHint')}</p>
            <Textarea
              rows={8}
              value={rawBlackoutDates}
              onChange={(e)=> setRawBlackoutDates(e.target.value)}
            />
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-gray-900 mb-3">{t('admin.bookingFlow.disclaimer')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">English</label>
              <Textarea 
                rows={4} 
                value={cfg.disclaimerEn || ''} 
                onChange={(e)=> setCfg(prev => ({ ...prev, disclaimerEn: e.target.value }))} 
                placeholder="Booking disclaimer in English..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Persian</label>
              <Textarea 
                rows={4} 
                dir="rtl"
                value={cfg.disclaimerFa || ''} 
                onChange={(e)=> setCfg(prev => ({ ...prev, disclaimerFa: e.target.value }))} 
                placeholder="توضیحات رزرو به فارسی..."
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default BookingFlowConfig;
