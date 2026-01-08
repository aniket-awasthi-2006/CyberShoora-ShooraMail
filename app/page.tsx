'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import DashboardPreview from '../components/DashboardPreview'
import FloatingThemeSwitcher from '../components/FloatingThemeSwitcher'
import { useTheme } from '../components/ThemeProvider'
import { useRouter } from 'next/navigation'

const MotionDiv = motion.div as any

const HomePage: React.FC = () => {
  const { themeMode, setThemeMode, customTextColor, setCustomTextColor, customBgColor, setCustomBgColor } = useTheme()
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false)
  const router = useRouter()

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
      bg: '',
      text: '',
      mutedText: 'text-gray-500',
      border: 'border-gray-100'
    }
  }

  const currentTheme = themeStyles[themeMode]

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.className = 'mesh-bg'
      document.body.style.backgroundColor = '#ffffff'
    } else if (themeMode === 'dark') {
      document.body.className = ''
      document.body.style.backgroundColor = '#0B0C0D'
    } else {
      document.body.className = 'mesh-bg'
      document.body.style.backgroundColor = customBgColor
    }
  }, [themeMode, customBgColor])

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    router.push(path)
  }

  return (
    <div
      className={`relative min-h-screen transition-all duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.text}`}
      style={themeMode === 'colored' ? { backgroundColor: customBgColor, color: customTextColor } : {}}
    >
      <AnimatePresence mode="wait">
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
            currentView="landing"
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            customTextColor={customTextColor}
            customBgColor={customBgColor}
          />
        </MotionDiv>
      </AnimatePresence>

      <main className="pt-20 md:pt-32">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pt-6 md:pt-20">
            <Hero onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-48 pb-48 md:pb-96">
            <DashboardPreview onOpenApp={() => handleNavigate('/auth/signin')} themeMode={themeMode} />
          </div>
        </MotionDiv>
      </main>

      <FloatingThemeSwitcher
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onColorPaletteOpen={() => setIsColorPaletteOpen(true)}
      />

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
  )
}

export default HomePage
