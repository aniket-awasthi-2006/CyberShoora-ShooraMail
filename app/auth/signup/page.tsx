'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import AuthPage from '../../../components/AuthPage'
import { useRouter } from 'next/navigation'

export type ThemeMode = 'light' | 'dark' | 'colored'

const MotionDiv = motion.div as any

const SignUpPage: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [customTextColor, setCustomTextColor] = useState('#0e4c6d')
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF')
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
      bg: `bg-[${customBgColor}]`,
      text: `text-[${customTextColor}]`,
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
    <div className={`relative min-h-screen transition-all duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.text}`}>
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
          currentView="signup"
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          customTextColor={customTextColor}
          customBgColor={customBgColor}
        />
      </motion.div>

      <main className="pt-20 md:pt-32">
        <MotionDiv
          key="signup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuthPage onNavigate={handleNavigate} themeMode={themeMode} customTextColor={customTextColor} customBgColor={customBgColor} />
        </MotionDiv>
      </main>
    </div>
  )
}

export default SignUpPage
