'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ParticleBackground from '@/components/ParticleBackground'

interface GitHubUser {
  login: string
  avatar_url: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
}

const GITHUB_USERNAME = 'IOUKI'

const SOCIAL_LINKS = [
  { icon: 'bi-github', url: `https://github.com/${GITHUB_USERNAME}`, label: 'GitHub' },
  { icon: 'bi-instagram', url: 'https://www.instagram.com/lan_bluendama/', label: 'Instagram' },
  { icon: 'bi-linkedin', url: 'https://tw.linkedin.com/in/%E7%A8%8B%E5%87%B1-%E5%BC%B5-9b971a28b', label: 'LinkedIn' },
  { icon: 'bi-envelope-fill', url: 'mailto:quw112233456@gmail.com', label: 'Email' },
]

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Shell: '#89e051',
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const ProfileHomePage = () => {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGitHub = async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`),
        ])
        if (userRes.ok) setUser(await userRes.json())
        if (reposRes.ok) setRepos(await reposRes.json())
      } catch {
        // silently fail — static fallback will show
      } finally {
        setLoading(false)
      }
    }
    fetchGitHub()
  }, [])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center py-20 px-4">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-28 h-28 rounded-full border-4 border-blue-500/50 shadow-lg shadow-blue-500/20"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-neutral-700 animate-pulse" />
            )}
          </motion.div>

          {/* Name & Bio */}
          <motion.h1
            className="mt-5 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {user?.name || 'Lan'}
          </motion.h1>
          <motion.p
            className="mt-2 text-gray-600 dark:text-neutral-400 text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {user?.bio || `@${GITHUB_USERNAME}`}
          </motion.p>

          {/* Stats */}
          {user && (
            <motion.div
              className="mt-6 flex gap-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div>
                <p className="text-2xl font-bold text-blue-500">{user.public_repos}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-500">Repos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{user.followers}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-500">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{user.following}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-500">Following</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section className="mt-12">
        <motion.h2
          className="text-2xl font-bold mb-6 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-code-square text-blue-500"></i>
          近期專案
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                    {repo.name}
                  </h3>
                  <i className="bi bi-box-arrow-up-right text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                  {repo.description || '沒有描述'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-neutral-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#888' }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1">
                      <i className="bi bi-star"></i> {repo.stargazers_count}
                    </span>
                  )}
                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <i className="bi bi-diagram-2"></i> {repo.forks_count}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </section>

      {/* Kendama Tools Section */}
      <section className="mt-12">
        <motion.h2
          className="text-2xl font-bold mb-6 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-joystick text-blue-500"></i>
          劍玉工具
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: '2026 TKO', href: '/kendamaTools/2026TKO', description: '2026 TKO 指定賽練習' },
            { title: '2025 South Jam', href: '/kendamaTools/2025SouthJam', description: '2025南方指定賽練習' },
          ].map((tool, i) => (
            <motion.div
              key={tool.href}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link
                href={tool.href}
                className="group block p-5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {tool.title}
                  </h3>
                  <i className="bi bi-arrow-right text-sm text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                  {tool.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link
            href="/kendamaTools"
            className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            查看全部工具 <i className="bi bi-arrow-right"></i>
          </Link>
        </motion.div>
      </section>

      {/* Social Links Section */}
      <section className="mt-12 mb-8">
        <motion.h2
          className="text-2xl font-bold mb-6 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-people text-blue-500"></i>
          社群連結
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SOCIAL_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.url}
              target={link.url.startsWith('mailto') ? undefined : '_blank'}
              rel={link.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <i className={`bi ${link.icon} text-3xl text-blue-500`}></i>
              <span className="text-sm font-medium">{link.label}</span>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProfileHomePage
