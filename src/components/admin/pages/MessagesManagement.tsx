import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Mail, Phone, Calendar, Trash2, Reply, Archive, Star, StarOff } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { useLanguage } from '../../LanguageContext';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { apiFetch } from '../../../api/client';

type MessageStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
interface MessageItem {
  id: string;
  fromName: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  body: string;
  receivedAt: string;
  status: MessageStatus;
  starred: boolean;
}

export function MessagesManagement() {
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const { t } = useLanguage();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await apiFetch<MessageItem[]>('/messages');
      setMessages(items);
    } catch (e: any) {
  setError(e?.message || t('admin.messages.loadFailed'));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
      switch (status) {
        case 'NEW':
          return 'bg-pink-100 text-pink-700';
        case 'READ':
          return 'bg-gray-100 text-gray-700';
        case 'REPLIED':
          return 'bg-green-100 text-green-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const timeStr = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = (iso: string) => new Date(iso).toLocaleDateString();

  const handleReply = async (m: MessageItem) => {
      // Open reply modal with a prefilled template; user can copy text and then mark as replied
      const firstName = m.fromName?.split(' ')[0] || 'there';
      setReplySubject(`Re: ${m.subject || t('admin.messages.subjectPlaceholder')}`);
      setReplyBody(
        `${t('admin.messages.template.line1')} ${firstName},\n\n` +
        `${t('admin.messages.template.line2')}\n\n` +
        `${t('admin.messages.template.summaryHeading')}\n${m.body}\n\n` +
        `${t('admin.messages.template.line3')}\n\n` +
        `${t('admin.messages.template.signature')}\n${t('admin.messages.template.brand')}`
      );
      setReplyOpen(true);
    };
  const handleDelete = async (m: MessageItem) => {
      if (!confirm(t('admin.messages.deleteConfirm'))) return;
      try { await apiFetch(`/messages/${m.id}`, { method: 'DELETE' }); setMessages(prev => prev.filter(x => x.id !== m.id)); setSelectedMessage(null); toast.success(t('admin.messages.deleteSuccess')); }
      catch (e: any) { toast.error(e?.message || t('admin.messages.deleteFailed')); }
    };
  const handleToggleStar = async (m: MessageItem) => {
      try { const updated = await apiFetch<MessageItem>(`/messages/${m.id}/star`, { method: 'PATCH', body: { starred: !m.starred } }); setMessages(prev => prev.map(x => x.id === m.id ? updated : x)); toast.success(updated.starred ? t('admin.messages.starredToast') : t('admin.messages.unstarredToast')); }
      catch (e: any) { toast.error(e?.message || t('admin.messages.updateFailed')); }
    };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-gray-900">{t('admin.messagesManagement.title')}</h1>
          <p className="text-gray-600">{t('admin.messagesManagement.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[{ label: t('admin.messages.total'), value: messages.length, color: 'from-pink-500 to-rose-600' },
            { label: t('admin.messages.new'), value: messages.filter(m => m.status === 'NEW').length, color: 'from-yellow-500 to-orange-600' },
            { label: t('admin.messages.replied'), value: messages.filter(m => m.status === 'REPLIED').length, color: 'from-green-500 to-emerald-600' },
            { label: t('admin.messages.starred'), value: messages.filter(m => m.starred).length, color: 'from-purple-500 to-violet-600' }].map((stat, index) => (
            <motion.div key={index} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.1 }}>
              <Card className="p-4 border-0 shadow-lg">
                <p className="text-gray-600 mb-2">{stat.label}</p>
                <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Messages Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inbox */}
          <Card className="lg:col-span-1 border-0 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900">{t('admin.messages.inbox')}</h3>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="p-2">
                {messages.map((message, index) => (
                  <motion.button
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full text-left p-4 rounded-xl transition-colors mb-2 ${
                      selectedMessage?.id === message.id
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {getInitials(message.fromName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`truncate ${message.status === 'NEW' ? 'text-gray-900' : 'text-gray-600'}`}>
                            {message.fromName}
                          </p>
                          {message.starred && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                        </div>
                        <p className="text-gray-900 truncate mb-1">{message.subject || t('common.emDash')}</p>
                        <p className="text-gray-600 truncate">{message.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                          <span className="text-gray-500">{timeStr(message.receivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Message Details */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            {selectedMessage ? (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                          {getInitials(selectedMessage.fromName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-gray-900 mb-1">{selectedMessage.fromName}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{selectedMessage.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{selectedMessage.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleToggleStar(selectedMessage)}>
                        {selectedMessage.starred ? (
                          <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full text-red-600" onClick={() => handleDelete(selectedMessage)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{dateStr(selectedMessage.receivedAt)} at {timeStr(selectedMessage.receivedAt)}</span>
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {selectedMessage.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="mb-4 text-gray-900">{selectedMessage.subject || t('common.emDash')}</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedMessage.body}</p>
                  <Separator className="my-6" />
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl" onClick={() => handleReply(selectedMessage)}>
                      <Reply className="w-4 h-4 mr-2" />
                      {t('admin.messages.replyButton')}
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <Archive className="w-4 h-4 mr-2" />
                      {t('admin.messages.archiveButton')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[700px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>{t('admin.messages.selectPrompt')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
        
      {/* Reply Modal */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.messages.replyTo')} {selectedMessage?.fromName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t('admin.messages.subjectLabel')}
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              className="rounded-xl"
            />
            <Textarea
              rows={10}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-sm text-gray-500">
              {t('admin.messages.templateNote')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`Subject: ${replySubject}\n\n${replyBody}`);
                  toast.success(t('admin.messages.copied'));
                } catch {
                  toast.error(t('admin.messages.copyFailed'));
                }
              }}
              className="rounded-xl"
            >
              {t('admin.messages.copyToClipboardButton')}
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              onClick={async () => {
                if (!selectedMessage) return;
                try {
                  const updated = await apiFetch<MessageItem>(`/messages/${selectedMessage.id}`, {
                    method: 'PUT',
                    body: { status: 'REPLIED' },
                  });
                  setMessages(prev => prev.map(x => x.id === updated.id ? updated : x));
                  setReplyOpen(false);
                  toast.success(t('admin.messages.markedReplied'));
                } catch (e: any) {
                  toast.error(e?.message || t('admin.messages.updateFailed'));
                }
              }}
            >
              {t('admin.messages.markRepliedButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
