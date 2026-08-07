// 長按拖曳排序：長按招式列後即可上下拖移，跨回合也能互換位置

import React, { useCallback, useEffect, useRef, useState } from 'react'

/** 長按多久才進入拖曳狀態 */
const LONG_PRESS_MS = 320
/** 長按判定期間允許的手指位移，超過就視為捲動 */
const MOVE_TOLERANCE = 8
/** 靠近視窗上下緣多少距離開始自動捲動 */
const EDGE = 72
const EDGE_SPEED = 12

export type LongPressReorder = {
  /** 目前正在被拖曳的 index，沒有拖曳時為 null */
  dragIndex: number | null
  /** 綁在每個可拖曳項目上的 ref callback */
  registerItem: (index: number) => (el: HTMLDivElement | null) => void
  /** 綁在每個可拖曳項目上的 onPointerDown */
  onPointerDown: (index: number) => (e: React.PointerEvent) => void
  /** 若剛剛發生過拖曳則回傳 true（並清除旗標），用來吃掉拖曳後的 click */
  consumeDrag: () => boolean
}

/**
 * @param onMove 把 from 位置的項目搬到 to 位置（splice 搬移，不是交換）
 * @param enabled 是否啟用
 */
export const useLongPressReorder = (
  onMove: (from: number, to: number) => void,
  enabled = true
): LongPressReorder => {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const dragIndexRef = useRef<number | null>(null)
  const startRef = useRef<{ x: number; y: number; index: number } | null>(null)
  const itemsRef = useRef(new Map<number, HTMLDivElement>())
  const timerRef = useRef<number | null>(null)
  const detachRef = useRef<(() => void) | null>(null)
  const draggedRef = useRef(false)
  const lastYRef = useRef(0)
  const autoScrollRef = useRef<number | null>(null)
  const autoScrollDyRef = useRef(0)
  const onMoveRef = useRef(onMove)

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current !== null) {
      window.clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])

  const finish = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stopAutoScroll()
    detachRef.current?.()
    detachRef.current = null
    startRef.current = null
    dragIndexRef.current = null
    setDragIndex(null)
    document.body.style.userSelect = ''
  }, [stopAutoScroll])

  // 離開頁面前清乾淨
  useEffect(() => finish, [finish])

  /** 依指標位置決定要落在哪一格，必要時即時搬移 */
  const updateTarget = useCallback((clientY: number) => {
    const from = dragIndexRef.current
    if (from === null) return

    const entries = Array.from(itemsRef.current.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([index, el]) => ({ index, rect: el.getBoundingClientRect() }))
    if (entries.length === 0) return

    let to = entries[0].index
    let best = Infinity
    for (const entry of entries) {
      if (clientY >= entry.rect.top && clientY <= entry.rect.bottom) {
        to = entry.index
        best = -1
        break
      }
      const distance = clientY < entry.rect.top ? entry.rect.top - clientY : clientY - entry.rect.bottom
      if (distance < best) {
        best = distance
        to = entry.index
      }
    }

    if (to !== from) {
      onMoveRef.current(from, to)
      dragIndexRef.current = to
      setDragIndex(to)
    }
  }, [])

  const handleAutoScroll = useCallback(
    (clientY: number) => {
      lastYRef.current = clientY
      let dy = 0
      if (clientY < EDGE) dy = -EDGE_SPEED
      else if (clientY > window.innerHeight - EDGE) dy = EDGE_SPEED

      autoScrollDyRef.current = dy
      if (dy === 0) {
        stopAutoScroll()
        return
      }
      if (autoScrollRef.current !== null) return
      autoScrollRef.current = window.setInterval(() => {
        window.scrollBy(0, autoScrollDyRef.current)
        updateTarget(lastYRef.current)
      }, 16)
    },
    [stopAutoScroll, updateTarget]
  )

  const registerItem = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) itemsRef.current.set(index, el)
      else itemsRef.current.delete(index)
    },
    []
  )

  const onPointerDown = useCallback(
    (index: number) => (e: React.PointerEvent) => {
      if (!enabled) return
      if (e.pointerType === 'mouse' && e.button !== 0) return

      finish()
      draggedRef.current = false
      startRef.current = { x: e.clientX, y: e.clientY, index }
      lastYRef.current = e.clientY

      const handleMove = (ev: PointerEvent) => {
        const start = startRef.current
        if (!start) return
        if (dragIndexRef.current === null) {
          // 尚未進入拖曳：位移太大就當作使用者要捲動
          if (
            Math.abs(ev.clientY - start.y) > MOVE_TOLERANCE ||
            Math.abs(ev.clientX - start.x) > MOVE_TOLERANCE
          ) {
            finish()
          }
          return
        }
        updateTarget(ev.clientY)
        handleAutoScroll(ev.clientY)
      }
      const handleUp = () => finish()
      // 拖曳中吃掉 touchmove，避免頁面跟著捲動
      const handleTouchMove = (ev: TouchEvent) => {
        if (dragIndexRef.current !== null) ev.preventDefault()
      }
      const handleContextMenu = (ev: Event) => ev.preventDefault()

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('contextmenu', handleContextMenu)
      detachRef.current = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('contextmenu', handleContextMenu)
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        if (!startRef.current) return
        dragIndexRef.current = index
        draggedRef.current = true
        setDragIndex(index)
        document.body.style.userSelect = 'none'
        navigator.vibrate?.(15)
      }, LONG_PRESS_MS)
    },
    [enabled, finish, handleAutoScroll, updateTarget]
  )

  const consumeDrag = useCallback(() => {
    if (!draggedRef.current) return false
    draggedRef.current = false
    return true
  }, [])

  return { dragIndex, registerItem, onPointerDown, consumeDrag }
}
