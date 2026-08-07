'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TrickPicker from '@/components/kwc2026/TrickPicker'
import PracticeOverlay from '@/components/kwc2026/PracticeOverlay'
import { PRACTICE_VIDEO, getTrick, type Trick } from '@/components/kwc2026/tricks'
import { useLongPressReorder } from '@/components/kwc2026/useLongPressReorder'
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
  scoreOfTrick,
  totalScore,
  type ModeKey,
  type Selections,
} from '@/components/kwc2026/config'

const KWC2026 = () => {
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState<ModeKey>('prelimNormal')
  const [selections, setSelections] = useState<Selections>(emptySelections)

  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const [practiceRound, setPracticeRound] = useState<number | null>(null)
  const [showIO, setShowIO] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const [ioText, setIoText] = useState('')
  const [ioMessage, setIoMessage] = useState<{ type: 'ok' | 'error'; text: string; details?: string[] } | null>(null)
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
    if (!window.confirm(`確定要清空「${modeConfig.label}」的所有招式嗎？`)) return
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
    setIoMessage({ type: 'ok', text: '已匯出 JSON 檔案' })
  }

  const handleCopy = async () => {
    const json = exportToJson(selections, new Date().toISOString())
    try {
      await navigator.clipboard.writeText(json)
      setIoMessage({ type: 'ok', text: '已複製到剪貼簿' })
    } catch {
      setIoMessage({ type: 'error', text: '複製失敗，請手動選取下方文字複製' })
    }
  }

  const applyImport = (text: string) => {
    try {
      const { selections: imported, warnings } = parseImport(text)
      setSelections(imported)
      setIoMessage({
        type: warnings.length ? 'error' : 'ok',
        text: warnings.length ? `已匯入，但有 ${warnings.length} 個問題` : '匯入成功！',
        details: warnings,
      })
    } catch {
      setIoMessage({ type: 'error', text: '匯入失敗：不是合法的 JSON 格式' })
    }
  }

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
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            KWC 2026 練習平台
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            劍玉世界盃・海選與決賽的選招、計分與計時練習
          </p>
        </motion.div>

        {/* 模式切換 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MODE_ORDER.map(key => {
            const config = MODES[key]
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
                {config.label}
              </button>
            )
          })}
        </div>

        {/* 規則說明 */}
        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <p className="text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
            <i className="bi bi-info-circle mr-1"></i>
            {modeConfig.description}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-neutral-500">
            <i className="bi bi-hand-index mr-1"></i>
            長按招式再上下拖曳即可調整順序，放開手指後套用
            {modeConfig.roundSize !== null && '，第一回合與第二回合之間也可以互相拖移'}
          </p>
        </div>

        {/* 分數面板 */}
        <div className={`grid gap-2 mb-5 ${showTheoreticalMax ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 py-3 text-center">
            <p className="text-[11px] text-blue-600 dark:text-blue-300">總分</p>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{score}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 text-center">
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">已選招數</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
              {filledCount}
              <span className="text-sm font-medium text-gray-400">/{slots.length}</span>
            </p>
          </div>
          {showTheoreticalMax && (
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 text-center">
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">理論最高</p>
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
                  <h2 className="font-bold text-gray-800 dark:text-white">{round.label}</h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {roundFilled}/{roundSlots.length} 招・{roundScore} 分・3 分鐘
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPracticeRound(round.index)}
                  disabled={roundFilled === 0}
                  className="shrink-0 py-2 px-3 text-sm font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <i className="bi bi-play-fill mr-1"></i>
                  練習
                </button>
              </div>

              <div className="p-3 grid gap-2">
                {roundSlots.map((id, i) => {
                  const index = round.start + i
                  const trick = getTrick(id)
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
                          {trick ? (
                            <>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-gray-800 dark:text-white break-words">
                                  {trick.en}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-neutral-400 break-words">
                                  {trick.ja}
                                </span>
                              </span>
                              <span className="shrink-0 text-base font-bold text-blue-600 dark:text-blue-400">
                                {trick.level}-{trick.no}
                              </span>
                            </>
                          ) : (
                            <span className="flex-1 text-sm text-gray-400 dark:text-neutral-500">
                              點擊選擇招式…
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
                              aria-label="刪除"
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
                    新增一招
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
            匯入 / 匯出
          </button>
          <button
            type="button"
            onClick={resetMode}
            className="py-2.5 px-3 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:border-red-400 hover:text-red-500"
          >
            <i className="bi bi-eraser mr-1"></i>
            清空此模式
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
                計時練習影片
              </span>
              <span className="block text-xs text-gray-500 dark:text-neutral-400">
                影片由 {PRACTICE_VIDEO.credit} 製作
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
                    title="KWC 2026 計時練習影片"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="px-4 py-2 text-xs text-gray-500 dark:text-neutral-400">
                  此計時練習影片由 {PRACTICE_VIDEO.credit} 製作，
                  <a
                    href={PRACTICE_VIDEO.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    在 YouTube 開啟
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-neutral-600">
          所有選招紀錄只會保存在這台裝置的瀏覽器中，換裝置請用「匯入 / 匯出」。
        </p>
      </div>

      {/* 選招視窗 */}
      <TrickPicker
        open={pickerSlot !== null}
        mode={modeConfig}
        currentId={pickerSlot !== null ? slots[pickerSlot] ?? null : null}
        usedIds={usedIds}
        slotLabel={pickerSlot !== null ? `第 ${pickerSlot + 1} 招` : ''}
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
        roundLabel={practiceRound !== null ? rounds[practiceRound]?.label ?? '' : ''}
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
                <h3 className="font-bold text-gray-800 dark:text-white">匯入 / 匯出招式表</h3>
                <button
                  type="button"
                  onClick={() => setShowIO(false)}
                  className="size-8 inline-flex justify-center items-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  aria-label="關閉"
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
                    下載檔案
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-clipboard mr-1"></i>
                    複製 JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-folder2-open mr-1"></i>
                    選擇檔案匯入
                  </button>
                  <button
                    type="button"
                    onClick={() => applyImport(ioText)}
                    className="py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-blue-400"
                  >
                    <i className="bi bi-arrow-return-left mr-1"></i>
                    從下方文字匯入
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
                    <p className="font-medium">{ioMessage.text}</p>
                    {ioMessage.details && ioMessage.details.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        {ioMessage.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
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
