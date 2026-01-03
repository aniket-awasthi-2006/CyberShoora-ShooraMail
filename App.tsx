
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import PricingPage from './components/PricingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';

export type View = 'landing' | 'pricing' | 'signin' | 'signup' | 'dashboard' | 'admin';
export type ThemeMode = 'light' | 'dark' | 'colored';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

// Use any cast for motion components to avoid type errors in certain environments
const MotionDiv = motion.div as any;


const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [customTextColor, setCustomTextColor] = useState('#0e4c6d');
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF');
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-black',
      mutedText: 'text-gray-500',
      border: 'border-gray-100'
    },
    dark: {
      bg: 'bg-[#0B0C0D]',
      text: 'text-[#ECEEF2]',
      mutedText: 'text-[#9499A1]',
      border: 'border-[#25282B]'
    },
    colored: {
      bg: `bg-[${customBgColor}]`,
      text: `text-[${customTextColor}]`,
      mutedText: 'text-gray-500',
      border: 'border-gray-100'
    }
  };

  const currentTheme = themeStyles[themeMode];

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setCurrentUser(userData);
        setView('dashboard');
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem('userData');
      }
    }
  }, []);

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.className = 'mesh-bg';
      document.body.style.backgroundColor = '#ffffff';
    } else if (themeMode === 'dark') {
      document.body.className = '';
      document.body.style.backgroundColor = '#0B0C0D';
    } else {
      document.body.className = 'mesh-bg';
      document.body.style.backgroundColor = customBgColor;
    }
  }, [themeMode, customBgColor]);

  const handleNavigate = (v: View, data?: UserData) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (v === 'dashboard' && data) {
      localStorage.setItem('userData', JSON.stringify(data));
      setCurrentUser(data);
      window.history.pushState({}, '', '/Dashboard');
    } else if (v === 'landing') {
      window.history.pushState({}, '', '/');
    }
    setView(v);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setCurrentUser(null);
    handleNavigate('landing');
  };
  const pageTransition: any = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  };

  const getToggleButtonStyles = (btnMode: ThemeMode) => {
    const isActive = themeMode === btnMode;
    if (themeMode === 'light') {
      if (isActive) return { background: '#000000', color: '#ffffff' };
      return { background: 'transparent', color: '#000000' };
    }
    if (themeMode === 'dark') {
      if (isActive) return { background: '#ffffff', color: '#000000' };
      return { background: 'transparent', color: '#ffffff' };
    }
    if (themeMode === 'colored') {
      if (isActive) return { background: customBgColor, color: customTextColor };
      return { background: 'transparent', color: customTextColor };
    }
    return { background: 'transparent', color: 'inherit' };
  };

  const renderContent = () => {
    switch (view) {
      case 'admin':
        return (
          <MotionDiv key="admin" {...pageTransition} className="h-screen w-screen overflow-hidden">
            <AdminPage onNavigate={handleNavigate} themeMode={themeMode} setThemeMode={setThemeMode} />
          </MotionDiv>
        );
      case 'dashboard':
        return currentUser ? (
          <MotionDiv key="dashboard" {...pageTransition} className="h-screen w-screen overflow-hidden">
            <Dashboard
              userData={currentUser}
              onLogout={handleLogout}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              customTextColor={customTextColor}
              customBgColor={customBgColor}
            />
          </MotionDiv>
        ) : null;
      case 'pricing':
        return (
          <MotionDiv key="pricing" {...pageTransition} className="pt-20 md:pt-32">
            <PricingPage onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
          </MotionDiv>
        );
      case 'signin':
        return (
          <MotionDiv key="signin" {...pageTransition} className="pt-20 md:pt-32">
            <AuthPage onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
          </MotionDiv>
        );
      case 'signup':
        return (
          <MotionDiv key="signup" {...pageTransition} className="pt-20 md:pt-32">
            <AuthPage onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
          </MotionDiv>
        );
      default:
        return (
          <MotionDiv key="landing" {...pageTransition} className="pt-20 md:pt-32">
            <div className="pt-6 md:pt-20">
              <Hero onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-48 pb-48 md:pb-96">
              <DashboardPreview onOpenApp={() => handleNavigate('signin')} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
            </div>
          </MotionDiv>
        );
    }
  };

  return (
    <div className={`relative min-h-screen transition-all duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.text}`}>
      <AnimatePresence mode="wait">
        {(view !== 'dashboard' && view !== 'admin') && (
          <MotionDiv
            key="navbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Navbar
              onNavigate={handleNavigate}
              currentView={view}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              customTextColor={customTextColor}
              customBgColor={customBgColor}
            />
          </MotionDiv>
        )}
      </AnimatePresence>

      <main>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {(view !== 'dashboard' && view !== 'admin') && (
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-6 left-6 z-[60]"
          >
            <div className={`p-1.5 rounded-[24px] border shadow-2xl transition-all duration-700 flex items-center gap-1 backdrop-blur-lg ${themeMode === 'light' ? 'bg-white/90 border-gray-200' :
              themeMode === 'dark' ? 'bg-[#1A1B1E]/90 border-[#25282B]' :
                'bg-white/90 border-gray-200'
              }`}>
              {(['light', 'dark', 'colored'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  onDoubleClick={mode === 'colored' ? () => setIsColorPaletteOpen(true) : undefined}
                  onMouseEnter={mode === 'colored' ? () => setShowTooltip(true) : undefined}
                  onMouseLeave={mode === 'colored' ? () => setShowTooltip(false) : undefined}
                  className={`p-2 md:p-2.5 rounded-full transition-all duration-500 flex items-center justify-center relative group ${themeMode === mode ? 'shadow-lg scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  style={getToggleButtonStyles(mode)}
                >
                  {mode === 'light' && <Sun className="w-4 h-4 md:w-5 md:h-5" />}
                  {mode === 'dark' && <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                  {mode === 'colored' && <Palette className="w-4 h-4 md:w-5 md:h-5" />}
                  <span className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {mode}
                  </span>
                  {mode === 'colored' && showTooltip && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-12 px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded opacity-100 transition-opacity pointer-events-none">
                      double click to customize
                    </span>
                  )}
                </button>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isColorPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsColorPaletteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-black">Customize Theme</h3>
                <button onClick={() => setIsColorPaletteOpen(false)} className="text-gray-500 hover:text-black">
                  ✕
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-black mb-3">Text Color</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {['#72bad5', '#0e4c6d', '#03324e', '#ef4043', '#be1e2d', '#c43240', '#ff8c00'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomTextColor(color)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${customTextColor === color ? 'border-black scale-110' : 'border-gray-300 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-black mb-3">Background Color</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {['#84d3e3ff', '#dcedc1', '#b6e2dbff', '#FFFFFF'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomBgColor(color)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${customBgColor === color ? 'border-black scale-110' : 'border-gray-300 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
