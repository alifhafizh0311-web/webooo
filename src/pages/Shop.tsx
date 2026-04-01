import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, MessageCircle, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore, storeActions, Package, Promo, ChatSession, ChatMessage, DEFAULT_PACKAGES } from '../lib/store';

export default function Shop() {
  const { userEmail } = useStore();
  const { 
    subscribePackages, 
    subscribePromos, 
    subscribeUserChats, 
    subscribePublicChats,
    createChat, 
    sendMessage: sendChatMessage, 
    sendPublicMessage,
    seedPackages,
  } = storeActions;
  
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [userChats, setUserChats] = useState<ChatSession[]>([]);
  const [publicChats, setPublicChats] = useState<ChatMessage[]>([]);
  
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState('');
  
  // Chat state
  const [message, setMessage] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    const unsubPackages = subscribePackages((data) => {
      if (data.length > 0) {
        setPackages(data);
      } else {
        setPackages(DEFAULT_PACKAGES);
      }
    });
    const unsubPromos = subscribePromos(setPromos);
    const unsubPublic = subscribePublicChats(setPublicChats);
    
    let unsubChats = () => {};
    if (userEmail) {
      unsubChats = subscribeUserChats(userEmail, setUserChats);
    }

    return () => {
      unsubPackages();
      unsubPromos();
      unsubPublic();
      unsubChats();
    };
  }, [userEmail]);

  // Update current chat session when userChats changes
  useEffect(() => {
    if (chatSession && userChats.length > 0) {
      const updated = userChats.find(c => c.id === chatSession.id);
      if (updated) setChatSession(updated);
    }
  }, [userChats]);

  const handleBuy = (pkg: Package) => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    setSelectedPackage(pkg);
    setIsChatOpen(true);
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
    
    // Check if there's already an open chat for this package
    const existing = userChats.find(c => c.packageId === pkg.id && c.status === 'open');
    if (existing) {
      setChatSession(existing);
    } else {
      setChatSession(null);
    }
  };

  const applyPromo = () => {
    const found = promos.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Kode promo tidak valid');
    }
  };

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !message || !selectedPackage) return;

    const chatId = await createChat(userEmail, selectedPackage.id);
    await sendChatMessage(chatId, {
      sender: 'user',
      senderEmail: userEmail,
      text: message,
      timestamp: Date.now(),
    });
    
    setMessage('');
    console.log(`[TELEGRAM BOT] New message from ${userEmail} for package ${selectedPackage.name}`);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !chatSession || !userEmail) return;

    await sendChatMessage(chatSession.id, {
      sender: 'user',
      senderEmail: userEmail,
      text: message,
      timestamp: Date.now(),
    });
    
    setMessage('');
  };

  const handleSendPublic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicMessage || !userEmail) {
      if (!userEmail) navigate('/login');
      return;
    }

    await sendPublicMessage({
      sender: userEmail.split('@')[0],
      senderEmail: userEmail,
      text: publicMessage,
      timestamp: Date.now()
    });
    setPublicMessage('');
  };

  const calculatePrice = (price: number) => {
    if (!appliedPromo) return price;
    return price - (price * (appliedPromo.discountPercent / 100));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Pilih Paket Website
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-8"
          >
            Harga transparan, tanpa biaya tersembunyi.
          </motion.p>
          {packages.length === 0 && (
            <button 
              onClick={() => seedPackages()}
              className="px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              Klik jika paket kosong
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-8 rounded-3xl border relative flex flex-col ${
                pkg.id === 'standard' 
                  ? 'bg-zinc-900 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                  : 'bg-black border-white/10 hover:border-white/20'
              }`}
            >
              {pkg.id === 'standard' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-white text-black text-xs font-bold rounded-full uppercase tracking-wider">
                  Paling Laris
                </div>
              )}
              
              <h3 className="text-2xl font-semibold mb-2">{pkg.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rp {pkg.price.toLocaleString('id-ID')}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-white mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleBuy(pkg)}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  pkg.id === 'standard'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                Beli {pkg.name}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Public Chat Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-white/10 bg-black/50 flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 mr-3 text-white" />
              <h2 className="text-xl font-bold">Public Support Chat</h2>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Real-time</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {publicChats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic">
                Belum ada pesan. Jadilah yang pertama!
              </div>
            ) : (
              publicChats.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.senderEmail === userEmail ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.senderEmail === userEmail 
                      ? 'bg-white text-black rounded-tr-sm' 
                      : 'bg-zinc-800 text-white rounded-tl-sm'
                  }`}>
                    <div className="flex justify-between items-baseline mb-1 space-x-4">
                      <span className="text-[10px] font-bold uppercase opacity-70">{msg.sender}</span>
                      <span className="text-[9px] opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendPublic} className="p-4 bg-black/50 border-t border-white/10 flex space-x-3">
            <input
              type="text"
              value={publicMessage}
              onChange={(e) => setPublicMessage(e.target.value)}
              placeholder={userEmail ? "Ketik pesan publik..." : "Login untuk chat"}
              className="flex-1 bg-zinc-800 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-white/30 text-sm"
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
            >
              Kirim
            </button>
          </form>
        </div>
      </section>

      {/* Floating Chat Button */}
      {!isChatOpen && userEmail && (
        <motion.button
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            if (userChats.length > 0) {
              setChatSession(userChats[0]);
              setSelectedPackage(packages.find(p => p.id === userChats[0].packageId) || packages[0]);
              setIsChatOpen(true);
            } else {
              // If no chat, open with first package
              if (packages.length > 0) {
                setSelectedPackage(packages[0]);
                setIsChatOpen(true);
              }
            }
          }}
          className="fixed bottom-8 right-8 z-40 bg-white text-black p-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-all"
        >
          <MessageCircle className="w-8 h-8" />
          {userChats.some(c => c.status === 'open') && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
          )}
        </motion.button>
      )}

      {/* Chat Modal */}
      {isChatOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-white" />
                <h3 className="font-semibold">Chat Admin Webooo</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              {!chatSession ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Paket Pilihan:</p>
                    <p className="font-semibold">{selectedPackage.name}</p>
                    
                    {/* Promo System */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Kode Promo"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                        />
                        <button 
                          onClick={applyPromo}
                          className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
                      {appliedPromo && (
                        <p className="text-green-400 text-xs mt-2">
                          Promo {appliedPromo.discountPercent}% berhasil digunakan!
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-400">Total:</span>
                      <span className="font-bold text-lg">
                        Rp {calculatePrice(selectedPackage.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={startChat} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Pesan</label>
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 min-h-[100px]"
                        placeholder="Halo, saya mau pesan paket ini..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Mulai Chat
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                    {chatSession.messages.map((msg) => (
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
                  <form onSubmit={sendMessage} className="flex space-x-2 pt-2 border-t border-white/10">
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
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
