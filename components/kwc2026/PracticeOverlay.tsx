'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PRACTICE_VIDEO, type Trick } from './tricks'
import { formatTime, scoreOfTrick, type ModeConfig } from './config'

type Props = {
  open: boolean
  mode: ModeConfig
  roundLabel: string
  tricks: Trick[]
  onClose: () => void
}

const PracticeOverlay = ({ open, mode, roundLabel, tricks, onClose }: Props) => {
  const totalMs = mode.roundSeconds * 1000
  const [remaining, setRemaining] = useState(totalMs)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [usedMs, setUsedMs] = useState(0)
  const [done, setDone] = useState<boolean[]>(() => tricks.map(() => false))
  const [showVideo, setShowVideo] = useState(false)

  const lastTickRef = useRef(0)
  const rafRef = useRef(0)

  // 決賽必須照順序完成
  const sequential = mode.fixedSlots === null

  const reset = useCallback(() => {
    setRemaining(totalMs)
    setRunning(false)
    setFinished(false)
    setUsedMs(0)
    setDone(tricks.map(() => false))
  }, [totalMs, tricks])

  // 每次開啟練習都重新開始
  useEffect(() => {
    if (open) {
      reset()
      setShowVideo(false)
    }
  }, [open, reset])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // 倒數計時
  useEffect(() => {
    if (!running) return
    lastTickRef.current = performance.now()
    const tick = () => {
      const now = performance.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      setRemaining(prev => (prev - delta <= 0 ? 0 : prev - delta))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  // 時間到
  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false)
      setFinished(true)
      setUsedMs(totalMs)
    }
  }, [remaining, running, totalMs])

  const doneCount = done.filter(Boolean).length
  const gained = tricks.reduce((sum, trick, i) => sum + (done[i] ? scoreOfTrick(trick, mode) : 0), 0)
  const possible = tricks.reduce((sum, trick) => sum + scoreOfTrick(trick, mode), 0)

  // 全部完成 → 自動結束並記錄用時（影片模式由影片計時，不記錄用時）
  useEffect(() => {
    if (finished || tricks.length === 0 || doneCount !== tricks.length) return
    if (!running && !showVideo) return
    setRunning(false)
    setFinished(true)
    setUsedMs(showVideo ? 0 : totalMs - remaining)
  }, [doneCount, running, finished, showVideo, tricks.length, totalMs, remaining])

  // 切到影片模式時，改由影片負責計時，暫停內建倒數
  useEffect(() => {
    if (showVideo) setRunning(false)
  }, [showVideo])

  const firstUndone = done.findIndex(d => !d)
  const lastDone = done.lastIndexOf(true)

  const canToggle = (i: number) => {
    if (finished) return false
    if (!sequential) return true
    return i === firstUndone || i === lastDone
  }

  const toggle = (i: number) => {
    if (!canToggle(i)) return
    setDone(prev => prev.map((d, idx) => (idx === i ? !d : d)))
    if (!running && !finished && !showVideo) setRunning(true)
  }

  const urgent = remaining <= 30000 && remaining > 0 && !finished

  const videoSrc = useMemo(
    () => `https://www.youtube.com/embed/${PRACTICE_VIDEO.youtubeId}?rel=0&autoplay=1`,
    []
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] bg-gray-50 dark:bg-neutral-950 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 頂部：標題 + 關閉 */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{mode.label}</p>
              <h3 className="font-bold text-gray-800 dark:text-white truncate">{roundLabel} 練習</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVideo(v => !v)}
                className={`py-1.5 px-3 text-sm rounded-lg border transition-colors ${
                  showVideo
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <i className="bi bi-youtube mr-1"></i>
                計時影片
              </button>
              <button
                type="button"
                onClick={onClose}
                className="size-9 inline-flex justify-center items-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="結束練習"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* 計時區：影片模式時，直接用影片取代倒數計時（影片本身即為現場比賽計時聲） */}
          <div className="shrink-0 border-b border-gray-200 dark:border-neutral-800">
            {showVideo ? (
              <div className="bg-black">
                <div className="aspect-video max-h-[38vh] mx-auto">
                  <iframe
                    className="w-full h-full"
                    src={videoSrc}
                    title="KWC 2026 計時練習影片"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-center gap-3 py-1.5">
                  <p className="text-[11px] text-neutral-400">
                    計時練習影片由 {PRACTICE_VIDEO.credit} 製作
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="py-0.5 px-2 text-[11px] rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  >
                    <i className="bi bi-arrow-counterclockwise mr-1"></i>
                    重來
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 pt-4 text-center">
                <motion.p
                  className={`font-mono font-bold leading-none ${
                    finished ? 'text-gray-400 dark:text-neutral-500' : urgent ? 'text-red-500' : 'text-gray-800 dark:text-white'
                  }`}
                  style={{ fontSize: 'clamp(2.5rem, 14vw, 5rem)' }}
                  animate={urgent && running ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={urgent && running ? { repeat: Infinity, duration: 0.6 } : { duration: 0.2 }}
                >
                  {formatTime(remaining)}
                </motion.p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {!finished && (
                    <button
                      type="button"
                      onClick={() => setRunning(r => !r)}
                      className={`py-2 px-6 text-base font-semibold rounded-xl text-white transition-colors ${
                        running ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <i className={`bi ${running ? 'bi-pause-fill' : 'bi-play-fill'} mr-1`}></i>
                      {running ? '暫停' : remaining === totalMs ? '開始' : '繼續'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="py-2 px-4 text-base rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    <i className="bi bi-arrow-counterclockwise mr-1"></i>
                    重來
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 pt-4 pb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 py-2">
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">完成</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {doneCount}/{tricks.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 py-2">
                <p className="text-[11px] text-blue-600 dark:text-blue-300">得分</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-300">{gained}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 py-2">
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">滿分</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{possible}</p>
              </div>
            </div>

            {finished && (
              <motion.p
                className="-mt-2 px-4 pb-4 text-center text-sm font-medium text-gray-700 dark:text-neutral-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {doneCount === tricks.length && tricks.length > 0
                  ? showVideo
                    ? `全部完成！得分 ${gained} 分`
                    : `全部完成！用時 ${formatTime(usedMs)}，得分 ${gained} 分`
                  : `時間到，完成 ${doneCount} 招、得分 ${gained} 分`}
              </motion.p>
            )}
          </div>

          {/* 招式清單 */}
          <div className="flex-1 overflow-y-auto p-3">
            {sequential && !finished && (
              <p className="text-xs text-center text-gray-500 dark:text-neutral-400 mb-2">
                決賽需依序完成，只能點選目前這一招
              </p>
            )}
            <div className="grid gap-2 max-w-2xl mx-auto">
              {tricks.map((trick, i) => {
                const isDone = done[i]
                const isCurrent = sequential && i === firstUndone && !finished
                const clickable = canToggle(i)
                return (
                  <button
                    key={`${trick.id}-${i}`}
                    type="button"
                    onClick={() => toggle(i)}
                    disabled={!clickable}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isDone
                        ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                        : isCurrent
                          ? 'border-blue-500 bg-white dark:bg-neutral-900 ring-2 ring-blue-500/30'
                          : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    } ${clickable ? 'active:scale-[0.99]' : 'opacity-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 size-8 rounded-full inline-flex items-center justify-center text-sm font-bold ${
                          isDone
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {isDone ? <i className="bi bi-check-lg"></i> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-800 dark:text-white break-words">
                          {trick.en}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-neutral-400 break-words">
                          {trick.ja}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {trick.level}-{trick.no}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PracticeOverlay
