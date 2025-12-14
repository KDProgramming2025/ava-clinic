import { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { Settings as SettingsIcon, Image as ImageIcon, Mail, UploadCloud, Bell } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';
import { useLanguage } from '../../LanguageContext';
import { resolveMediaUrl } from '../../../utils/media';

interface BrandingSettings {
  logoUrl?: string | null;
  siteTitleEn?: string | null;
  siteTitleFa?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}
interface NotificationSettings {
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
}
interface EmailTemplates {
  emailConfirmTemplate?: string | null;
  emailReminderTemplate?: string | null;
  contactAutoReply?: string | null;
}
interface SettingsPayload extends BrandingSettings, EmailTemplates, NotificationSettings {}

export function SettingsManagement() {
  const { t, isRTL } = useLanguage();
  const [brand, setBrand] = useState<BrandingSettings>({});
  const [notifications, setNotifications] = useState<NotificationSettings>({});
  const [emails, setEmails] = useState<EmailTemplates>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const logoPreviewUrl = useMemo(() => resolveMediaUrl(brand.logoUrl), [brand.logoUrl]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any>('/settings');
  const s = data?.settings || {};
      setBrand({
        logoUrl: s.logoUrl || '',
        siteTitleEn: s.siteTitleEn || s.siteTitle || '',
        siteTitleFa: s.siteTitleFa || s.siteTitle || '',
        primaryColor: s.primaryColor || '',
        secondaryColor: s.secondaryColor || '',
      });
      setNotifications({
        telegramBotToken: s.telegramBotToken || '',
        telegramChatId: s.telegramChatId || '',
      });
      setEmails({ emailConfirmTemplate: s.emailConfirmTemplate || '', emailReminderTemplate: s.emailReminderTemplate || '', contactAutoReply: s.contactAutoReply || '' });
    } catch (e: any) {
      toast.error(e?.message || t('admin.settings.loadFailed'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setSaving(true);
  const settings: SettingsPayload = { ...brand, ...emails, ...notifications };
  await apiFetch('/settings', { method: 'PUT', body: { settings } });
      toast.success(t('admin.settings.saved'));
    } catch (e: any) {
      toast.error(e?.message || t('admin.settings.saveFailed'));
    } finally { setSaving(false); }
  };

  const handleLogoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const input = event.target;
    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const alt = brand.siteTitleFa || brand.siteTitleEn || 'brand-logo';
      if (alt) formData.append('alt', alt);
      formData.append('labels', JSON.stringify(['branding', 'logo']));
      const uploaded = await apiFetch<{ url?: string; publicUrl?: string }>('/media/upload', { method: 'POST', body: formData });
      const nextUrl = uploaded?.url || uploaded?.publicUrl;
      if (nextUrl) {
        setBrand((prev) => ({ ...prev, logoUrl: nextUrl }));
        toast.success(t('admin.media.uploaded'));
      } else {
        toast.error(t('admin.media.uploadFailed'));
      }
    } catch (e: any) {
      toast.error(e?.message || t('admin.media.uploadFailed'));
    } finally {
      setLogoUploading(false);
      input.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-gray-900">{t('admin.settings.title')}</h1>
        <p className="text-gray-600">{t('admin.settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="branding"><SettingsIcon className="w-4 h-4 mr-2" />{t('admin.settings.brandingTab')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />{t('admin.settings.notificationsTab')}</TabsTrigger>
          <TabsTrigger value="emails"><Mail className="w-4 h-4 mr-2" />{t('admin.settings.emailsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">{t('admin.settings.brandingTitle')}</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="logo-url">{t('admin.settings.logoUrl')}</Label>
                <p className="text-sm text-gray-500 mt-1">{t('admin.settings.logoUploadHint')}</p>
                <div className="flex flex-col gap-3 mt-3 lg:flex-row">
                  <Input id="logo-url" placeholder="/uploads/logo.png" value={brand.logoUrl || ''} onChange={(e)=> setBrand({ ...brand, logoUrl: e.target.value })} className="rounded-xl" />
                  <div className="flex gap-2">
                    <label className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium cursor-pointer ${logoUploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                      <UploadCloud className="w-4 h-4" />
                      {logoUploading ? t('admin.media.uploading') : t('admin.settings.logoUploadButton')}
                      <input type="file" accept="image/*" className="sr-only" onChange={handleLogoFileChange} disabled={logoUploading} />
                    </label>
                  </div>
                </div>
                {logoPreviewUrl && (
                  <div className="mt-3 h-16 flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                    <img src={logoPreviewUrl} alt="Logo" className="h-12 object-contain" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('admin.settings.siteTitleHint')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="site-title-en" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.settings.siteTitleEn')}</Label>
                    <Input id="site-title-en" value={brand.siteTitleEn || ''} onChange={(e)=> setBrand({ ...brand, siteTitleEn: e.target.value })} className="mt-1 rounded-xl" placeholder="Ava Beauty Clinic" />
                  </div>
                  <div>
                    <Label htmlFor="site-title-fa" className="text-xs uppercase tracking-wide text-gray-500">{t('admin.settings.siteTitleFa')}</Label>
                    <Input id="site-title-fa" dir="rtl" className="mt-1 rounded-xl text-right" value={brand.siteTitleFa || ''} onChange={(e)=> setBrand({ ...brand, siteTitleFa: e.target.value })} placeholder="کلینیک آوا" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{t('admin.settings.primaryColor')}</Label>
                  <Input type="color" value={brand.primaryColor || '#ec4899'} onChange={(e)=> setBrand({ ...brand, primaryColor: e.target.value })} className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>{t('admin.settings.secondaryColor')}</Label>
                  <Input type="color" value={brand.secondaryColor || '#a855f7'} onChange={(e)=> setBrand({ ...brand, secondaryColor: e.target.value })} className="mt-2 h-12 rounded-xl" />
                </div>
              </div>
              <Button disabled={saving} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">{saving ? t('admin.saving') : t('admin.settings.saveBranding')}</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">{t('admin.settings.notificationsTitle')}</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="telegram-token">{t('admin.settings.telegramBotToken')}</Label>
                  <p className="text-xs text-gray-500 mb-2">{t('admin.settings.telegramBotTokenHint')}</p>
                  <Input 
                    id="telegram-token" 
                    dir="ltr" 
                    className={`rounded-xl ${isRTL ? 'text-right' : ''}`}
                    value={notifications.telegramBotToken || ''} 
                    onChange={(e)=> setNotifications({ ...notifications, telegramBotToken: e.target.value })} 
                    placeholder="123456789:ABCdef..." 
                  />
                </div>
                <div>
                  <Label htmlFor="telegram-chat-id">{t('admin.settings.telegramChatId')}</Label>
                  <p className="text-xs text-gray-500 mb-2">{t('admin.settings.telegramChatIdHint')}</p>
                  <Input 
                    id="telegram-chat-id" 
                    dir="ltr"
                    className={`rounded-xl ${isRTL ? 'text-right' : ''}`}
                    value={notifications.telegramChatId || ''} 
                    onChange={(e)=> setNotifications({ ...notifications, telegramChatId: e.target.value })} 
                    placeholder="123456789"
                  />
                </div>
              </div>
              <Button disabled={saving} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">{saving ? t('admin.saving') : t('admin.settings.saveNotifications')}</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">{t('admin.settings.emailsTitle')}</h3>
            <div className="space-y-6">
              <div>
                <Label className="mb-1 block">{t('admin.settings.bookingConfirmation')}</Label>
                <Textarea rows={8} value={emails.emailConfirmTemplate || ''} onChange={(e)=> setEmails({ ...emails, emailConfirmTemplate: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1 block">{t('admin.settings.bookingReminder')}</Label>
                <Textarea rows={8} value={emails.emailReminderTemplate || ''} onChange={(e)=> setEmails({ ...emails, emailReminderTemplate: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1 block">{t('admin.settings.contactAutoReply')}</Label>
                <Textarea rows={6} value={emails.contactAutoReply || ''} onChange={(e)=> setEmails({ ...emails, contactAutoReply: e.target.value })} className="rounded-xl" />
              </div>
              <Button disabled={saving} onClick={save} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl">{saving ? t('admin.saving') : t('admin.settings.saveTemplates')}</Button>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
