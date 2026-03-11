'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti-boom'

type Player = 'blue' | 'red'
type GameState = 'idle' | 'playing' | 'finished'

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const BlitzGameScreen = () => {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [maxTime, setMaxTime] = useState(60)
  const [showSettings, setShowSettings] = useState(false)
  const [tempTime, setTempTime] = useState(60)

  const [blueTime, setBlueTime] = useState(60000)
  const [redTime, setRedTime] = useState(60000)
  const [activePlayer, setActivePlayer] = useState<Player | null>(null)
  const [winner, setWinner] = useState<Player | null>(null)

  const lastTickRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  // precise countdown using requestAnimationFrame
  const tick = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTickRef.current
    lastTickRef.current = now

    if (activePlayer === 'blue') {
      setBlueTime(prev => {
        const next = prev - delta
        if (next <= 0) return 0
        return next
      })
    } else if (activePlayer === 'red') {
      setRedTime(prev => {
        const next = prev - delta
        if (next <= 0) return 0
        return next
      })
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [activePlayer])

  useEffect(() => {
    if (activePlayer && gameState === 'playing') {
      lastTickRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [activePlayer, gameState, tick])

  // check winner
  useEffect(() => {
    if (blueTime <= 0 && gameState === 'playing') {
      setWinner('red')
      setGameState('finished')
      setActivePlayer(null)
    }
    if (redTime <= 0 && gameState === 'playing') {
      setWinner('blue')
      setGameState('finished')
      setActivePlayer(null)
    }
  }, [blueTime, redTime, gameState])

  const handleStart = () => {
    setBlueTime(maxTime * 1000)
    setRedTime(maxTime * 1000)
    setActivePlayer(null)
    setWinner(null)
    setGameState('playing')
  }

  const handleTap = (side: Player) => {
    if (gameState !== 'playing') return

    // first tap starts the game — the tapped side's opponent starts counting
    if (!activePlayer) {
      setActivePlayer(side === 'blue' ? 'blue' : 'red')
      return
    }

    // only the active (counting down) player can tap to switch
    if (activePlayer === side) {
      setActivePlayer(side === 'blue' ? 'red' : 'blue')
    }
  }

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current)
    setGameState('idle')
    setActivePlayer(null)
    setWinner(null)
    setBlueTime(maxTime * 1000)
    setRedTime(maxTime * 1000)
  }

  const handleSaveSettings = () => {
    setMaxTime(tempTime)
    setShowSettings(false)
  }

  const blueUrgent = blueTime <= 10000 && blueTime > 0
  const redUrgent = redTime <= 10000 && redTime > 0

  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-center items-center gap-6">
      {/* Idle Screen */}
      {gameState === 'idle' && (
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold">閃電戰</h2>
          <p className="text-gray-500 dark:text-neutral-400 text-center max-w-xs">
            兩位玩家各有 {maxTime} 秒，輪流倒數，時間歸零者落敗！
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="py-3 px-8 text-lg font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              開始遊戲
            </button>
            <button
              onClick={() => { setTempTime(maxTime); setShowSettings(true) }}
              className="py-3 px-4 rounded-xl border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <i className="bi bi-gear text-lg"></i>
            </button>
          </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-80 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">遊戲設定</h3>

              <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-2">
                倒數時間（秒）
              </label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={tempTime}
                  onChange={e => setTempTime(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-lg font-mono font-bold w-14 text-right">{tempTime}s</span>
              </div>
              <div className="flex gap-2 mb-6">
                {[30, 60, 90, 120].map(t => (
                  <button
                    key={t}
                    onClick={() => setTempTime(t)}
                    className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                      tempTime === t
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  儲存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Screen */}
      {gameState === 'playing' && (
        <div className="fixed inset-0 z-[100] select-none">
          <div className="w-full h-full grid grid-cols-2">
            {/* Blue Side */}
            <motion.div
              className={`flex flex-col justify-center items-center cursor-pointer transition-colors duration-200 ${
                activePlayer === 'blue'
                  ? 'bg-blue-600'
                  : 'bg-blue-500/40 dark:bg-blue-900/40'
              }`}
              onClick={() => handleTap('blue')}
              whileTap={activePlayer === 'blue' ? { scale: 0.97 } : {}}
            >
              <motion.p
                className={`font-mono font-bold text-white ${blueUrgent ? 'text-red-300' : ''}`}
                style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}
                animate={blueUrgent && activePlayer === 'blue' ? { scale: [1, 1.05, 1] } : {}}
                transition={blueUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
              >
                {formatTime(blueTime)}
              </motion.p>
              <p className="text-white/70 text-lg mt-2">
                {!activePlayer ? '點擊開始' : activePlayer === 'blue' ? '倒數中...' : '等待中'}
              </p>
              {activePlayer === 'blue' && (
                <motion.div
                  className="mt-4 w-16 h-1 bg-white/50 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-white rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Red Side */}
            <motion.div
              className={`flex flex-col justify-center items-center cursor-pointer transition-colors duration-200 ${
                activePlayer === 'red'
                  ? 'bg-red-600'
                  : 'bg-red-500/40 dark:bg-red-900/40'
              }`}
              onClick={() => handleTap('red')}
              whileTap={activePlayer === 'red' ? { scale: 0.97 } : {}}
            >
              <motion.p
                className={`font-mono font-bold text-white ${redUrgent ? 'text-yellow-300' : ''}`}
                style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}
                animate={redUrgent && activePlayer === 'red' ? { scale: [1, 1.05, 1] } : {}}
                transition={redUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
              >
                {formatTime(redTime)}
              </motion.p>
              <p className="text-white/70 text-lg mt-2">
                {!activePlayer ? '點擊開始' : activePlayer === 'red' ? '倒數中...' : '等待中'}
              </p>
              {activePlayer === 'red' && (
                <motion.div
                  className="mt-4 w-16 h-1 bg-white/50 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-white rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Winner Screen */}
      <AnimatePresence>
        {gameState === 'finished' && winner && (
          <motion.div
            className={`fixed inset-0 z-[150] select-none flex flex-col justify-center items-center ${
              winner === 'blue' ? 'bg-blue-600' : 'bg-red-600'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confetti
              mode="boom"
              particleCount={500}
              shapeSize={30}
              deg={270}
              effectCount={Infinity}
              effectInterval={3000}
              spreadDeg={30}
              x={0.5}
              y={0.9}
              launchSpeed={5}
              colors={['#E0E0E0', '#FFAAD5', '#2894FF', '#ef4444', '#28FF28', '#FFFF37']}
            />

            <motion.div
              className="text-center text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <i className="bi bi-trophy-fill"></i>
              </motion.div>
              <motion.p
                className="text-5xl sm:text-6xl font-bold"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {winner === 'blue' ? '藍' : '紅'}方勝利！
              </motion.p>
              <motion.p
                className="text-xl mt-4 text-white/70"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {winner === 'blue'
                  ? `藍方剩餘 ${formatTime(blueTime)}`
                  : `紅方剩餘 ${formatTime(redTime)}`
                }
              </motion.p>
            </motion.div>

            <motion.button
              className="mt-10 py-3 px-8 rounded-xl bg-white/20 backdrop-blur text-white text-lg font-medium hover:bg-white/30 transition-colors"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleReset}
            >
              再玩一局
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlitzGameScreen
