'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { View, ThemeMode } from '../types';
import { LogoBlack, LogoWhite } from './Logo';
import api from '../axios';

const MotionDiv = motion.div as any;

interface UserData {
  userName: string;
  email: string;
  inboxMails?: any;
}

interface AuthPageProps {
  onNavigate: (path: string, data?: UserData) => void;
  themeMode: ThemeMode;
  customTextColor?: string;
  customBgColor?: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, themeMode, customTextColor, customBgColor }) => {
  const isLight = themeMode === 'light';
  const isColored = themeMode === 'colored';
  const isDark = themeMode === 'dark';
  const isNormalMode = isLight || isColored;
  var textColor = isColored && customTextColor ? customTextColor : '#2D62ED';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inboxMails, setInboxMails] = useState([]);




  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);

  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Unauthorized')

      else {
        const data = await response.json();
        const userName = data.userName || 'ShooraMail User';
        const email = formData.email.trim().toLowerCase();

        // Persist user session info
        localStorage.setItem('user_email', email);
        localStorage.setItem('password', formData.password);
        localStorage.setItem('userData', JSON.stringify({
          userName,
          email
        }));

        // Redirect user (emails will be fetched on dashboard load)
        onNavigate('/dashboard', {
          userName,
          email
        });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'An error occurred';
      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 404) {
        setError("Account not found.");
      } else if (status === 429) {
        setError("Too many attempts. Please try again later.");
      } else if (status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(msg);
        setError(msg || "Network error. Please check your connection.");
      }

    } finally {
      setIsLoading(false);
    };

  };

  return (
    <div className={`min-h-screen flex items-start justify-center px-6 pt-20 transition-all duration-700 ${
      isLight ? 'bg-white' :
      isDark ? 'bg-[#0B0C0D]' :
      'bg-[#FFFFFF]'
    }`}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full rounded-[40px] shadow-2xl border p-10 flex flex-col gap-8 transition-all duration-700 ${
          isLight ? 'bg-white border-gray-100' :
          isDark ? 'bg-[#131416] border-[#25282B]' :
          'bg-white border-gray-100'
        }`}
      >
        <div className="flex justify-center">
          <div className={`w-12 h-12 p-2 rounded-2xl flex items-center justify-center transition-all duration-700 ${
            isColored ? 'bg-black/10' :
            isLight ? 'bg-black/5' :
            'bg-white/10'
          }`}>
            {isDark ? (
              <LogoWhite className="w-full h-full" />
            ) : (
              <LogoBlack className="w-full h-full" style={{ fill: isColored ? customTextColor : 'black' }} />
            )}
          </div>
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className={`text-3xl font-black tracking-tighter transition-colors duration-700 ${
            isLight ? 'text-black' :
            isDark ? 'text-white' :
            ''
          }`} style={isColored ? { color: customTextColor } : {}}>
            Welcome back.
          </h2>
          <p className={`text-sm font-medium transition-colors duration-700 ${
            isLight ? 'text-gray-500' :
            isDark ? 'text-gray-400' :
            'text-gray-500'
          }`}>
            Enter your credentials to access ShooraMail
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-xl flex items-start gap-3 text-sm transition-colors duration-700 ${
            isLight ? 'bg-red-50 text-red-600' :
            isDark ? 'bg-red-900/20 text-red-400' :
            'bg-red-50 text-red-600'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email address"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-transparent text-sm font-medium transition-all duration-500 outline-none ${isLight ? 'bg-gray-50 focus:border-[#2D62ED] focus:bg-white text-black' : isDark ? 'bg-white/5 focus:border-white focus:bg-white/10 text-white' : 'bg-gray-50 focus:border-[#2D62ED] focus:bg-white text-black'
                }`}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-transparent text-sm font-medium transition-all duration-500 outline-none ${isLight ? 'bg-gray-50 focus:border-[#2D62ED] focus:bg-white text-black' : isDark ? 'bg-white/5 focus:border-white focus:bg-white/10 text-white' : 'bg-gray-50 focus:border-[#2D62ED] focus:bg-white text-black'
                }`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-2 rounded-full font-bold shadow-xl transition-all duration-700 flex items-center justify-center gap-2 transform active:scale-95`}

            style={{
              backgroundColor: isColored ? textColor : isLight ? '#000000' : '#FFFFFF',
              color: isColored ? '#FFFFFF' : isLight ? '#FFFFFF' : '#000000',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Processing...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default AuthPage;
