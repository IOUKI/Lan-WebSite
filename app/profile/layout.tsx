import React from "react"
import Link from "next/link"
import PrelineScript from "@/components/PrelineScript"
import ThemeSwitcher from "@/components/ThemeSwitcher"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="max-w-[50rem] flex flex-col mx-auto size-full">
        <header className="mb-auto flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full text-sm py-4">
          <nav className="w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/profile" scroll={false} className="flex-none text-xl font-semibold focus:outline-none focus:opacity-80">Lan</Link>
              <div className="sm:hidden">
                <button type="button" className="hs-collapse-toggle relative size-9 flex justify-center items-center border border-white/10 font-medium text-sm rounded-lg hover:bg-white/10 focus:outline-none focus:bg-white/10" id="hs-navbar-cover-page-collapse" aria-expanded="false" aria-controls="hs-navbar-cover-page" aria-label="Toggle navigation" data-hs-collapse="#hs-navbar-cover-page">
                  <svg className="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
                  <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  <span className="sr-only">Toggle navigation</span>
                </button>
              </div>
            </div>
            <div id="hs-navbar-cover-page" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block" aria-labelledby="hs-navbar-cover-page-collapse">
              <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
                <Link href="/profile" scroll={false} className="font-medium focus:outline-none hover:underline">首頁</Link>
                <Link href="/profile/about" scroll={false} className="font-medium focus:outline-none hover:underline">關於</Link>
                <Link href="/games" scroll={false} className="font-medium focus:outline-none hover:underline">遊戲</Link>
                <Link href="/kendamaTools" scroll={false} className="font-medium focus:outline-none hover:underline">劍玉</Link>
                <div><ThemeSwitcher /></div>
              </div>
            </div>
          </nav>
        </header>
        <main className="min-h-[80vh] px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="text-xs text-gray-600 dark:text-neutral-400">
                  © {new Date().getFullYear()} Lan.
                </p>
              </div>
              <ul className="flex flex-wrap items-center">
                <li className="inline-block relative pe-4 text-xs last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:rounded-full before:bg-gray-400 dark:text-neutral-500 dark:before:bg-neutral-600">
                  <a className="text-base text-gray-500 hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400" href="https://www.instagram.com/lan_bluendama/" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-instagram"></i>
                  </a>
                </li>
                <li className="inline-block relative pe-4 text-xs last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:rounded-full before:bg-gray-400 dark:text-neutral-500 dark:before:bg-neutral-600">
                  <a className="text-base text-gray-500 hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400" href="https://tw.linkedin.com/in/%E7%A8%8B%E5%87%B1-%E5%BC%B5-9b971a28b?trk=people-guest_people_search-card" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </li>
                <li className="inline-block pe-4 text-xs">
                  <a className="text-base text-gray-500 hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400" href="https://github.com/IOUKI" target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-github"></i>
                  </a>
                </li>
                <li className="inline-block pe-4 text-xs">
                  <a className="text-base text-gray-500 hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400" href="mailto:quw112233456@gmail.com">
                    <i className="bi bi-envelope-fill"></i>
                  </a>
                </li>
                <li className="inline-block">
                  <ThemeSwitcher />
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
      <PrelineScript />
    </>
  )
}