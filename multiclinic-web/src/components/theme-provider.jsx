import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const ThemeProviderContext = createContext(undefined)
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

function getSystemTheme() {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'theme' }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(storageKey) || defaultTheme
  })

  const setTheme = useCallback((nextTheme) => {
    localStorage.setItem(storageKey, nextTheme)
    setThemeState(nextTheme)
  }, [storageKey])

  const applyTheme = useCallback((nextTheme) => {
    const root = document.documentElement
    const resolved = nextTheme === 'system' ? getSystemTheme() : nextTheme
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

