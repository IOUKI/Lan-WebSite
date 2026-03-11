'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import FloatingGlow from '@/components/FloatingGlow'

// icon 規則：比賽型練習工具用 bi-trophy（獎盃），小遊戲類型用 bi-controller（遊戲手把）
const tools = [
  { title: '2026 TKO', href: '/kendamaTools/2026TKO', description: '2026 TKO 指定賽練習', icon: 'bi-trophy' },
  { title: '2025 South Jam', href: '/kendamaTools/2025SouthJam', description: '2025南方指定賽練習', icon: 'bi-trophy' },
  { title: '閃電戰', href: '/kendamaTools/blitz', description: '比拚招式熟練度的遊戲玩法！', icon: 'bi-controller' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.15 * i, duration: 0.5, ease: 'easeOut' },
  }),
}

const KendamaTools = () => {
  return (
    <>
      <FloatingGlow />
      <div className="max-w-3xl px-4 py-14 sm:px-6 lg:px-8 mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-6"
          >
            <i className="bi bi-arrow-left"></i>
            回到首頁
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            劍玉工具
          </h1>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            選擇一個工具開始練習
          </p>
        </motion.div>

        {/* Tool Cards */}
        <div className="grid gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.href}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={tool.href}
                className="group relative block p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-500 text-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className={`bi ${tool.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                      {tool.description}
                    </p>
                  </div>
                  <i className="bi bi-chevron-right text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300"></i>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}

export default KendamaTools
