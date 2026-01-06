'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminPage from '../../components/AdminPage'
import { useRouter } from 'next/navigation'

export type ThemeMode = 'light' | 'dark' | 'colored'

const MotionDiv = motion.div as any

const AdminRoute: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const router = useRouter()

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    router.push(path)
  }

  return (
    <MotionDiv
      key="admin"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen w-screen overflow-hidden"
    >
      <AdminPage onNavigate={handleNavigate} themeMode={themeMode} setThemeMode={setThemeMode} />
    </MotionDiv>
  )
}

export default AdminRoute
