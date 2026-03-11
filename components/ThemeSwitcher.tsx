'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

type Theme = 'system' | 'light' | 'dark'

const applyTheme = (theme: Theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

const MENU_W = 144
const MENU_H = 128
const GAP = 4

const ThemeSwitcher = ({ size = 24 }) => {
  const [theme, setTheme] = useState<Theme>('system')
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const svgSize = `${size}px`

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    } else {
      applyTheme('system')
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const calcPosition = useCallback(() => {
    if (!btnRef.current) return null
    const rect = btnRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // vertical: prefer below, flip above if not enough space
    let top: number
    if (rect.bottom + GAP + MENU_H <= vh) {
      top = rect.bottom + GAP + window.scrollY
    } else {
      top = rect.top - GAP - MENU_H + window.scrollY
    }

    // horizontal: prefer align right edge, flip left if overflows
    let left: number
    if (rect.right - MENU_W >= 0) {
      left = rect.right - MENU_W + window.scrollX
    } else {
      left = rect.left + window.scrollX
    }

    // clamp to viewport
    left = Math.max(4, Math.min(left, vw - MENU_W - 4 + window.scrollX))

    return { top, left }
  }, [])

  const handleToggle = useCallback(() => {
    if (!open) {
      setMenuPos(calcPosition())
    }
    setOpen(prev => !prev)
  }, [open, calcPosition])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // close on scroll/resize
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const selectTheme = (t: Theme) => {
    setTheme(t)
    setOpen(false)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  const currentIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      )
    }
    if (theme === 'dark') {
      return (
        <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    }
    return (
      <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" /><path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
      </svg>
    )
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'system',
      label: '系統預設',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      ),
    },
    {
      value: 'light',
      label: '明亮模式',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" /><path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: '暗色模式',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ),
    },
  ]

  const menu = open && menuPos && createPortal(
    <div
      ref={menuRef}
      className="fixed w-36 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg py-1 z-[9999]"
      style={{ top: menuPos.top - window.scrollY, left: menuPos.left - window.scrollX }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => selectTheme(opt.value)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${
            theme === opt.value
              ? 'text-blue-500 font-medium'
              : 'text-gray-700 dark:text-neutral-300'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>,
    document.body
  )

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="inline-flex shrink-0 justify-center items-center font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 p-1"
        aria-label="切換主題"
      >
        {currentIcon()}
      </button>
      {menu}
    </>
  )
}

export default ThemeSwitcher
