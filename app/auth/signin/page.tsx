'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import AuthPage from '../../../components/AuthPage'
import FloatingThemeSwitcher from '../../../components/FloatingThemeSwitcher'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../../components/ThemeProvider'

const MotionDiv = motion.div as any

const SignInPage: React.FC = () => {
  const { themeMode, setThemeMode, customTextColor, customBgColor } = useTheme()
  const router = useRouter()

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
      className={`relative min-h-screen transition-all duration-700 ease-in-out ${themeMode === 'light' ? 'bg-white text-black' : themeMode === 'dark' ? 'bg-[#0B0C0D] text-[#ECEEF2]' : ''}`}
      style={themeMode === 'colored' ? { backgroundColor: customBgColor, color: customTextColor } : {}}
    >
      <motion.div
        key="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <Navbar
          onNavigate={handleNavigate}
          currentView="signin"
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          customTextColor={customTextColor}
          customBgColor={customBgColor}
        />
      </motion.div>

      <main className="pt-20 md:pt-32">
        <MotionDiv
          key="signin"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuthPage onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        </MotionDiv>
      </main>

      <FloatingThemeSwitcher
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    </div>
  )
}

export default SignInPage
