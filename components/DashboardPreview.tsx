
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeMode } from '../App';

const MotionDiv = motion.div as any;

interface DashboardPreviewProps {
  onOpenApp?: () => void;
  themeMode: ThemeMode;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onOpenApp, themeMode }) => {
  const [index, setIndex] = useState(0);
  const isNormalMode = themeMode === 'light' || themeMode === 'colored';

  /**
   * IMPORTANT: Local asset paths for ShooraMail slides.
   * Assumes files exist at /assets/slide1.png, etc.
   */
  const localImages = [
    "/components/assets/slide1.png",
    "/components/assets/slide2.png",
    "/components/assets/slide3.png"
  ];

  // High-fidelity fallbacks to ensure the UI is never broken
  const fallbackImages = [
    "https://lh3.google.com/u/0/d/17RSWmaiTm--DGvU2zx-II-kf6i2RigBj=w1920-h904-iv2?auditContext=prefetch",
    "https://lh3.google.com/u/0/d/1MwylPt8zAqFvB0ZR7GvAxB6WeCDY5BtM=w1920-h904-iv2?auditContext=prefetch",
    "https://lh3.google.com/u/0/d/1OAhZP9IYQA3cpenA9sZLDW3w8ubxWZEd=w1264-h904-iv2?auditContext=prefetch"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % 3);
    }, 6000); // 6 seconds per slide for a more relaxed pace
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative group cursor-pointer" onClick={onOpenApp}>
      {/* Background Ambient Glow */}
      <div className={`absolute -inset-16 rounded-[100px] blur-[120px] opacity-10 group-hover:opacity-25 transition-all duration-1000 pointer-events-none ${isNormalMode ? 'bg-blue-500' : 'bg-indigo-600'
        }`}></div>

      <MotionDiv
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border transition-all duration-1000 overflow-hidden flex flex-col aspect-[16/10] backdrop-blur-md ${isNormalMode ? 'bg-white/90 border-gray-200/80' : 'bg-[#0B0C0D]/90 border-white/5'
          }`}
      >
        <div className="relative w-full h-full flex-1">
          <AnimatePresence mode="popLayout">
            <MotionDiv
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{
                duration: 2.5, // Ultra-smooth long transition
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full relative">
                {/* Visual Consistency Filter */}
                <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${themeMode === 'dark' ? 'bg-black/20' : 'bg-transparent'
                  }`}></div>

                <img
                  src={localImages[index]}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('google.com')) {
                      console.warn(`Local slide ${index + 1} not found. Defaulting to fallback.`);
                      target.src = fallbackImages[index];
                    }
                  }}
                />
              </div>
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Dynamic Progress Timeline (Bottom) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full overflow-hidden transition-all duration-700 bg-white/10 ${index === i ? 'w-24' : 'w-8'
                }`}
            >
              {index === i && (
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className={`h-full ${isNormalMode ? 'bg-black/60' : 'bg-white/60'}`}
                />
              )}
            </div>
          ))}
        </div>
      </MotionDiv>

      {/* Floating Exploration Hint - Text with Gradient */}
      <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-12 py-5 rounded-full text-[12px] font-black tracking-[0.4em] uppercase shadow-2xl z-30 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-1000 pointer-events-none whitespace-nowrap ${
        // Button background color
        themeMode === 'colored' ? 'bg-[#2D62ED]' :
          themeMode === 'dark' ? 'bg-white' :
            'bg-black'
        } ${
        // Text gradient color
        isNormalMode // Applies to 'light' and 'colored' themes
          ? 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
          : 'bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent' // Applies to 'dark' theme
        }`}>
        Launch Full Experience
      </div>
    </div>
  );
};

export default DashboardPreview;
