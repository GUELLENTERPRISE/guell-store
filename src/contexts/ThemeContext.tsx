import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getScheduledTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 7 ? 'dark' : 'light'
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('guell-theme') as Theme | null
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      setThemeState(saved)
    }
  }, [])

  useEffect(() => {
    let resolved: boolean
    if (theme === 'auto') {
      resolved = getScheduledTheme() === 'dark'
    } else {
      resolved = theme === 'dark'
    }
    setIsDark(resolved)
    applyTheme(resolved)
    localStorage.setItem('guell-theme', theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'auto') return
    const interval = setInterval(() => {
      const resolved = getScheduledTheme() === 'dark'
      setIsDark(resolved)
      applyTheme(resolved)
    }, 60000)
    return () => clearInterval(interval)
  }, [theme])

  const setTheme = (newTheme: Theme) => setThemeState(newTheme)

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'auto'
      return 'light'
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
