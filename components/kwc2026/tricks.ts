// KWC 2026 招式表資料
// 資料來源：kwc2026tricks.txt
// 注意：來源招式表中 Level 3 與 Level 4 的十招內容完全相同（原始表格的重複），
//       此處如實收錄，待官方更新後只需修改下方 RAW[4] 即可。

export type Trick = {
  id: string
  level: number
  no: number
  en: string
  ja: string
}

// 計時練習影片（由 Nick Gallagher 製作）
export const PRACTICE_VIDEO = {
  youtubeId: 'uV9MtfkuyYg',
  url: 'https://www.youtube.com/watch?v=uV9MtfkuyYg',
  credit: 'Nick Gallagher',
}

// [英文名稱, 日文名稱]
const RAW: Record<number, [string, string][]> = {
  1: [
    ['Wave (Big cup)', '波（大皿）'],
    ['Scooping airplane', 'どじょうすくい'],
    ['Lazy lighthouse', 'けん玉つみき灯台'],
    ['Tama drop base cup catch', '中皿おとし玉'],
    ['Hula hoop (Big cup)', 'フラフープ（大皿）'],
    ['Hanging, Two hand catch', 'つるし～両手キャッチ'],
    ['Easy big cup, Walk 5 steps', '手のせ大皿ウォーク5歩'],
    ['Easy big cup, squat', '手のせ大皿スクワット'],
    ['Easy big cup', '手のせ大皿'],
    ['Easy big cup, Hop', '手のせ大皿ホップ'],
  ],
  2: [
    ['Candlestick', 'ろうそく'],
    ['Big cup', '大皿'],
    ['Small cup, Big cup, Base cup', '小皿～大皿～中皿'],
    ['Easy big cup, Hopscotch', '手のせ大皿～けんけんぱ'],
    ['Baseball', '野球'],
    ['Takoyaki', 'たこやき'],
    ['Easy big cup, Spike', '手のせ大皿～けん'],
    ['Moshikame x 11', 'もしかめ11回'],
    ['Hanging clap catch', '手拍子つるし持ち'],
    ['Pull up spike (Spin or No spin)', 'とめけん（まわしけん可）'],
  ],
  3: [
    ['Tama grip, Throw to big cup', 'ず～まスロー大皿'],
    ['Airplane', '飛行機'],
    ['Around Japan', '日本一周'],
    ['Around the world', '世界一周'],
    ['Moshikame x 10 or more, Spike', 'もしかめ10回以上～けん'],
    ['Lighthouse, In', '灯台～さかおとし'],
    ['Stuntplane', 'すくいけん'],
    ['Swing spike', 'ふりけん'],
    ['Pull up spike (Spin or No spin), Flying top', 'とめけん（まわしけん可）～たけとんぼ'],
    ['Downspike', 'ダウンスパイク'],
  ],
  4: [
    ['Spike, Flying top bungee kenflip spike', 'とめけん～たけとんぼバンジーけんフリップけん'],
    ['Jumping stick', 'はねけん'],
    ['Around Europe', 'ヨーロッパ一周'],
    ['Stuntplane fasthand', 'すくいけんファストハンド'],
    ['Base cup, Swap in', '中皿～スワップさかおとし'],
    ['1 turn lighthouse, Tradespike', '1回転灯台～けん'],
    ['Bird, 1 turn spike', 'うぐいす～回転けん'],
    ['Lunar, Flip in', '月面着陸～1回転さかおとし'],
    ['Flamingo takoyaki on foot', 'フラミンゴ足たこやき'],
    ['Airplane, Base cup, Downspike', 'レジェンド'],
  ],
  5: [
    ['Whirlpool spike', 'うずしおふりけん'],
    ['Jumping strick, Inward jumping stick', 'はねけん～うらはねけん'],
    ['Around USA', 'ＵＳＡ一周'],
    ['Whirlwind', 'ワールウィンド'],
    ['Juggle big cup, Spike', 'ジャグル大皿～けん'],
    ['Stilt, Flip in', 'たけうま～1回転さかおとし'],
    ['Handlestall, 1 turn spike', '中皿極意～回転けん'],
    ['Inward lunar, Lunar, Lighthouse, In', 'うら月面～月面～灯台～さかおとし'],
    ['Tap flip in', 'タップ1回転イン'],
    ['Spacewalk', '宇宙遊泳'],
  ],
  6: [
    ['Juggle spike', 'ジャグルとめけん'],
    ['Airplane, 1.5 swap spike', '飛行機～1.5回転スワップけん'],
    ['Inward 1 turn lighthouse, Inward lighthouse flip, Inward flip in', 'うら1回転灯台～うら灯台とんぼ返り～うら1回転さかおとし'],
    ['Double whirlwind', 'ダブルワールウィンド'],
    ['Double gunslinger spike', '2回転風車けん'],
    ['Stilt flip, Flip in', 'たけうまとんぼ返り～1回転さかおとし'],
    ['2 turn airplane, Double jumping stick', '2回転飛行機～2回転はねけん'],
    ['Inward lunar, Flip cushion tap inward lunar, In', 'うら月面～1回転クッションタップうら月面～さかおとし'],
    ['Foot spike', '足けん'],
    ['Lightning drop swap spike', '稲妻おとしスワップけん'],
  ],
  7: [
    ['Tap juggle spike', 'タップジャグルけん'],
    ['Airplane, 1.5 swap juggle spike', '飛行機～1.5回転スワップジャグルけん'],
    ['Around stall, 1 turn spike', 'ふち一周～回転けん'],
    ['Bird, Kenflip bird, 1 turn spike', 'うぐいす～けんフリップうぐいす～回転けん'],
    ['1 turn lighthouse, Tap lighthouse, Reverse tap lighthouse, Tradespike', '1回転灯台～タップ灯台往復～けん'],
    ['Kengrp underbird, Pressure underbird, Candle grip underbird, Swap in', 'アンダーバード～遠心力アンダーバード～ろうそくアンダーバード～さかおとし'],
    ['Wing over the valley, 1 turn spike', 'ウィング渡り～回転けん'],
    ['Around downspike fasthand', 'ダウンスパイクファストハンド一周'],
    ['Moshikame x 100 or more, Spike', 'もしかめ100回以上～けん'],
    ['1 turn lighthouse, Swap toss lighthouse, Stuntplane fasthand', '1回転灯台～スワップトス灯台～すくいけんファストハンド'],
  ],
  8: [
    ['2 tap juggle spike', '2タップジャグルけん'],
    ['Airplane, 1.5 swap juggle bird, 1 turn spike', '飛行機～1.5回転スワップジャグルうぐいす～回転けん'],
    ['1-2-3 lighthouse flip, Tradespike', '灯台とんぼ返り1－2－3～けん'],
    ['Kenflip juggle kenflip juggle spike', 'マテオチャンス'],
    ['Juggle spike, 2 juggle spike, 3 juggle spike', 'ジャグルけん～2ジャグルけん～3ジャグルけん'],
    ['3 gunslinger bird, 1 turn spike', '3回転風車うぐいす～回転けん'],
    ['Stilt over the valley, Axe over the valley, Tradespike', 'たけうま渡り～まさかり渡り～けん'],
    ['Handlestall, Earth turn handlestall, Inward earth turn handlestall, 1 turn spike', '中皿極意～中皿極意地球まわし～うら中皿極意地球まわし～回転けん'],
    ['1 turn arm bounce swap toss arm bounce flip in', '1回転アームバウンストスアームバウンス1回転さかおとし'],
    ['Kenflip swap stuntplane fasthand', 'けんフリップスワップすくいけんファストハンド'],
  ],
  9: [
    ['10 or more juggle → spike', 'ジャグル10回以上→けん'],
    ['Airplane, Big tap x 2 → swap juggle spike', '飛行機～ビッグタップ×2→スワップジャグルけん'],
    ['1-2-3 whirlwind', 'ワールウィンド1－2－3'],
    ['3 kenflip → inward 3 kenflip juggle spike', '3回転けんフリップ→うら3回転けんフリップジャグルけん'],
    ['Airplane, 1.5 swap gunslinger 1.5 toss in', '飛行機～1.5回転スワップ風車1.5回転トスイン'],
    ['Stilt over the valley, Swap bird over the valley, 1 turn spike', 'たけうま渡り～うぐいすの谷渡り～回転けん'],
    ['Wing over the valley, Handlestall, 1 turn spike', 'ウィング渡り～中皿極意～回転けん'],
    ['Airplane, 3.5 flip swap 3.5 kenflip juggle downspike', '飛行機～3.5回転フリップスワップ3.5回転けんフリップジャグルダウンスパイク'],
    ['Floor spike tap spike hold, Downspike', 'フロアけん先タップおこし中皿～ダウンスパイク'],
    ['Mooncircle mooncircle kenflip-flip swing spike', '胡蝶の舞けんフリップフリップふりけん'],
  ],
  10: [
    ['Airplane, Cushion tap swap ghost toss tap flip swap toss cushion tap in', '飛行機～クッションタップスワップゴーストトスタップフリップスワップトスクッションタップイン'],
    ['3 kenflip → 3 kenflip juggle 3.5 toss in', '3回転けんフリップ→3回転けんフリップジャグル3.5回転トスイン'],
    ['Spike, Hippie 3 flip swap spike', 'スパイク～ヒッピー3回転フリップスワップけん'],
    ['Airplane, 4 tap swap 1.5 toss in', '飛行機～4タップスワップ1.5回転トスイン'],
    ['Kenflip toss cloud bounce juggle kenflip spike', 'けんフリップトスクラウドバウンスジャグルけんフリップけん'],
    ['3 tap 3 kenflip juggle spike', '3タップ3回転けんフリップジャグルけん'],
    ['Around the ken, Flip in', 'たけうまころがし～1回転さかおとし'],
    ['Backward inward lunar, 1.5 backflip lunar, 1.5 backflip inward lunar, Flip swap spike', '前ふりバックワードうら月面～1.5回転バックフリップ月面～1.5回転バックフリップうら月面～1回転スワップけん'],
    ['Flamingo swing spike, Flamingo whirlwind (Under playing side leg)', 'フラミンゴふりけん～フラミンゴワールウィンド（持ち手側の足の下）'],
    ['Gunslinger toss lighthouse, Inward lighthouse flip insta 3 flip swap gunslinger spike', '風車トス灯台～うら灯台とんぼ返りインスタ3回転フリップスワップ風車けん'],
  ],
  11: [
    ['Kenflip → 2 kenflip juggle 3 kenflip spike', 'けんフリップ→2回転けんフリップジャグル3回転けんフリップけん'],
    ['Bird, Inward toss tap swap kenflip bird, 1 turn spike', 'うぐいす～うらトスタップスワップけんフリップうぐいす～回転けん'],
    ['Cushion tap swap 2 toss cushion tap swap 3 toss cushion tap swap spike', 'クッションタップスワップ2回転トスクッションタップスワップ3回転トスクッションタップスワップけん'],
    ['Kenflip inward kenflip toss tap swap inward toss tap swap spike', 'けんフリップうらけんフリップトスタップスワップうらトスタップスワップけん'],
    ['Stilt flip 1-2-3, Flip in', 'たけうまとんぼ返り1－2－3～1回転さかおとし'],
    ['Big tap x 2 → juggle handlestall, Downspike fasthand', 'ビッグタップ×2→ジャグル中皿極意～ダウンスパイクファストハンド'],
    ['4 tap juggle kenflip bird, 1 turn spike', '4タップジャグルけんフリップうぐいす〜回転けん'],
    ['Pull up tap inward 2 flip swap ghost toss tap inward 2 flip inward lunar, Tap inward 2 flip swap spike', 'プルアップタップうら2回転スワップゴーストトスタップうら2回転うら月面〜タップうら2回転スワップけん'],
    ['Handlestall, Swap stilt over the valley, Swap handlestall, Downspike', '中皿極意～たけうま渡り～中皿極意～ダウンスパイク'],
    ['Stuntplane, 3 flip stuntplane penguin fasthand', 'すくいけん～3回転フリップすくいけんペンギンファストハンド'],
  ],
  12: [
    ['1.5 gooncircle 1 turn stuntplane fasthand', '稲妻はやて1回転すくいけんファストハンド'],
    ['6 tap swap toss lighthouse insta 3 flip swap 3 kenflip juggle spike', '6タップスワップトス灯台インスタ3回転フリップスワップ3回転けんフリップジャグルけん'],
    ['1-2-3 lunar barrel roll, In', '月面バレルロール1－2－3～さかおとし'],
    ['Airplane, 1.5 swap kenflip-flip-flip 1.5 toss in', '飛行機〜1.5回転スワップけんフリップフリップフリップ1.5回転トスイン'],
    ['Airplane, 3 tap swap inward 2.5 toss tap swap inward 3.5 toss in', '飛行機〜3タップスワップうら2.5回転トスタップスワップうら3.5回転トスイン'],
    ['1-2-3 lighthouse flip insta inward lighthouse flip, Tradespike', '灯台とんぼ返りインスタうらとんぼ返り1－2－3〜けん'],
    ['Inward stilt, 4 inward stilt flip, Flip in', 'うらたけうま～4回転うらたけうまとんぼ返り～1回転さかおとし'],
    ['Airplane, 4 tap swap inward gunslinger downspike fasthand', '飛行機～4タップスワップうら風車ダウンスパイクファストハンド'],
    ['Pirouette hanging spike', 'ピルエットつるしとめけん'],
    ['Around Tunbridge Wells', 'タンブリッジウェルズ一周'],
  ],
  13: [
    ['Kenflip juggle kenflip-flip juggle kenflip-flip-flip spike', 'けんフリップジャグルけんフリップフリップジャグルけんフリップフリップフリップけん'],
    ['Big tap x 4 → juggle ghost stuntplane fasthand', 'ビッグタップ×4→ジャグルゴーストすくいけんファストハンド'],
    ['2 tap lighthouse, 4 tap lighthouse, 6 tap lighthouse, Tradespike', '2タップ灯台〜4タップ灯台〜6タップ灯台〜けん'],
    ['Bird, Toss 2 tap swap 1.5 kenflip juggle 2 inward gunslinger 1.5 kenflip juggle toss 2 tap swap bird, Downspike', 'うぐいす～トス2タップスワップ1.5回転けんフリップジャグル2回転うら風車1.5回転けんフリップジャグルトス2タップスワップうぐいす～ダウンスパイク'],
    ['1 turn lunar, 6 tap flip lunar, 1 turn in', '1回転月面～6タップ1回転月面～1回転さかおとし'],
    ['Tap 1.5 swap handlestall, Toss tap 1.5 swap handlestall, Downspike', 'タップ1.5回転スワップ中皿極意～トスタップ1.5回転スワップ中皿極意～ダウンスパイク'],
    ['Wing, Juggle 3 kenflip juggle wing, 1 turn spike', 'ウィング～ジャグル3回転けんフリップジャグルウィング～回転けん'],
    ['Backward inward lunar, Tap 1.5 tap swap kenflip toss tap 1.5 tap backward inward lunar, Flip cushion tap in', '前ふりバックワードうら月面〜タップ1.5回転タップスワップけんフリップトスタップ1.5回転タップバックワードうら月面〜1回転クッションタップイン'],
    ['Spike, Whirlwind around-the-back kengrip catch spike', 'スパイク～ワールウィンドアラウンドバックけんグリップキャッチスパイク'],
    ['3 kenflip 3 kenflip 3 toss stuntplane fasthand', '3回転けんフリップ3回転けんフリップ3回転トスすくいけんファストハンド'],
  ],
  14: [
    ['Big tap 3 tap juggle kenflip 3 kenflip spike', 'ビッグタップ3タップジャグルけんフリップ3けんフリップけん'],
    ['5 jumping stick, Inward 5 jumping stick', '5回転はねけん～うら5回転はねけん'],
    ['Inward lunar, Forward tap 3 flip swap 3 kenflip inward 3 toss inward lunar, Forward tap 3 flip swap spike', 'うら月面～フォワードタップ3回転フリップスワップ3回転けんフリップうら3回転トスうら月面～フォワードタップ3回転フリップスワップけん'],
    ['Airplane, 8 tap swap kenflip downspike fasthand', '飛行機～8タップスワップけんフリップダウンスパイクファストハンド'],
    ['3 tap lighthouse insta 3 lighthouse flip insta toss arm bounce inward 3 flip arm lighthouse, Stuntplane fasthand', '3タップ灯台インスタ3回転とんぼ返りインスタトスアームバウンスうら3回転アーム灯台～すくいけんファストハンド'],
    ['Airplane, 10 tap juggle handlestall, 1 turn spike', '飛行機～10タップジャグル中皿極意～回転けん'],
    ['Big wing, Toss lighthouse insta swap 3 kenflip toss lighthouse insta swap small wing, 1 turn spike', '大皿極意～トス灯台インスタスワップ3回転けんフリップトス灯台インスタスワップ小皿極意～回転けん'],
    ['Stilt, Typhoon 3 stilt flip, Typhoon flip in', 'たけうま～タイフーン3回転たけうまとんぼ返り～タイフーン1回転さかおとし'],
    ['2 gunslinger bird, 2 gunslinger bird over the valley, 2 gunslinger handlestall, 2 gunslinger spike', '2回転風車うぐいす～2回転風車うぐいすの谷渡り～2回転風車中皿極意～2回転風車けん'],
    ['Stuntplane, 5 stuntplane flip stuntplane fasthand', 'すくいけん～5回転すくいけんフリップすくいけんファストハンド'],
  ],
  15: [
    ['4 turn inward lunar, 4 back flip inward lunar, Inward 4 flip in', '4回転うら月面～4回転バックフリップうら月面～うら4回転さかおとし'],
    ['3 kenflip - 3 flip - 3 flip juggle 9 tap swap spike', '3回転けんフリップ3フリップ3フリップジャグル9タップスワップけん'],
    ['1-2-3-4-5 stuntplane flip', 'すくいけんフリップ1-2-3-4-5'],
    ['Inward lunar, Knee bounce inward 3 flip juggle ghost toss knee bounce inward 3 flip inward lunar, Tradespike', 'うら月面～リフティングうら3回転フリップジャグルゴーストトスリフティングうら3回転うら月面～けん'],
    ['6 tap swap toss lighthouse insta 3 lighthouse flip insta swap juggle 3 kenflip - 3 flip juggle 3 kenflip stuntplane fasthand', '6タップスワップトス灯台インスタ3回転灯台とんぼ返りインスタスワップジャグル3回転けんフリップ3回転フリップジャグル3回転けんフリップすくいけんファストハンド'],
    ['Candle around stall, 1 turn spike', 'ろうそく返しふち一周～回転けん'],
    ['1 turn lighthouse insta 3 flip 3 tap lighthouse insta 3 lighthouse flip insta 3 flip 3 tap flip in', '1回転灯台インスタ3回転フリップ3タップ灯台インスタ3回転灯台とんぼ返りインスタ3回転フリップ3タップフリップイン'],
    ['Bosch 2026', 'ボッシュ2026'],
    ['Arm landing, Tama toss arm handlestall, Spike', 'アーム着陸～玉トスアーム中皿極意～けん'],
    ['Stuntplane, 3 stuntplane flip cushion tap swap 3 kenflip juggle 2 tap big tap 3 tap juggle 3 kenflip juggle 3 kenflip 3 kenflip cushion tap stuntplane fasthand', 'すくいけん～3回転すくいけんクッションフリップタップスワップ3回転けんフリップジャグル2タップビッグタップ3タップジャグル3回転けんフリップジャグル3回転けんフリップ3回転けんフリップクッションタップすくいけんファストハンド'],
  ],
}

export const MIN_LEVEL = 1
export const MAX_LEVEL = 15

export const TRICKS: Trick[] = Object.keys(RAW)
  .map(Number)
  .sort((a, b) => a - b)
  .flatMap(level =>
    RAW[level].map(([en, ja], i) => ({
      id: `L${level}-${String(i + 1).padStart(2, '0')}`,
      level,
      no: i + 1,
      en,
      ja,
    }))
  )

export const TRICK_MAP: Record<string, Trick> = TRICKS.reduce((acc, trick) => {
  acc[trick.id] = trick
  return acc
}, {} as Record<string, Trick>)

export const getTrick = (id: string | null | undefined): Trick | undefined =>
  id ? TRICK_MAP[id] : undefined
