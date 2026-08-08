'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TRICKS, type Trick } from './tricks'
import { scoreOfTrick, type ModeConfig } from './config'
import { trickNames, type Dict, type Lang } from './i18n'

type Props = {
  open: boolean
  mode: ModeConfig
  t: Dict
  lang: Lang
  /** 目前這一格已選的招式 */
  currentId: string | null
  /** 同一份清單中其他格已選的招式（用來標示重複） */
  usedIds: string[]
  slotLabel: string
  onSelect: (trick: Trick) => void
  onClear: () => void
  onClose: () => void
}

const TrickPicker = ({ open, mode, t, lang, currentId, usedIds, slotLabel, onSelect, onClear, onClose }: Props) => {
  const [keyword, setKeyword] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)

  // 每次開啟都回到乾淨的搜尋狀態
  useEffect(() => {
    if (open) {
      setKeyword('')
      setLevelFilter(null)
    }
  }, [open])

  // 開啟時鎖住背景捲動
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  const levels = useMemo(() => {
    const list: number[] = []
    for (let lv = mode.minLevel; lv <= mode.maxLevel; lv++) list.push(lv)
    return list
  }, [mode.minLevel, mode.maxLevel])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return TRICKS.filter(trick => {
      if (trick.level < mode.minLevel || trick.level > mode.maxLevel) return false
      if (levelFilter !== null && trick.level !== levelFilter) return false
      if (!kw) return true
      return (
        trick.en.toLowerCase().includes(kw) ||
        trick.ja.includes(keyword.trim()) ||
        trick.id.toLowerCase().includes(kw)
      )
    })
  }, [keyword, levelFilter, mode.minLevel, mode.maxLevel])

  const grouped = useMemo(() => {
    const map = new Map<number, Trick[]>()
    filtered.forEach(trick => {
      const list = map.get(trick.level) ?? []
      list.push(trick)
      map.set(trick.level, list)
    })
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [filtered])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full sm:max-w-2xl bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white truncate">
                    {t.pickerTitle(slotLabel)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    {t.pickerSubtitle(t.modes[mode.key].label, mode.minLevel, mode.maxLevel)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 size-8 inline-flex justify-center items-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                  aria-label={t.close}
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="mt-3 relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="search"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setLevelFilter(null)}
                  className={`shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${
                    levelFilter === null
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-neutral-600 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {t.filterAll}
                </button>
                {levels.map(lv => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevelFilter(lv)}
                    className={`shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${
                      levelFilter === lv
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-neutral-600 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {t.levelChip(lv)}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3">
              {grouped.length === 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-neutral-400 py-10">{t.noResult}</p>
              )}
              {grouped.map(([level, tricks]) => (
                <div key={level} className="mb-4 last:mb-0">
                  <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur px-1 py-1 text-xs font-semibold text-gray-500 dark:text-neutral-400">
                    {t.levelHeading(level)}
                    <span className="ml-2 font-normal">{t.levelPoints(scoreOfTrick(tricks[0], mode))}</span>
                  </div>
                  <div className="grid gap-1.5">
                    {tricks.map(trick => {
                      const isCurrent = trick.id === currentId
                      // 同一份清單不能重複選招，其他格已選的招式不可再選
                      const isUsed = !isCurrent && usedIds.includes(trick.id)
                      const names = trickNames(trick, lang)
                      return (
                        <button
                          key={trick.id}
                          type="button"
                          onClick={() => onSelect(trick)}
                          disabled={isUsed}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                              : isUsed
                                ? 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/40 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 dark:border-neutral-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 mt-0.5 w-11 text-center py-0.5 text-xs font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-neutral-700 dark:text-neutral-200">
                              {trick.level}-{String(trick.no).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-gray-800 dark:text-white break-words">
                                {names.primary}
                              </span>
                              <span className="block text-xs text-gray-500 dark:text-neutral-400 mt-0.5 break-words">
                                {names.secondary}
                              </span>
                            </span>
                            {isUsed && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                {t.used}
                              </span>
                            )}
                            {isCurrent && <i className="bi bi-check-lg shrink-0 text-blue-500"></i>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-2 py-3 px-4 border-t border-gray-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={onClear}
                disabled={!currentId}
                className="py-2 px-3 text-sm font-medium rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                {t.clearSlot}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 text-sm font-medium rounded-lg bg-gray-800 text-white hover:bg-gray-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TrickPicker
