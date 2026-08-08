// KWC 2026 練習平台：多語系字典（繁體中文 / English / 日本語）
// KWC 是全球性賽事，介面文字統一從這裡取得，config.ts 只保留賽制數值。

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ImportWarning, ModeKey } from './config'
import type { Trick } from './tricks'

export type Lang = 'zh' | 'en' | 'ja'

export const LANGS: { key: Lang; label: string; short: string }[] = [
  { key: 'zh', label: '繁體中文', short: '中' },
  { key: 'en', label: 'English', short: 'EN' },
  { key: 'ja', label: '日本語', short: '日' },
]

const zh = {
  langLabel: '語言',
  title: 'KWC 2026 練習平台',
  subtitle: '劍玉世界盃・海選與決賽的選招、計分與計時練習',

  modes: {
    prelimNormal: {
      label: '海選・一般',
      description: '兩回合、每回合 3 分鐘各打 5 招，共 10 招。可選 Level 1～10，分數為各招 Level 相加。',
      rounds: ['第一回合', '第二回合'],
    },
    prelimSpecial: {
      label: '海選・特殊',
      description: '兩回合、每回合 3 分鐘各打 5 招，共 10 招。只能選 Level 4～13，分數為各招 Level 相加。',
      rounds: ['第一回合', '第二回合'],
    },
    final: {
      label: '決賽',
      description:
        '一回合 3 分鐘，全部 Level 皆可選、招數不限，並且要照挑選的順序完成。分數為各招 Level 平方後相加。',
      rounds: ['決賽路線'],
    },
  } as Record<ModeKey, { label: string; description: string; rounds: string[] }>,

  dragHint: '長按招式再上下拖曳即可調整順序，放開手指後套用',
  dragHintCrossRound: '，第一回合與第二回合之間也可以互相拖移',

  statTotal: '總分',
  statPicked: '已選招數',
  statMax: '理論最高',

  roundSummary: (filled: number, count: number, score: number, minutes: number) =>
    `${filled}/${count} 招・${score} 分・${minutes} 分鐘`,
  practice: '練習',
  emptySlot: '點擊選擇招式…',
  deleteSlot: '刪除',
  addSlot: '新增一招',
  slotLabel: (n: number) => `第 ${n} 招`,

  ioButton: '匯入 / 匯出',
  clearMode: '清空此模式',
  clearConfirm: (label: string) => `確定要清空「${label}」的所有招式嗎？`,

  timerVideo: '計時練習影片',
  videoCredit: (credit: string) => `影片由 ${credit} 製作`,
  videoCreditLong: (credit: string) => `此計時練習影片由 ${credit} 製作，`,
  openOnYoutube: '在 YouTube 開啟',
  levelVideos: '招式範例影片',
  levelVideoTitle: (level: number) => `Level ${level} 招式範例`,
  storageNote: '所有選招紀錄只會保存在這台裝置的瀏覽器中，換裝置請用「匯入 / 匯出」。',

  ioTitle: '匯入 / 匯出招式表',
  ioDownload: '下載檔案',
  ioCopy: '複製 JSON',
  ioPickFile: '選擇檔案匯入',
  ioFromText: '從下方文字匯入',
  ioExported: '已匯出 JSON 檔案',
  ioCopied: '已複製到剪貼簿',
  ioCopyFailed: '複製失敗，請手動選取下方文字複製',
  ioImported: '匯入成功！',
  ioImportedWithWarnings: (n: number) => `已匯入，但有 ${n} 個問題`,
  ioBadJson: '匯入失敗：不是合法的 JSON 格式',

  warning: (w: ImportWarning, modeLabel: string) => {
    switch (w.code) {
      case 'noData':
        return '找不到招式資料'
      case 'badFormat':
        return `${modeLabel}：資料格式不正確，已略過`
      case 'unknownTrick':
        return `${modeLabel}：找不到招式代碼 ${w.id}，已清空該格`
      case 'levelOutOfRange':
        return `${modeLabel}：${w.id}（Level ${w.level}）超出可選範圍，已清空該格`
      case 'duplicate':
        return `${modeLabel}：${w.id} 重複出現，已清空該格`
      case 'overflow':
        return `${modeLabel}：超過 ${w.max} 招的部分已捨棄`
    }
  },

  pickerTitle: (slotLabel: string) => `選擇招式・${slotLabel}`,
  pickerSubtitle: (modeLabel: string, min: number, max: number) =>
    `${modeLabel}：可選 Level ${min}～${max}・招式不可重複`,
  searchPlaceholder: '搜尋招式（英文 / 日文）',
  filterAll: '全部',
  levelChip: (lv: number) => `Lv${lv}`,
  noResult: '找不到符合的招式',
  levelHeading: (lv: number) => `Level ${lv}`,
  levelPoints: (points: number) => `（本模式此招 ${points} 分）`,
  used: '已選',
  clearSlot: '清空此格',
  close: '關閉',

  practiceTitle: (roundLabel: string) => `${roundLabel} 練習`,
  timerVideoButton: '計時影片',
  endPractice: '結束練習',
  restart: '重來',
  start: '開始',
  resume: '繼續',
  pause: '暫停',
  doneCount: '完成',
  gained: '得分',
  possible: '滿分',
  allDone: (score: number) => `全部完成！得分 ${score} 分`,
  allDoneWithTime: (time: string, score: number) => `全部完成！用時 ${time}，得分 ${score} 分`,
  timeUp: (count: number, score: number) => `時間到，完成 ${count} 招、得分 ${score} 分`,
  sequentialHint: '決賽需依序完成，只能點選目前這一招',
}

