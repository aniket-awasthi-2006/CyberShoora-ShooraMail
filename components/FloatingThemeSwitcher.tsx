'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';
import { ThemeMode } from '../types';

const MotionDiv = motion.div as any;

interface FloatingThemeSwitcherProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  onColorPaletteOpen?: () => void;
}

const FloatingThemeSwitcher: React.FC<FloatingThemeSwitcherProps> = ({ 
  themeMode, 
  setThemeMode, 
  onColorPaletteOpen 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getToggleButtonStyles = (btnMode: ThemeMode) => {
    const isActive = themeMode === btnMode
    if (themeMode === 'light') {
      if (isActive) return { background: '#000000', color: '#ffffff' }
      return { background: 'transparent', color: '#000000' }
    } else if (themeMode === 'dark') {
      if (isActive) return { background: '#ffffff', color: '#000000' }
      return { background: 'transparent', color: '#ffffff' }
    } else {
      if (isActive) return { background: '#2D62ED', color: '#ffffff' }
      return { background: 'transparent', color: '#2D62ED' }
    }
  };

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="fixed bottom-6 left-6 z-[60]"
      >
        <div className={`p-1.5 rounded-[24px] border shadow-2xl transition-all duration-700 flex items-center gap-1 backdrop-blur-lg ${
          themeMode === 'light' ? 'bg-white/90 border-gray-200' :
          themeMode === 'dark' ? 'bg-[#1A1B1E]/90 border-[#25282B]' :
            'bg-white/90 border-gray-200'
        }`}>
          {(['light', 'dark', 'colored'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              onDoubleClick={mode === 'colored' && onColorPaletteOpen ? () => onColorPaletteOpen() : undefined}
              onMouseEnter={mode === 'colored' ? () => setShowTooltip(true) : undefined}
              onMouseLeave={mode === 'colored' ? () => setShowTooltip(false) : undefined}
              className={`p-2 md:p-2.5 rounded-full transition-all duration-500 flex items-center justify-center relative group ${
                themeMode === mode ? 'shadow-lg scale-110 opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
              style={getToggleButtonStyles(mode)}
            >
              {mode === 'light' && <Sun className="w-4 h-4 md:w-5 md:h-5" />}
              {mode === 'dark' && <Moon className="w-4 h-4 md:w-5 md:h-5" />}
              {mode === 'colored' && <Palette className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {mode}
              </span>
              {mode === 'colored' && showTooltip && onColorPaletteOpen && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-12 px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded opacity-100 transition-opacity pointer-events-none">
                  double click to customize
                </span>
              )}
            </button>
          ))}
        </div>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default FloatingThemeSwitcher;
