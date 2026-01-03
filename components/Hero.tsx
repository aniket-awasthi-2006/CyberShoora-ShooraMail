import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Folder, Paperclip, FileText, Search, Inbox } from 'lucide-react';
import FloatingIcon from './FloatingIcon';
import { View, ThemeMode } from '../App';

const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;
const MotionButton = motion.button as any;

interface HeroProps {
  onNavigate: (view: View) => void;
  themeMode: ThemeMode;
  customTextColor?: string;
  customBgColor?: string;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, themeMode, customTextColor, customBgColor }) => {
  const isDark = themeMode === 'dark';
  const isColored = themeMode === 'colored';

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-4 md:px-6 overflow-visible max-w-5xl mx-auto py-12 md:py-24">
      {/* Floating Elements - Hidden on small mobile to avoid clutter */}
      <div className="absolute inset-0 pointer-events-none select-none hidden lg:block">
        <FloatingIcon icon={Mail} delay={0} className="top-[-60px] md:top-[-40px] left-[0%] lg:left-[-5%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        <FloatingIcon icon={Inbox} delay={1.2} className="top-[140px] md:top-[160px] left-[-20px] lg:left-[10%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        <FloatingIcon icon={FileText} delay={0.6} className="bottom-[-20px] left-[5%] lg:left-[-8%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        <FloatingIcon icon={Calendar} delay={0.3} className="top-[-50px] md:top-[-30px] right-[0%] lg:right-[-5%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        <FloatingIcon icon={Paperclip} delay={1.5} className="top-[200px] md:top-[220px] right-[-10px] lg:right-[12%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        <FloatingIcon icon={Search} delay={0.9} className="bottom-[-30px] right-[5%] lg:right-[-5%]" themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
      </div>

      <div className="relative z-20">
        <MotionH1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.95] mb-6 md:mb-10 bg-clip-text text-transparent transition-all duration-700 ${isColored ? 'bg-gradient-to-b from-[#2D62ED] to-[#616161]' :
            isDark ? 'bg-gradient-to-b from-white to-gray-400' :
              'bg-gradient-to-b from-black to-gray-700'
            }`}
        >
          Organize your<br />Mails in time.
        </MotionH1>

        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`text-lg md:text-2xl font-medium mb-10 md:mb-16 max-w-xl mx-auto leading-relaxed transition-colors duration-700 ${!isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
        >
          ShooraMail brings every email, attachment, and conversation into a beautiful, chronological workspace.
        </MotionP>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MotionButton
            onClick={() => onNavigate('signup')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold shadow-2xl transition-all duration-700 hover:scale-105 active:scale-95 group ${isDark ? 'bg-white text-black hover:bg-gray-100' :
              isColored ? '' :
                'bg-black text-white hover:bg-gray-800'
              }`}
            style={isColored ? { backgroundColor: customTextColor, color: 'white' } : {}}
          >
            <span className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-pulse"></span>
            Get Started Free
          </MotionButton>
          <MotionButton
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`w-full sm:w-auto font-semibold transition-all duration-700 px-8 py-5 rounded-full border border-transparent hover:border-current ${isColored ? '' :
              !isDark ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'
              }`}
            style={isColored ? { color: customTextColor } : {}}
          >
            How it works
          </MotionButton>
        </div>
      </div>
    </div>
  );
};

export default Hero;