export type Dict = typeof zh

const en: Dict = {
  langLabel: 'Language',
  title: 'KWC 2026 Practice',
  subtitle: 'Kendama World Cup — build your trick list, score it, and practise against the clock',

  modes: {
    prelimNormal: {
      label: 'Prelim · Normal',
      description:
        'Two rounds, 3 minutes each, 5 tricks per round (10 total). Levels 1–10 are allowed; your score is the sum of the trick levels.',
      rounds: ['Round 1', 'Round 2'],
    },
    prelimSpecial: {
      label: 'Prelim · Special',
      description:
        'Two rounds, 3 minutes each, 5 tricks per round (10 total). Only levels 4–13 are allowed; your score is the sum of the trick levels.',
      rounds: ['Round 1', 'Round 2'],
    },
    final: {
      label: 'Final',
      description:
        'One 3-minute round. Any level, any number of tricks, but they must be landed in the order you picked. Your score is the sum of each trick level squared.',
      rounds: ['Final run'],
    },
  },

  dragHint: 'Press and hold a trick, then drag up or down to reorder — release to apply',
  dragHintCrossRound: '. You can also drag tricks between round 1 and round 2',

  statTotal: 'Total',
  statPicked: 'Picked',
  statMax: 'Max possible',

  roundSummary: (filled, count, score, minutes) =>
    `${filled}/${count} tricks · ${score} pts · ${minutes} min`,
  practice: 'Practise',
  emptySlot: 'Tap to pick a trick…',
  deleteSlot: 'Delete',
  addSlot: 'Add a trick',
  slotLabel: n => `Trick ${n}`,

  ioButton: 'Import / Export',
  clearMode: 'Clear this mode',
  clearConfirm: label => `Clear every trick in "${label}"?`,

  timerVideo: 'Timer practice video',
  videoCredit: credit => `Video by ${credit}`,
  videoCreditLong: credit => `This timer practice video was made by ${credit}. `,
  openOnYoutube: 'Open on YouTube',
  levelVideos: 'Trick example videos',
  levelVideoTitle: level => `Level ${level} examples`,
  storageNote:
    'Your trick lists are stored only in this browser on this device — use Import / Export to move them.',

  ioTitle: 'Import / Export trick lists',
  ioDownload: 'Download file',
  ioCopy: 'Copy JSON',
  ioPickFile: 'Import from file',
  ioFromText: 'Import from text below',
  ioExported: 'JSON file exported',
  ioCopied: 'Copied to clipboard',
  ioCopyFailed: 'Copy failed — please select the text below and copy manually',
  ioImported: 'Import successful!',
  ioImportedWithWarnings: n => `Imported, but with ${n} issue${n === 1 ? '' : 's'}`,
  ioBadJson: 'Import failed: not valid JSON',

  warning: (w, modeLabel) => {
    switch (w.code) {
      case 'noData':
        return 'No trick data found'
      case 'badFormat':
        return `${modeLabel}: malformed data, skipped`
      case 'unknownTrick':
        return `${modeLabel}: unknown trick code ${w.id}, slot cleared`
      case 'levelOutOfRange':
        return `${modeLabel}: ${w.id} (level ${w.level}) is out of range, slot cleared`
      case 'duplicate':
        return `${modeLabel}: ${w.id} appears more than once, slot cleared`
      case 'overflow':
        return `${modeLabel}: everything beyond ${w.max} tricks was dropped`
    }
  },

  pickerTitle: slotLabel => `Pick a trick · ${slotLabel}`,
  pickerSubtitle: (modeLabel, min, max) => `${modeLabel}: levels ${min}–${max} · no duplicates`,
  searchPlaceholder: 'Search tricks (English / Japanese)',
  filterAll: 'All',
  levelChip: lv => `Lv${lv}`,
  noResult: 'No matching tricks',
  levelHeading: lv => `Level ${lv}`,
  levelPoints: points => `(${points} pts each in this mode)`,
  used: 'Used',
  clearSlot: 'Clear slot',
  close: 'Close',

  practiceTitle: roundLabel => `${roundLabel} practice`,
  timerVideoButton: 'Timer video',
  endPractice: 'End practice',
  restart: 'Restart',
  start: 'Start',
  resume: 'Resume',
  pause: 'Pause',
  doneCount: 'Landed',
  gained: 'Score',
  possible: 'Max',
  allDone: score => `All done! Score ${score}`,
  allDoneWithTime: (time, score) => `All done in ${time}! Score ${score}`,
  timeUp: (count, score) => `Time's up — ${count} tricks landed, score ${score}`,
  sequentialHint: 'The final must be landed in order — only the current trick can be tapped',
}

