// 長按拖曳排序：長按招式列後即可上下拖移，跨回合也能互換位置
//
// 命中判定使用「按下拖曳當下的版面快照」，而且放開手指才真正搬移。
// 因為招式名稱長度不同、每列高度不一樣，若邊拖邊即時搬移，
// 版面會在指標底下重排，短招與長招之間就會來回跳動。

import React, { useCallback, useEffect, useRef, useState } from 'react'

/** 長按多久才進入拖曳狀態 */
const LONG_PRESS_MS = 320
/** 長按判定期間允許的手指位移，超過就視為捲動 */
const MOVE_TOLERANCE = 8
/** 靠近視窗上下緣多少距離開始自動捲動 */
const EDGE = 72
const EDGE_SPEED = 12

/** 以文件座標（含捲動量）記錄的版面快照 */
type Snapshot = { index: number; top: number; bottom: number }

export type LongPressReorder = {
  /** 正在被拖曳的 index，沒有拖曳時為 null */
  dragIndex: number | null
  /** 放開手指後會落在的 index，沒有拖曳時為 null */
  targetIndex: number | null
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
  const [targetIndex, setTargetIndex] = useState<number | null>(null)

  const dragIndexRef = useRef<number | null>(null)
  const targetIndexRef = useRef<number | null>(null)
  const snapshotRef = useRef<Snapshot[]>([])
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

  /** 結束這次操作（不搬移） */
  const finish = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stopAutoScroll()
    detachRef.current?.()
    detachRef.current = null
    startRef.current = null
    snapshotRef.current = []
    dragIndexRef.current = null
    targetIndexRef.current = null
    setDragIndex(null)
    setTargetIndex(null)
    document.body.style.userSelect = ''
  }, [stopAutoScroll])

  // 離開頁面前清乾淨
  useEffect(() => finish, [finish])

  /** 依指標位置更新「會落在哪一格」，只改指示線、不動資料 */
  const updateTarget = useCallback((clientY: number) => {
    const from = dragIndexRef.current
    if (from === null) return

    const snapshot = snapshotRef.current
    if (snapshot.length === 0) return

    const pointer = clientY + window.scrollY
    let to = snapshot[0].index
    let best = Infinity
    for (const item of snapshot) {
      if (pointer >= item.top && pointer <= item.bottom) {
        to = item.index
        best = -1
        break
      }
      const distance = pointer < item.top ? item.top - pointer : pointer - item.bottom
      if (distance < best) {
        best = distance
        to = item.index
      }
    }

    if (to !== targetIndexRef.current) {
      targetIndexRef.current = to
      setTargetIndex(to)
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
      // 放開手指才真的搬移，過程中版面完全不動
      const handleUp = () => {
        const from = dragIndexRef.current
        const to = targetIndexRef.current
        finish()
        if (from !== null && to !== null && from !== to) onMoveRef.current(from, to)
      }
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

        // 拍下目前版面（文件座標），整段拖曳都以這份快照判定落點
        snapshotRef.current = Array.from(itemsRef.current.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([itemIndex, el]) => {
            const rect = el.getBoundingClientRect()
            return {
              index: itemIndex,
              top: rect.top + window.scrollY,
              bottom: rect.bottom + window.scrollY,
            }
          })

        dragIndexRef.current = index
        targetIndexRef.current = index
        draggedRef.current = true
        setDragIndex(index)
        setTargetIndex(index)
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

  return { dragIndex, targetIndex, registerItem, onPointerDown, consumeDrag }
}
