'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TrickPicker from '@/components/kwc2026/TrickPicker'
import PracticeOverlay from '@/components/kwc2026/PracticeOverlay'
import { LEVEL_VIDEOS, PRACTICE_VIDEO, getTrick, type Trick } from '@/components/kwc2026/tricks'
import { useLongPressReorder } from '@/components/kwc2026/useLongPressReorder'
import { LANGS, trickNames, useKwcLang } from '@/components/kwc2026/i18n'
import {
  FINAL_MAX_SLOTS,
  MODES,
  MODE_ORDER,
  emptySelections,
  exportToJson,
  getRounds,
  loadMode,
  loadSelections,
  maxScore,
  parseImport,
  saveMode,
  saveSelections,
  totalScore,
  type ImportWarning,
  type ModeKey,
  type Selections,
} from '@/components/kwc2026/config'

const KWC2026 = () => {
  const { lang, setLang, t } = useKwcLang()
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState<ModeKey>('prelimNormal')
  const [selections, setSelections] = useState<Selections>(emptySelections)

  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const [practiceRound, setPracticeRound] = useState<number | null>(null)
  const [showIO, setShowIO] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [openLevelVideo, setOpenLevelVideo] = useState<number | null>(null)

  const [ioText, setIoText] = useState('')
  // 訊息只存語意，實際文字在畫面上依當下語言組裝，切換語言時也會跟著變
  const [ioMessage, setIoMessage] = useState<
    | { type: 'ok' | 'error'; key: 'exported' | 'copied' | 'copyFailed' | 'imported' | 'badJson' }
    | { type: 'error'; key: 'importedWithWarnings'; warnings: ImportWarning[] }
    | null
  >(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modeConfig = MODES[mode]
  const slots = selections[mode]

  // 讀取本機紀錄
  useEffect(() => {
    setSelections(loadSelections())
    setMode(loadMode())
    setLoaded(true)
  }, [])

  // 寫回本機
  useEffect(() => {
    if (!loaded) return
    saveSelections(selections)
  }, [selections, loaded])

  useEffect(() => {
    if (!loaded) return
    saveMode(mode)
  }, [mode, loaded])

  const setSlot = useCallback(
    (index: number, trickId: string | null) => {
      setSelections(prev => ({
        ...prev,
        [mode]: prev[mode].map((id, i) => (i === index ? trickId : id)),
      }))
    },
    [mode]
  )

  const addSlot = () => {
    setSelections(prev => {
      if (prev[mode].length >= FINAL_MAX_SLOTS) return prev
      return { ...prev, [mode]: [...prev[mode], null] }
    })
  }

  const removeSlot = (index: number) => {
    setSelections(prev => {
      if (prev[mode].length <= 1) return prev
      return { ...prev, [mode]: prev[mode].filter((_, i) => i !== index) }
    })
  }

  /** 把 from 位置的招式搬到 to 位置（海選可跨回合搬移） */
  const moveSlotTo = useCallback(
    (from: number, to: number) => {
      setSelections(prev => {
        const list = [...prev[mode]]
        if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return prev
        const [item] = list.splice(from, 1)
        list.splice(to, 0, item)
        return { ...prev, [mode]: list }
      })
    },
    [mode]
  )

  const drag = useLongPressReorder(moveSlotTo)

  const resetMode = () => {
    if (!window.confirm(t.clearConfirm(t.modes[mode].label))) return
    setSelections(prev => ({ ...prev, [mode]: emptySelections()[mode] }))
  }

  const rounds = useMemo(() => getRounds(modeConfig, slots.length), [modeConfig, slots.length])
  const filledCount = slots.filter(Boolean).length
  const score = totalScore(slots, modeConfig)
  // 決賽招數不限，理論最高分沒有意義，只在固定招數的海選顯示
  const showTheoreticalMax = modeConfig.fixedSlots !== null
  const theoreticalMax = maxScore(modeConfig, slots.length)

  const usedIds = useMemo(() => slots.filter((id): id is string => Boolean(id)), [slots])

  // ------------------------------------------------------ 匯入 / 匯出

  const openIO = () => {
    setIoText(exportToJson(selections, new Date().toISOString()))
    setIoMessage(null)
    setShowIO(true)
  }

  const handleDownload = () => {
    const json = exportToJson(selections, new Date().toISOString())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `kwc2026-tricks-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
    setIoMessage({ type: 'ok', key: 'exported' })
  }

  const handleCopy = async () => {
    const json = exportToJson(selections, new Date().toISOString())
    try {
      await navigator.clipboard.writeText(json)
      setIoMessage({ type: 'ok', key: 'copied' })
    } catch {
      setIoMessage({ type: 'error', key: 'copyFailed' })
    }
  }

  const applyImport = (text: string) => {
    try {
      const { selections: imported, warnings } = parseImport(text)
      setSelections(imported)
      setIoMessage(
        warnings.length
          ? { type: 'error', key: 'importedWithWarnings', warnings }
          : { type: 'ok', key: 'imported' }
      )
    } catch {
      setIoMessage({ type: 'error', key: 'badJson' })
    }
  }

  const ioMessageText = useMemo(() => {
    if (!ioMessage) return ''
    switch (ioMessage.key) {
      case 'exported':
        return t.ioExported
      case 'copied':
        return t.ioCopied
      case 'copyFailed':
        return t.ioCopyFailed
      case 'imported':
        return t.ioImported
      case 'badJson':
        return t.ioBadJson
      case 'importedWithWarnings':
        return t.ioImportedWithWarnings(ioMessage.warnings.length)
    }
  }, [ioMessage, t])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setIoText(text)
      applyImport(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ------------------------------------------------------ 練習

  // 練習視窗內可切換的回合（決賽只有一個，切換器會自動隱藏）
  const practiceRounds = useMemo(
    () =>
      rounds.map(round => ({
        index: round.index,
        label: t.modes[mode].rounds[round.index] ?? '',
        count: slots.slice(round.start, round.end).filter(Boolean).length,
      })),
    [rounds, slots, t, mode]
  )

  const practiceTricks: Trick[] = useMemo(() => {
    if (practiceRound === null) return []
    const round = rounds[practiceRound]
    if (!round) return []
    return slots
      .slice(round.start, round.end)
      .map(id => getTrick(id))
      .filter((t): t is Trick => Boolean(t))
  }, [practiceRound, rounds, slots])

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 pb-16 sm:px-6">
        {/* 語言切換 */}
        <div className="flex justify-end mb-2">
          <div
            role="group"
            aria-label={t.langLabel}
            className="inline-flex rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5"
          >
            {LANGS.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setLang(item.key)}
                aria-pressed={lang === item.key}
                title={item.label}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  lang === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-blue-500'
                }`}
              >
                {item.short}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">{t.subtitle}</p>
        </motion.div>

        {/* 模式切換 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MODE_ORDER.map(key => {
            const active = key === mode
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-800 hover:border-blue-400'
                }`}
              >
                {t.modes[key].label}
              </button>
            )
          })}
        </div>

        {/* 規則說明 */}
        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <p className="text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
            <i className="bi bi-info-circle mr-1"></i>
            {t.modes[mode].description}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-neutral-500">
            <i className="bi bi-hand-index mr-1"></i>
            {t.dragHint}
            {modeConfig.roundSize !== null && t.dragHintCrossRound}
          </p>
        </div>

        {/* 分數面板 */}
        <div className={`grid gap-2 mb-5 ${showTheoreticalMax ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 py-3 text-center">
            <p className="text-[11px] text-blue-600 dark:text-blue-300">{t.statTotal}</p>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{score}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 text-center">
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">{t.statPicked}</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
              {filledCount}
              <span className="text-sm font-medium text-gray-400">/{slots.length}</span>
            </p>
          </div>
          {showTheoreticalMax && (
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 text-center">
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">{t.statMax}</p>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{theoreticalMax}</p>
            </div>
          )}
        </div>

        {/* 回合 / 招式清單 */}
        {rounds.map(round => {
          const roundSlots = slots.slice(round.start, round.end)
          const roundScore = totalScore(roundSlots, modeConfig)
          const roundFilled = roundSlots.filter(Boolean).length
          return (
            <div
              key={round.index}
              className="mb-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-800 dark:text-white">
                    {t.modes[mode].rounds[round.index]}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {t.roundSummary(
                      roundFilled,
                      roundSlots.length,
                      roundScore,
                      Math.round(modeConfig.roundSeconds / 60)
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPracticeRound(round.index)}
                  disabled={roundFilled === 0}
                  className="shrink-0 py-2 px-3 text-sm font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <i className="bi bi-play-fill mr-1"></i>
                  {t.practice}
                </button>
              </div>

              <div className="p-3 grid gap-2">
                {roundSlots.map((id, i) => {
                  const index = round.start + i
                  const trick = getTrick(id)
                  const names = trick ? trickNames(trick, lang) : null
                  const dragging = drag.dragIndex === index
                  // 放開手指後會插入的位置：往上搬顯示在該列上方，往下搬顯示在下方
                  const isTarget = drag.dragIndex !== null && drag.targetIndex === index && !dragging
                  const lineAbove = isTarget && drag.targetIndex! < drag.dragIndex!
                  const lineBelow = isTarget && drag.targetIndex! > drag.dragIndex!
                  return (
                    <div
                      key={index}
                      ref={drag.registerItem(index)}
                      onPointerDown={drag.onPointerDown(index)}
                      style={{
                        touchAction: drag.dragIndex !== null ? 'none' : undefined,
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                      }}
                      className={`relative select-none rounded-xl border transition-all ${
                        trick
                          ? 'border-gray-200 dark:border-neutral-800'
                          : 'border-dashed border-gray-300 dark:border-neutral-700'
                      } ${
                        dragging
                          ? 'z-10 scale-[1.02] border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : ''
                      } ${drag.dragIndex !== null && !dragging && !isTarget ? 'opacity-50' : ''}`}
                    >
                      {/* 插入位置指示線（絕對定位，不影響版面高度） */}
                      {(lineAbove || lineBelow) && (
                        <span
                          className={`pointer-events-none absolute inset-x-1 h-1 rounded-full bg-blue-500 ${
                            lineAbove ? '-top-1.5' : '-bottom-1.5'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex items-stretch">
                        <span
                          className={`shrink-0 pl-2 flex items-center ${
                            dragging ? 'text-blue-500' : 'text-gray-300 dark:text-neutral-600'
                          }`}
                          aria-hidden="true"
                        >
                          <i className="bi bi-grip-vertical"></i>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (drag.consumeDrag()) return
                            setPickerSlot(index)
                          }}
                          className="flex-1 min-w-0 text-left py-3 pl-2 pr-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                        >
                          <span className="shrink-0 size-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 inline-flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          {trick && names ? (
                            <>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-gray-800 dark:text-white break-words">
                                  {names.primary}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-neutral-400 break-words">
                                  {names.secondary}
                                </span>
                              </span>
                              <span className="shrink-0 text-base font-bold text-blue-600 dark:text-blue-400">
                                {trick.level}-{trick.no}
                              </span>
                            </>
                          ) : (
                            <span className="flex-1 text-sm text-gray-400 dark:text-neutral-500">
                              {t.emptySlot}
                            </span>
                          )}
                        </button>

                        {modeConfig.fixedSlots === null && (
                          <div className="shrink-0 flex flex-col justify-center gap-0.5 pr-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (drag.consumeDrag()) return
                                removeSlot(index)
                              }}
                              disabled={slots.length <= 1}
                              className="size-6 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none"
                              aria-label={t.deleteSlot}
                            >
                              <i className="bi bi-trash text-xs"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {modeConfig.fixedSlots === null && (
                  <button
                    type="button"
                    onClick={addSlot}
                    disabled={slots.length >= FINAL_MAX_SLOTS}
                    className="py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 text-sm text-gray-500 dark:text-neutral-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <i className="bi bi-plus-lg mr-1"></i>
                    {t.addSlot}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* 工具列 */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={openIO}
            className="py-2.5 px-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
          >
            <i className="bi bi-box-arrow-in-down mr-1"></i>
            {t.ioButton}
          </button>
          <button
            type="button"
            onClick={resetMode}
            className="py-2.5 px-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:border-red-400 hover:text-red-500"
          >
            <i className="bi bi-eraser mr-1"></i>
            {t.clearMode}
          </button>
        </div>

        {/* 計時練習影片 */}
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowVideo(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/60"
          >
            <span className="min-w-0">
              <span className="block font-bold text-gray-800 dark:text-white">
                <i className="bi bi-youtube text-red-500 mr-1"></i>
                {t.timerVideo}
              </span>
              <span className="block text-xs text-gray-500 dark:text-neutral-400">
                {t.videoCredit(PRACTICE_VIDEO.credit)}
              </span>
            </span>
            <i className={`bi bi-chevron-down transition-transform ${showVideo ? 'rotate-180' : ''}`}></i>
          </button>
          <AnimatePresence>
            {showVideo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${PRACTICE_VIDEO.youtubeId}?rel=0`}
                    title={`KWC 2026 — ${t.timerVideo}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="px-4 py-2 text-xs text-gray-500 dark:text-neutral-400">
                  {t.videoCreditLong(PRACTICE_VIDEO.credit)}
                  <a
                    href={PRACTICE_VIDEO.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    {t.openOnYoutube}
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 各 Level 招式範例影片 */}
        <div className="mt-5">
          <h2 className="mb-2 px-1 text-sm font-bold text-gray-700 dark:text-neutral-300">
            <i className="bi bi-collection-play text-red-500 mr-1"></i>
            {t.levelVideos}
          </h2>
          <div className="grid gap-2">
            {LEVEL_VIDEOS.map(video => {
              const open = openLevelVideo === video.level
              return (
                <div
                  key={video.level}
                  className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenLevelVideo(prev => (prev === video.level ? null : video.level))}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold text-gray-800 dark:text-white">
                        <i className="bi bi-youtube text-red-500 mr-1"></i>
                        {t.levelVideoTitle(video.level)}
                      </span>
                    </span>
                    <i className={`bi bi-chevron-down transition-transform ${open ? 'rotate-180' : ''}`}></i>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="aspect-video bg-black">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                            title={`KWC 2026 — ${t.levelVideoTitle(video.level)}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <p className="px-4 py-2 text-xs text-gray-500 dark:text-neutral-400">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t.openOnYoutube}
                          </a>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-neutral-600">{t.storageNote}</p>
      </div>

      {/* 選招視窗 */}
      <TrickPicker
        open={pickerSlot !== null}
        mode={modeConfig}
        t={t}
        lang={lang}
        currentId={pickerSlot !== null ? slots[pickerSlot] ?? null : null}
        usedIds={usedIds}
        slotLabel={pickerSlot !== null ? t.slotLabel(pickerSlot + 1) : ''}
        onSelect={trick => {
          if (pickerSlot === null) return
          setSlot(pickerSlot, trick.id)
          setPickerSlot(null)
        }}
        onClear={() => {
          if (pickerSlot === null) return
          setSlot(pickerSlot, null)
          setPickerSlot(null)
        }}
        onClose={() => setPickerSlot(null)}
      />

      {/* 練習模式 */}
      <PracticeOverlay
        open={practiceRound !== null}
        mode={modeConfig}
        t={t}
        lang={lang}
        rounds={practiceRounds}
        roundIndex={practiceRound ?? 0}
        onRoundChange={setPracticeRound}
        tricks={practiceTricks}
        onClose={() => setPracticeRound(null)}
      />

      {/* 匯入匯出視窗 */}
      <AnimatePresence>
        {showIO && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIO(false)}
          >
            <motion.div
              className="w-full sm:max-w-lg bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 dark:border-neutral-800">
                <h3 className="font-bold text-gray-800 dark:text-white">{t.ioTitle}</h3>
                <button
                  type="button"
                  onClick={() => setShowIO(false)}
                  className="size-8 inline-flex justify-center items-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  aria-label={t.close}
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <i className="bi bi-download mr-1"></i>
                    {t.ioDownload}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-clipboard mr-1"></i>
                    {t.ioCopy}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-folder2-open mr-1"></i>
                    {t.ioPickFile}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyImport(ioText)}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-arrow-return-left mr-1"></i>
                    {t.ioFromText}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFile}
                  className="hidden"
                />

                <textarea
                  value={ioText}
                  onChange={e => setIoText(e.target.value)}
                  spellCheck={false}
                  rows={10}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />

                {ioMessage && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs ${
                      ioMessage.type === 'ok'
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <p className="font-medium">{ioMessageText}</p>
                    {ioMessage.key === 'importedWithWarnings' && (
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        {ioMessage.warnings.map((warning, i) => (
                          <li key={i}>
                            {t.warning(warning, 'mode' in warning ? t.modes[warning.mode].label : '')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default KWC2026