const ja: Dict = {
  langLabel: '言語',
  title: 'KWC 2026 練習ツール',
  subtitle: 'けん玉ワールドカップ — 予選・決勝の技選び、採点、タイム練習',

  modes: {
    prelimNormal: {
      label: '予選・ノーマル',
      description:
        '2ラウンド、各3分で5技ずつ、合計10技。レベル1〜10から選択でき、得点は各技のレベルの合計です。',
      rounds: ['第1ラウンド', '第2ラウンド'],
    },
    prelimSpecial: {
      label: '予選・スペシャル',
      description:
        '2ラウンド、各3分で5技ずつ、合計10技。レベル4〜13のみ選択でき、得点は各技のレベルの合計です。',
      rounds: ['第1ラウンド', '第2ラウンド'],
    },
    final: {
      label: '決勝',
      description:
        '3分1ラウンド。全レベルから技数無制限で選べますが、選んだ順番どおりに成功させる必要があります。得点は各技のレベルを2乗した合計です。',
      rounds: ['決勝ルート'],
    },
  },

  dragHint: '技を長押ししてから上下にドラッグすると並べ替えできます（指を離すと確定）',
  dragHintCrossRound: '。第1ラウンドと第2ラウンドの間で移動することもできます',

  statTotal: '合計得点',
  statPicked: '選択済み',
  statMax: '理論上の最高点',

  roundSummary: (filled, count, score, minutes) =>
    `${filled}/${count} 技・${score} 点・${minutes} 分`,
  practice: '練習',
  emptySlot: 'タップして技を選択…',
  deleteSlot: '削除',
  addSlot: '技を追加',
  slotLabel: n => `${n} 技目`,

  ioButton: 'インポート / エクスポート',
  clearMode: 'このモードをクリア',
  clearConfirm: label => `「${label}」の技をすべてクリアしますか？`,

  timerVideo: 'タイム練習動画',
  videoCredit: credit => `動画制作：${credit}`,
  videoCreditLong: credit => `このタイム練習動画は ${credit} さんが制作しました。`,
  openOnYoutube: 'YouTube で開く',
  levelVideos: '技の見本動画',
  levelVideoTitle: level => `レベル ${level} の見本`,
  storageNote:
    '選んだ技はこの端末のブラウザにのみ保存されます。端末を変える場合は「インポート / エクスポート」をご利用ください。',

  ioTitle: '技リストのインポート / エクスポート',
  ioDownload: 'ファイルをダウンロード',
  ioCopy: 'JSON をコピー',
  ioPickFile: 'ファイルから読み込む',
  ioFromText: '下のテキストから読み込む',
  ioExported: 'JSON ファイルを書き出しました',
  ioCopied: 'クリップボードにコピーしました',
  ioCopyFailed: 'コピーに失敗しました。下のテキストを手動で選択してコピーしてください',
  ioImported: '読み込みに成功しました！',
  ioImportedWithWarnings: n => `読み込みましたが、${n} 件の問題があります`,
  ioBadJson: '読み込み失敗：正しい JSON ではありません',

  warning: (w, modeLabel) => {
    switch (w.code) {
      case 'noData':
        return '技のデータが見つかりません'
      case 'badFormat':
        return `${modeLabel}：データ形式が正しくないためスキップしました`
      case 'unknownTrick':
        return `${modeLabel}：技コード ${w.id} が見つからないため空にしました`
      case 'levelOutOfRange':
        return `${modeLabel}：${w.id}（レベル ${w.level}）は選択範囲外のため空にしました`
      case 'duplicate':
        return `${modeLabel}：${w.id} が重複しているため空にしました`
      case 'overflow':
        return `${modeLabel}：${w.max} 技を超えた分は破棄しました`
    }
  },

  pickerTitle: slotLabel => `技を選択・${slotLabel}`,
  pickerSubtitle: (modeLabel, min, max) => `${modeLabel}：レベル ${min}〜${max}・重複不可`,
  searchPlaceholder: '技を検索（英語 / 日本語）',
  filterAll: 'すべて',
  levelChip: lv => `Lv${lv}`,
  noResult: '該当する技が見つかりません',
  levelHeading: lv => `レベル ${lv}`,
  levelPoints: points => `（このモードでは 1 技 ${points} 点）`,
  used: '選択済み',
  clearSlot: 'この枠をクリア',
  close: '閉じる',

  practiceTitle: roundLabel => `${roundLabel} の練習`,
  timerVideoButton: 'タイマー動画',
  endPractice: '練習を終了',
  restart: 'やり直す',
  start: 'スタート',
  resume: '再開',
  pause: '一時停止',
  doneCount: '成功',
  gained: '得点',
  possible: '満点',
  allDone: score => `全技完了！得点 ${score} 点`,
  allDoneWithTime: (time, score) => `全技完了！タイム ${time}、得点 ${score} 点`,
  timeUp: (count, score) => `時間切れ — ${count} 技成功、得点 ${score} 点`,
  sequentialHint: '決勝は順番どおりに成功させる必要があり、現在の技のみタップできます',
}

