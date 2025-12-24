import React, { useMemo } from 'react'
import Link from 'next/link'

const KendamaTools = () => {
  const links = useMemo(() => [
    { title: '2025 South Jam', href: '/kendamaTools/2025SouthJam', description: '2025南方指定賽練習' },
    { title: '2026 TKO', href: '/kendamaTools/2026TKO', description: '2026 TKO 指定賽練習' },
    // { title: '閃電戰', href: '/kendamaTools/blitz', description: '比拚招式熟練度的遊戲玩法！' },
    // { title: '計數器', href: '/kendamaTools/counter', description: '紀錄招式練習次數' },
  ], [])
  return (
    <div className="max-w-[85rem] px-4 py-14 sm:px-6 lg:px-8 mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 items-center gap-6 md:gap-10">
        {links.reverse().map((link) => (
          <Link key={link.href} href={link.href} className="group size-full bg-white shadow-lg rounded-lg p-5 hover:bg-neutral-100 dark:bg-neutral-900 hover:dark:bg-neutral-800 duration-150">
            <div className="flex items-center gap-x-4 mb-3">
              <div className="shrink-0">
                <h3 className="block text-lg font-semibold text-gray-800 dark:text-white">{link.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 dark:text-neutral-400 group-hover:dark:text-white duration-150">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default KendamaTools