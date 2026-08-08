// KWC 2026 練習平台：賽制設定、分數計算、本機儲存與匯入匯出

import { TRICKS, TRICK_MAP, type Trick } from './tricks'

export type ModeKey = 'prelimNormal' | 'prelimSpecial' | 'final'

// 這裡只放賽制數值，所有顯示文字都在 i18n.ts
export type ModeConfig = {
  key: ModeKey
  minLevel: number
  maxLevel: number
  /** sum = level 相加（海選）；square = level 平方後相加（決賽） */
  scoring: 'sum' | 'square'
  /** 固定招數；null 代表可自由增減（決賽） */
  fixedSlots: number | null
  /** 每回合招數；null 代表整份清單為一回合 */
  roundSize: number | null
  roundCount: number
  roundSeconds: number
}

export const MODES: Record<ModeKey, ModeConfig> = {
  prelimNormal: {
    key: 'prelimNormal',
    minLevel: 1,
    maxLevel: 10,
    scoring: 'sum',
    fixedSlots: 10,
    roundSize: 5,
    roundCount: 2,
    roundSeconds: 180,
  },
  prelimSpecial: {
    key: 'prelimSpecial',
    minLevel: 4,
    maxLevel: 13,
    scoring: 'sum',
    fixedSlots: 10,
    roundSize: 5,
    roundCount: 2,
    roundSeconds: 180,
  },
  final: {
    key: 'final',
    minLevel: 1,
    maxLevel: 15,
    scoring: 'square',
    fixedSlots: null,
    roundSize: null,
    roundCount: 1,
    roundSeconds: 180,
  },
}

export const MODE_ORDER: ModeKey[] = ['prelimNormal', 'prelimSpecial', 'final']

/** 決賽預設招數（可自由增減，不限數量；因為不可重複，實際上限即為全部招式數） */
export const FINAL_DEFAULT_SLOTS = 5
export const FINAL_MAX_SLOTS = TRICKS.length

export const scoreOfLevel = (level: number, mode: ModeConfig) =>
  mode.scoring === 'square' ? level * level : level

export const scoreOfTrick = (trick: Trick | undefined, mode: ModeConfig) =>
  trick ? scoreOfLevel(trick.level, mode) : 0

export const totalScore = (ids: (string | null)[], mode: ModeConfig) =>
  ids.reduce((sum, id) => sum + scoreOfTrick(id ? TRICK_MAP[id] : undefined, mode), 0)

/** 該模式下的理論最高分（全部選滿最高 Level） */
export const maxScore = (mode: ModeConfig, slotCount: number) =>
  scoreOfLevel(mode.maxLevel, mode) * slotCount

/** 回合範圍；label 由呼叫端依語言補上 */
export type RoundRange = { index: number; start: number; end: number }

export const getRounds = (mode: ModeConfig, length: number): RoundRange[] => {
  if (mode.roundSize === null) {
    return [{ index: 0, start: 0, end: length }]
  }
  return Array.from({ length: mode.roundCount }, (_, i) => ({
    index: i,
    start: i * mode.roundSize!,
    end: (i + 1) * mode.roundSize!,
  }))
}

// ---------------------------------------------------------------- 儲存

export type Selections = Record<ModeKey, (string | null)[]>

export const emptySelections = (): Selections => ({
  prelimNormal: Array(MODES.prelimNormal.fixedSlots!).fill(null),
  prelimSpecial: Array(MODES.prelimSpecial.fixedSlots!).fill(null),
  final: Array(FINAL_DEFAULT_SLOTS).fill(null),
})

const STORAGE_KEY = 'kwc2026-practice-v1'
const MODE_STORAGE_KEY = 'kwc2026-practice-mode'

export const loadSelections = (): Selections => {
  if (typeof window === 'undefined') return emptySelections()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySelections()
    return normalizeSelections(JSON.parse(raw)).selections
  } catch {
    return emptySelections()
  }
}

