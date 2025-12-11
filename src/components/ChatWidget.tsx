import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from './LanguageContext';
import { useMobileHistoryState } from '../hooks/useMobileHistoryState';

export function ChatWidget() {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useMobileHistoryState(isOpen, () => setIsOpen(false));
  
  // Load messages from localStorage
  const [messages, setMessages] = useState<{
    id: number;
    text: string;
    sender: 'bot' | 'user';
  }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat_messages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string>('');

  // Initialize Session ID
  useEffect(() => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('chat_session_id', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Initialize Socket.io
  useEffect(() => {
    // Connect to the same origin
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('ChatWidget: Connected to socket server');
      // Join session room
      if (sessionIdRef.current) {
        socketRef.current?.emit('join_session', sessionIdRef.current);
      }
    });

    socketRef.current.on('admin_reply', (data: { text: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: data.text, sender: 'bot' },
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Friendly localized greeting when widget opens (once per open)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: Date.now(), text: t('chat.greeting'), sender: 'bot' },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const text = input.trim();
      setMessages([...messages, { id: Date.now(), text, sender: 'user' }]);
      setInput('');
      
      // Send to server
      socketRef.current?.emit('user_message', { 
        text,
        sessionId: sessionIdRef.current
      });
      
      // Optional: Show auto-reply only if it's the first message?
      // Or maybe just let the admin reply.
      // For now, let's keep the auto-reply but maybe delay it or remove it if we want real human chat.
      // The user asked for "admin replies", so maybe remove the fake auto-reply.
      // But a "We received your message" is good UX.
      
      // Let's remove the fake auto-reply simulation and rely on the server/admin.
      // Or maybe show a "sent" status.
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 ${isRTL ? 'left-6' : 'right-6'} w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden z-50`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-white">{t('chat.title')}</p>
                  <p className="text-white/80">{t('chat.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t('chat.close')}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSend}
                  aria-label={t('chat.send')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-4"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-pink-500/50 transition-shadow`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <MessageCircle className="w-8 h-8 text-white" />
        )}
      </motion.button>
    </>
  );
}
