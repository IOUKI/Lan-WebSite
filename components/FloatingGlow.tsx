'use client'

import { motion } from 'framer-motion'

const blobs = [
  { color: 'bg-blue-500/20 dark:bg-blue-400/10', size: 'w-72 h-72', x: '-10%', y: '10%', duration: 18 },
  { color: 'bg-cyan-400/20 dark:bg-cyan-400/10', size: 'w-96 h-96', x: '60%', y: '-10%', duration: 22 },
  { color: 'bg-purple-500/15 dark:bg-purple-400/10', size: 'w-80 h-80', x: '30%', y: '60%', duration: 20 },
]

const FloatingGlow = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.color} ${blob.size}`}
          style={{ left: blob.x, top: blob.y }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 20, -40, 0],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default FloatingGlow
