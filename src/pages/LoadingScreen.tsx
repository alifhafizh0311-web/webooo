import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative flex flex-col items-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter relative">
          Web<span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">ooo</span>
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
          className="h-[2px] bg-white mt-4 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        />
      </motion.div>
    </div>
  );
}
