
import React, { useState } from 'react';
import { ArrowRight, Menu, Lock, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ThemeMode } from '../App';
import { LogoBlack, LogoWhite } from './Logo';

const MotionDiv = motion.div as any;

interface NavbarProps {
  onNavigate: (view: View) => void;
  currentView: View;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  customTextColor?: string;
  customBgColor?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, themeMode, setThemeMode, customTextColor, customBgColor }) => {
  const [clickHistory, setClickHistory] = useState<number[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const isLight = themeMode === 'light';
  const isDark = themeMode === 'dark';
  const isColored = themeMode === 'colored';

  const handleLogoClick = () => {
    const now = Date.now();
    const newHistory = [...clickHistory, now].filter(t => now - t < 5000);
    setClickHistory(newHistory);

    if (newHistory.length >= 5) {
      setShowAuthModal(true);
      setClickHistory([]); // Reset
    } else {
      if (currentView !== 'landing') onNavigate('landing');
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Aniket@2006') {
      onNavigate('admin');
      setShowAuthModal(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
      // Reset error after animation
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-700 ease-in-out ${isLight ? 'bg-white/80 border-gray-100' :
        isDark ? 'bg-[#0B0C0D]/80 border-[#25282B]' :
          'bg-white/80 border-gray-100'
        }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo (Secret trigger) */}
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer group select-none active:scale-95 transition-transform"
            onClick={handleLogoClick}
          >
            {isDark ? (
              <LogoWhite className="w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:-rotate-6" />
            ) : (
              <LogoBlack
                className="w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:-rotate-6"
                style={{ fill: isColored ? customTextColor : 'black' }}
              />
            )}
            <span className={`font-black text-lg md:text-xl tracking-tighter transition-colors duration-700 ${isDark ? 'text-white' :
              isColored ? '' :
                'text-black'
              }`}
              style={isColored ? { color: customTextColor } : {}}
            >ShooraMail</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="hidden sm:flex items-center gap-6 text-[10px] md:text-sm font-black uppercase tracking-widest">
              <button
                onClick={() => onNavigate('pricing')}
                className={`transition-all duration-500 hover:opacity-100 ${currentView === 'pricing' ? 'opacity-100' : 'opacity-40'} ${!isDark ? 'text-black' : 'text-white'}`}
              >
                Pricing
              </button>

            </div>

            <button
              onClick={() => onNavigate('signin')}
              className={`px-5 md:px-7 py-2.5 md:py-3 rounded-full text-[12px] md:text-xs font-black tracking-widest flex items-center gap-2 transition-all duration-700 shadow-xl group ${isDark ? 'bg-white text-black hover:bg-gray-100' :
                isColored ? '' :
                  'bg-black text-white hover:bg-gray-900'
                }`}
              style={isColored ? { backgroundColor: customTextColor, color: 'white' } : {}}
            >
              Continue to LogIn
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="sm:hidden p-1 opacity-40">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: error ? [0, -10, 10, -10, 10, 0] : 0
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                x: { duration: 0.4 }
              }}
              className={`relative w-full max-w-sm p-8 rounded-[32px] border shadow-2xl transition-colors duration-500 ${isDark ? 'bg-[#131416] border-[#25282B] text-white' : 'bg-white border-gray-100 text-black'
                }`}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 opacity-40" />
              </button>

              <div className="flex flex-col items-center gap-6">
                <div className={`p-4 rounded-2xl ${isColored ? 'bg-[#2D62ED]/10 text-[#2D62ED]' : 'bg-black/5 dark:bg-white/5 text-current'}`}>
                  <Lock className="w-8 h-8" />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-black tracking-tight mb-2">Restricted Access</h3>
                  <p className="text-sm font-medium opacity-60">Please enter the administrative password to continue to the command center.</p>
                </div>

                <form onSubmit={handleAdminAuth} className="w-full flex flex-col gap-4">
                  <div className="relative">
                    <input
                      autoFocus
                      type="password"
                      placeholder="Admin Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-5 py-4 rounded-2xl border-2 text-sm font-bold outline-none transition-all duration-300 ${error
                        ? 'border-red-500 bg-red-500/5'
                        : isDark ? 'bg-white/5 border-transparent focus:border-white/20' : 'bg-gray-50 border-transparent focus:border-black/5'
                        }`}
                    />
                  </div>

                  {error && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-500 justify-center"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Access Denied: Invalid Password</span>
                    </MotionDiv>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-xl ${isColored ? 'bg-[#2D62ED] text-white' :
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                      } hover:scale-[1.02] active:scale-95`}
                  >
                    Authenticate
                  </button>
                </form>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
