'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeMode } from '../types'

interface ThemeContextValue {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  customTextColor: string
  setCustomTextColor: (color: string) => void
  customBgColor: string
  setCustomBgColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [customTextColor, setCustomTextColor] = useState('#0e4c6d')
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF')

  // Hydrate from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('themeMode') as ThemeMode | null
    const storedText = localStorage.getItem('customTextColor')
    const storedBg = localStorage.getItem('customBgColor')
    if (storedTheme) setThemeMode(storedTheme)
    if (storedText) setCustomTextColor(storedText)
    if (storedBg) setCustomBgColor(storedBg)
  }, [])

  // Persist selections
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  useEffect(() => {
    localStorage.setItem('customTextColor', customTextColor)
  }, [customTextColor])

  useEffect(() => {
    localStorage.setItem('customBgColor', customBgColor)
  }, [customBgColor])

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, customTextColor, setCustomTextColor, customBgColor, setCustomBgColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
