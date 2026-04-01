import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore, ChatSession, Package } from '../lib/store';

export default function History() {
  const { getUser, subscribeUserChats, subscribePackages, sendMessage } = useStore();
  const navigate = useNavigate();
  const userEmail = getUser();
  
  const [userChats, setUserChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const unsubChats = subscribeUserChats(userEmail, (filtered) => {
      setUserChats(filtered);
      
      // Update active chat if it's open
      if (activeChat) {
        const updatedActive = filtered.find(c => c.id === activeChat.id);
        if (updatedActive) setActiveChat(updatedActive);
      }
    });

    const unsubPkgs = subscribePackages((pkgs) => {
      setPackages(pkgs);
    });

    return () => {
      unsubChats();
      unsubPkgs();
    };
  }, [userEmail, navigate, activeChat?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !activeChat || !userEmail) return;

    try {
      await sendMessage(activeChat.id, {
        sender: 'user',
        text: message,
        timestamp: Date.now()
      });
      setMessage('');
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    }
  };

  const getPackageName = (pkgId: string) => {
    return packages.find(p => p.id === pkgId)?.name || pkgId;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Riwayat Pesanan & Chat</h1>
          <p className="text-gray-400">Lanjutkan percakapan dengan admin Webooo.</p>
        </div>

        {userChats.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
            <p className="text-gray-400 mb-4">Belum ada riwayat pesanan.</p>
            <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
              Lihat Paket Website
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userChats.map(chat => (
              <motion.div 
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-white/30 transition-colors"
                onClick={() => setActiveChat(chat)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Paket {getPackageName(chat.packageId)}</h3>
                    <p className="text-sm text-gray-400">
                      {chat.messages.length} pesan
                    </p>
                  </div>
                  <MessageCircle className="w-6 h-6 text-white/50" />
                </div>
                <div className="bg-black p-3 rounded-lg text-sm text-gray-300 truncate">
                  {chat.messages[chat.messages.length - 1]?.text || 'Belum ada pesan'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col h-[80vh]"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-white" />
                <h3 className="font-semibold">Paket {getPackageName(activeChat.packageId)}</h3>
              </div>
              <button onClick={() => setActiveChat(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-white text-black rounded-tr-sm'
                          : 'bg-zinc-800 text-white rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-[10px] opacity-50 mt-1 block text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2 pt-4 border-t border-white/10 mt-auto">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-black border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-white/30 text-sm"
                  placeholder="Ketik pesan..."
                />
                <button
                  type="submit"
                  className="p-2 bg-white text-black rounded-full hover:bg-gray-200"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
