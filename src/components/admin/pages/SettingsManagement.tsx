import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Palette, Image as ImageIcon, Mail } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

interface BrandingSettings {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}
interface EmailTemplates {
  emailConfirmTemplate?: string | null;
  emailReminderTemplate?: string | null;
  contactAutoReply?: string | null;
}
interface SettingsPayload extends BrandingSettings, EmailTemplates {}

export function SettingsManagement() {
  const [brand, setBrand] = useState<BrandingSettings>({});
  const [emails, setEmails] = useState<EmailTemplates>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
      const s = data?.settings || {};
      setBrand({ logoUrl: s.logoUrl || '', primaryColor: s.primaryColor || '', secondaryColor: s.secondaryColor || '' });
      setEmails({ emailConfirmTemplate: s.emailConfirmTemplate || '', emailReminderTemplate: s.emailReminderTemplate || '', contactAutoReply: s.contactAutoReply || '' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load settings');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      const settings: SettingsPayload = { ...brand, ...emails };
      await apiFetch('/settings', { method: 'PUT', body: { settings } });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-gray-900">Settings</h1>
        <p className="text-gray-600">Branding and email templates</p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="branding"><SettingsIcon className="w-4 h-4 mr-2" />Branding</TabsTrigger>
          <TabsTrigger value="emails"><Mail className="w-4 h-4 mr-2" />Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">Branding</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <div className="flex gap-3 mt-2">
                  <Input id="logo-url" placeholder="/uploads/logo.png" value={brand.logoUrl || ''} onChange={(e)=> setBrand({ ...brand, logoUrl: e.target.value })} className="rounded-xl" />
                  <Button type="button" variant="outline" className="rounded-xl" onClick={load}>Preview</Button>
                </div>
                {brand.logoUrl && <div className="mt-3 h-16 flex items-center gap-3"><ImageIcon className="w-5 h-5 text-pink-600" /><img src={brand.logoUrl} alt="Logo" className="h-12 object-contain" /></div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Primary Color</Label>
                  <Input type="color" value={brand.primaryColor || '#ec4899'} onChange={(e)=> setBrand({ ...brand, primaryColor: e.target.value })} className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input type="color" value={brand.secondaryColor || '#a855f7'} onChange={(e)=> setBrand({ ...brand, secondaryColor: e.target.value })} className="mt-2 h-12 rounded-xl" />
                </div>
              </div>
              <Button disabled={saving} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">{saving ? 'Saving…' : 'Save Branding'}</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">Email Templates</h3>
            <div className="space-y-6">
              <div>
                <Label className="mb-1 block">Booking Confirmation</Label>
                <Textarea rows={8} value={emails.emailConfirmTemplate || ''} onChange={(e)=> setEmails({ ...emails, emailConfirmTemplate: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1 block">Booking Reminder</Label>
                <Textarea rows={8} value={emails.emailReminderTemplate || ''} onChange={(e)=> setEmails({ ...emails, emailReminderTemplate: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1 block">Contact Auto-Reply</Label>
                <Textarea rows={6} value={emails.contactAutoReply || ''} onChange={(e)=> setEmails({ ...emails, contactAutoReply: e.target.value })} className="rounded-xl" />
              </div>
              <Button disabled={saving} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">{saving ? 'Saving…' : 'Save Templates'}</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
