import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Rocket, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useStore, storeActions, Testimonial } from '../lib/store';

export default function Dashboard() {
  const { subscribeTestimonials } = storeActions;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeTestimonials(setTestimonials);
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
            Web<span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">ooo</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
            Solusi Website Murah, Cepat, dan Profesional
          </p>
        </motion.div>
      </section>

      {/* Marketing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-zinc-900 border-t border-white/5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6">
            Ingin membuat website tapi bingung mulai dari mana?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-4">
            Mau beli tapi mahal? <span className="text-white font-semibold">Di Webooo saja!</span>
          </motion.p>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-10">
            Mulai dari <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Rp 50.000</span> kamu sudah bisa punya website keren seperti portofolio, landing page, dan lainnya — <span className="text-white font-semibold">GRATIS hosting!</span>
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Pesan Sekarang
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { title: 'Harga Terjangkau', desc: 'Mulai dari 50rb, cocok untuk pemula & UMKM.' },
            { title: 'Proses Cepat', desc: 'Website selesai dalam hitungan hari, bukan minggu.' },
            { title: 'Desain Modern', desc: 'Tampilan kekinian, responsif di semua perangkat.' },
            { title: 'Support Ramah', desc: 'Kami siap membantu kendala teknis Anda.' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/30 transition-colors"
            >
              <CheckCircle2 className="w-10 h-10 text-white mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Apa Kata Mereka?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testi, idx) => (
              <motion.div
                key={testi.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-black border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-white fill-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] mr-1" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testi.text}"</p>
                <div>
                  <h4 className="font-semibold text-white">{testi.name}</h4>
                  <p className="text-sm text-gray-500">{testi.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
          <Rocket className="w-16 h-16 text-white mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">
            Yuk mulai website kamu sekarang 🚀
          </h2>
          <Link
            to="/shop"
            className="relative z-10 inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-black bg-white rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Pilih Paket Website
          </Link>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/10 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Webooo. All rights reserved.</p>
      </footer>
    </div>
  );
}
