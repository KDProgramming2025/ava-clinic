import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Save, RefreshCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface Config {
  timeSlots?: string[];
  blackoutDates?: string[];
  disclaimer?: string;
  bufferMinutes?: number;
  defaultDurationMinutes?: number;
}

export function BookingFlowConfig() {
  const [cfg, setCfg] = useState<Config>({ timeSlots: [], blackoutDates: [], disclaimer: '', bufferMinutes: 0, defaultDurationMinutes: 60 });
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
        bufferMinutes: data.bufferMinutes ?? 0,
        defaultDurationMinutes: data.defaultDurationMinutes ?? 60,
      });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load booking configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const parseCSV = (s: string) => s.split(/[,\n]/).map(v => v.trim()).filter(Boolean);

  const save = async () => {
    try {
      setSaving(true);
      await apiFetch('/booking-config', {
        method: 'PUT',
        body: {
          ...cfg,
          timeSlots: cfg.timeSlots,
          blackoutDates: cfg.blackoutDates,
        },
      });
      toast.success('Booking configuration saved');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-gray-900">Booking Flow Configuration</h1>
          <p className="text-gray-600">Control available time slots, blackout dates and booking disclaimers</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={load} variant="outline" className="rounded-xl" disabled={loading}><RefreshCcw className="w-4 h-4 mr-2" /> Reload</Button>
          <Button onClick={save} className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" disabled={saving}><Save className="w-4 h-4 mr-2" /> {saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-pink-500" />
              <h2 className="text-gray-900">Available Time Slots</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">Comma or newline separated times in 24h format, e.g. 09:00, 10:00, 11:30</p>
            <Textarea
              rows={8}
              value={(cfg.timeSlots || []).join(', ')}
              onChange={(e)=> setCfg(prev => ({ ...prev, timeSlots: parseCSV(e.target.value) }))}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm text-gray-600">Default Duration (minutes)</label>
                <Input type="number" value={cfg.defaultDurationMinutes ?? 60} onChange={(e)=> setCfg(prev => ({ ...prev, defaultDurationMinutes: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Buffer (minutes)</label>
                <Input type="number" value={cfg.bufferMinutes ?? 0} onChange={(e)=> setCfg(prev => ({ ...prev, bufferMinutes: Number(e.target.value) }))} className="mt-1" />
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h2 className="text-gray-900">Blackout Dates</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">Dates in YYYY-MM-DD comma or newline separated</p>
            <Textarea
              rows={8}
              value={(cfg.blackoutDates || []).join(', ')}
              onChange={(e)=> setCfg(prev => ({ ...prev, blackoutDates: parseCSV(e.target.value) }))}
            />
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-gray-900 mb-3">Booking Disclaimer</h2>
          <Textarea rows={4} value={cfg.disclaimer || ''} onChange={(e)=> setCfg(prev => ({ ...prev, disclaimer: e.target.value }))} />
        </Card>
      </motion.div>
    </div>
  );
}

export default BookingFlowConfig;
