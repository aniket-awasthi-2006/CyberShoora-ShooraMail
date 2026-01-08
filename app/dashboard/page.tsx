'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Dashboard from '../../components/Dashboard'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../components/ThemeProvider'

type DashboardUser = {
  userName: string
  email: string
  inboxMails?: any[]
}

const MotionDiv = motion.div as any

const DashboardPage: React.FC = () => {
  const { themeMode, setThemeMode, customTextColor, customBgColor, setCustomTextColor, setCustomBgColor } = useTheme()
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userDataString = localStorage.getItem('userData')
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString)
        setCurrentUser({
          userName: userData.userName || 'ShooraMail User',
          email: userData.email,
          inboxMails: userData.inboxMails || []
        })
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e)
        localStorage.removeItem('userData')
        router.push('/auth/signin')
      }
    } else {
      router.push('/auth/signin')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userData')
    setCurrentUser(null)
    router.push('/')
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <MotionDiv
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen w-screen overflow-hidden"
    >
      <Dashboard
        userData={currentUser}
        onLogout={handleLogout}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        customTextColor={customTextColor}
        customBgColor={customBgColor}
        setCustomTextColor={setCustomTextColor}
        setCustomBgColor={setCustomBgColor}
      />
    </MotionDiv>
  )
}

export default DashboardPage
