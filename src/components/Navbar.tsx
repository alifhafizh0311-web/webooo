import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useStore } from '../lib/store';

export default function Navbar() {
  const { userEmail, setUser } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    navigate('/dashboard');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-white tracking-tighter">
              Web<span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">ooo</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Shop
            </Link>
            {userEmail ? (
              <>
                <Link to="/history" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  History
                </Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-white text-black hover:bg-gray-200 transition-colors px-4 py-2 rounded-full text-sm font-bold ml-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