export const saveSelections = (selections: Selections) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
  } catch {
    // 無痕模式或空間不足時忽略
  }
}

export const loadMode = (): ModeKey => {
  if (typeof window === 'undefined') return 'prelimNormal'
  const saved = window.localStorage.getItem(MODE_STORAGE_KEY)
  return saved && MODE_ORDER.includes(saved as ModeKey) ? (saved as ModeKey) : 'prelimNormal'
}

export const saveMode = (mode: ModeKey) => {
  try {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode)
  } catch {
    // 忽略
  }
}

// ------------------------------------------------------- 匯入 / 匯出

export const EXPORT_VERSION = 1
const EXPORT_APP = 'kwc2026-practice'

export const buildExport = (selections: Selections, exportedAt: string) => ({
  app: EXPORT_APP,
  version: EXPORT_VERSION,
  exportedAt,
  selections,
})

export const exportToJson = (selections: Selections, exportedAt: string) =>
  JSON.stringify(buildExport(selections, exportedAt), null, 2)

/** 匯入時遇到的問題；文字由 i18n.ts 依語言組裝 */
export type ImportWarning =
  | { code: 'noData' }
  | { code: 'badFormat'; mode: ModeKey }
  | { code: 'unknownTrick'; mode: ModeKey; id: string }
  | { code: 'levelOutOfRange'; mode: ModeKey; id: string; level: number }
  | { code: 'duplicate'; mode: ModeKey; id: string }
  | { code: 'overflow'; mode: ModeKey; max: number }

/** 把任意輸入整理成合法的 Selections，並回報過程中的問題 */
export const normalizeSelections = (
  input: unknown
): { selections: Selections; warnings: ImportWarning[] } => {
  const warnings: ImportWarning[] = []
  const result = emptySelections()

  const source =
    input && typeof input === 'object' && 'selections' in (input as Record<string, unknown>)
      ? (input as Record<string, unknown>).selections
      : input

  if (!source || typeof source !== 'object') {
    return { selections: result, warnings: [{ code: 'noData' }] }
  }

  for (const key of MODE_ORDER) {
    const mode = MODES[key]
    const raw = (source as Record<string, unknown>)[key]
    if (raw === undefined) continue
    if (!Array.isArray(raw)) {
      warnings.push({ code: 'badFormat', mode: key })
      continue
    }

    const seen = new Set<string>()
    const ids = raw.map(item => {
      if (typeof item !== 'string' || item === '') return null
      const trick = TRICK_MAP[item]
      if (!trick) {
        warnings.push({ code: 'unknownTrick', mode: key, id: item })
        return null
      }
      if (trick.level < mode.minLevel || trick.level > mode.maxLevel) {
        warnings.push({ code: 'levelOutOfRange', mode: key, id: item, level: trick.level })
        return null
      }
      if (seen.has(item)) {
        warnings.push({ code: 'duplicate', mode: key, id: item })
        return null
      }
      seen.add(item)
      return item
    })

    if (mode.fixedSlots !== null) {
      const fixed = ids.slice(0, mode.fixedSlots)
      while (fixed.length < mode.fixedSlots) fixed.push(null)
      if (ids.length > mode.fixedSlots) {
        warnings.push({ code: 'overflow', mode: key, max: mode.fixedSlots })
      }
      result[key] = fixed
    } else {
      const capped = ids.slice(0, FINAL_MAX_SLOTS)
      if (ids.length > FINAL_MAX_SLOTS) {
        warnings.push({ code: 'overflow', mode: key, max: FINAL_MAX_SLOTS })
      }
      result[key] = capped.length > 0 ? capped : Array(FINAL_DEFAULT_SLOTS).fill(null)
    }
  }

  return { selections: result, warnings }
}

export const parseImport = (text: string): { selections: Selections; warnings: ImportWarning[] } => {
  const parsed = JSON.parse(text)
  return normalizeSelections(parsed)
}

export const formatTime = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
