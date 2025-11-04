import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Mail, Phone, Calendar, Trash2, Reply, Archive, Star, StarOff } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner@2.0.3';

export function MessagesManagement() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const messages = [
    {
      id: 'M001',
      from: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      subject: 'Inquiry about Hair Implant pricing',
      message: 'Hi, I would like to know more about the pricing for hair implant procedures. I am interested in the FUE method. Can you provide detailed information?',
      date: '2025-11-04',
      time: '10:30 AM',
      status: 'unread',
      starred: false,
    },
    {
      id: 'M002',
      from: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+1 (555) 234-5678',
      subject: 'Follow-up after consultation',
      message: 'Thank you for the consultation yesterday. I have a few more questions about the recovery process for eyebrow implants.',
      date: '2025-11-03',
      time: '02:15 PM',
      status: 'read',
      starred: true,
    },
    {
      id: 'M003',
      from: 'Lisa Martinez',
      email: 'lisa@example.com',
      phone: '+1 (555) 345-6789',
      subject: 'Reschedule appointment',
      message: 'I need to reschedule my PRP treatment appointment scheduled for next week. Are there any available slots the following week?',
      date: '2025-11-03',
      time: '11:45 AM',
      status: 'replied',
      starred: false,
    },
    {
      id: 'M004',
      from: 'Maria Garcia',
      email: 'maria@example.com',
      phone: '+1 (555) 456-7890',
      subject: 'Question about eyelash implants',
      message: 'I saw the eyelash implant service on your website. How long do the results typically last? What is the maintenance required?',
      date: '2025-11-02',
      time: '04:20 PM',
      status: 'unread',
      starred: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-pink-100 text-pink-700';
      case 'read':
        return 'bg-gray-100 text-gray-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleReply = (id: string) => {
    toast.success('Reply sent successfully');
  };

  const handleDelete = (id: string) => {
    toast.error('Message deleted');
    setSelectedMessage(null);
  };

  const handleToggleStar = (id: string) => {
    toast.success('Message starred');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-gray-900">Messages & Inquiries</h1>
        <p className="text-gray-600">Manage all customer messages and contact requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: messages.length, color: 'from-pink-500 to-rose-600' },
          { label: 'Unread', value: messages.filter((m) => m.status === 'unread').length, color: 'from-yellow-500 to-orange-600' },
          { label: 'Replied', value: messages.filter((m) => m.status === 'replied').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Starred', value: messages.filter((m) => m.starred).length, color: 'from-purple-500 to-violet-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-0 shadow-lg">
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Messages Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="lg:col-span-1 border-0 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-gray-900">Inbox</h3>
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
                        {getInitials(message.from)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`truncate ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                          {message.from}
                        </p>
                        {message.starred && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                      </div>
                      <p className="text-gray-900 truncate mb-1">{message.subject}</p>
                      <p className="text-gray-600 truncate">{message.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                        <span className="text-gray-500">{message.time}</span>
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
                        {getInitials(selectedMessage.from)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-gray-900 mb-1">{selectedMessage.from}</h3>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleToggleStar(selectedMessage.id)}
                    >
                      {selectedMessage.starred ? (
                        <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-red-600"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedMessage.date} at {selectedMessage.time}</span>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                <h2 className="mb-4 text-gray-900">{selectedMessage.subject}</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedMessage.message}
                </p>
                <Separator className="my-6" />
                <div className="flex gap-3">
                  <Button
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                    onClick={() => handleReply(selectedMessage.id)}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[700px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
