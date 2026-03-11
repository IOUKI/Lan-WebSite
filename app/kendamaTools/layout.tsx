'use client'

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import PrelineScript from "@/components/PrelineScript"
import ThemeSwitcher from "@/components/ThemeSwitcher"

export default function KendamaToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isIndex = pathname === '/kendamaTools'

  return (
    <>
      <div className="flex flex-col mx-auto size-full">
        <main className="min-h-[100vh]">
          <div className="w-full flex justify-between items-center">
            <div className="p-3">
              <AnimatePresence>
                {!isIndex && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href="/kendamaTools"
                      className="group inline-flex items-center gap-2 text-xl px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <i className="bi bi-arrow-left text-2xl group-hover:-translate-x-1 transition-transform duration-200"></i>
                      <span className="text-sm font-medium text-gray-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        選單
                      </span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-3">
              <ThemeSwitcher size={32} />
            </div>
          </div>
          {children}
        </main>
      </div>
      <PrelineScript />
    </>
  )
}