export const DICT: Record<Lang, Dict> = { zh, en, ja }

// ------------------------------------------------------------------ 招式名稱

/** 依語言決定招式主要／次要顯示名稱（日文介面以日文名為主，其餘以英文名為主） */
export const trickNames = (trick: Trick, lang: Lang) =>
  lang === 'ja' ? { primary: trick.ja, secondary: trick.en } : { primary: trick.en, secondary: trick.ja }

// ------------------------------------------------------------------ 語言狀態

const LANG_STORAGE_KEY = 'kwc2026-lang'

const isLang = (value: unknown): value is Lang => LANGS.some(l => l.key === value)

/** 沒有存過語言時，用瀏覽器語言猜一個 */
const detectLang = (): Lang => {
  if (typeof navigator === 'undefined') return 'en'
  const tag = (navigator.language || '').toLowerCase()
  if (tag.startsWith('zh')) return 'zh'
  if (tag.startsWith('ja')) return 'ja'
  return 'en'
}

export const useKwcLang = () => {
  // SSR 靜態輸出時先用預設值，掛載後才讀本機設定，避免 hydration 不一致
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    let next: Lang | null = null
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
      if (isLang(saved)) next = saved
    } catch {
      // 無痕模式時忽略
    }
    setLangState(next ?? detectLang())
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // 忽略
    }
  }, [])

  return { lang, setLang, t: DICT[lang] }
}
