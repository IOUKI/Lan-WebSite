'use client'

import React, { useEffect, useMemo, useState } from 'react'

type Trick = {
  no: number
  content: string
}

type TrickList = {
  level: number
  title: string
  tricks: Trick[]
}

const SouthJam = () => {
  const [alreadyDownList, setAlreadyDownList] = useState<number[]>([])
  const [currentTrick, setCurrentTrick] = useState<number | null>(null)
  const [p1Score, setP1Score] = useState<number>(0)
  const [p2Score, setP2Score] = useState<number>(0)
  const [currentTricks, setCurrentTricks] = useState<Trick[]>([])
  const [currentTricksLevel, setCurrentTricksLevel] = useState<number>(1)
  const trickList = useMemo<TrickList[]>(() => [
    {
      level: 1,
      title: "初階",
      tricks: [
        { no: 1, content: "蠟燭" },
        { no: 2, content: "皿上來回 11 下" },
        { no: 3, content: "飛行機 - 跳劍" },
        { no: 4, content: "止劍 - 螺旋丸止劍" },
        { no: 5, content: "大鶯 - 收劍" },
        { no: 6, content: "劍頂 - 收劍" },
        { no: 7, content: "世界一周" },
        { no: 8, content: "大皿 - 燕子歸巢大皿 - 止劍" },
        { no: 9, content: "劍手手勢直接地球" },
        { no: 10, content: "轉劍止劍" },
        { no: 11, content: "▲天中殺" },
        { no: 12, content: "▲重力機" },
        { no: 13, content: "▲燈台 - 收劍" },
      ]
    },
    {
      level: 2,
      title: "中階",
      tricks: [
        { no: 1, content: "美國一週" },
        { no: 2, content: "離轉地球" },
        { no: 3, content: "劍頂滑玉" },
        { no: 4, content: "飛行機 - 1.5 拋接止劍" },
        { no: 5, content: "月面 - 一迴旋收" },
        { no: 6, content: "飛行機 - TAP 收" },
        { no: 7, content: "燈台 - 燈上燈 - 收劍" },
        { no: 8, content: "中皿極意 - 收劍" },
        { no: 9, content: "JUGGLE 大皿 - 止劍" },
        { no: 10, content: "一迴旋拋接天中殺" },
        { no: 11, content: "▲抽線飛行機" },
        { no: 12, content: "▲竹馬 - 止劍" },
        { no: 13, content: "▲天中殺快手飛行機" },
      ]
    },
    {
      level: 3,
      title: "高階",
      tricks: [
        { no: 1, content: "直拉拋一迴旋燈台 insta 拋 1.5 飛行機" },
        { no: 2, content: "離轉 - 離轉 - 拋一迴旋燈台 - 二迴旋抓劍收" },
        { no: 3, content: "逆月 - 拋一迴旋燈台 insta 逆一迴旋逆月 - 收劍" },
        { no: 4, content: "裏鶯 - 離心力戰斧 - 收劍" },
        { no: 5, content: "大皿 - 大鶯 - 小皿 - 小鶯 - 中皿 - 中皿極意 - 天中殺收" },
        { no: 6, content: "轉劍世界一周" },
        { no: 7, content: "Sweets special 企鵝收" },
        { no: 8, content: "飛行機 - 1.5 逆拋飛行機" },
        { no: 9, content: "重力機 - 正一迴旋重力機 - 逆一迴旋重力機" },
        { no: 10, content: "一迴旋竹馬 - 馬上馬 - 抓劍收" },
        { no: 11, content: "快圓月拋一迴旋燈 - 一迴旋抓劍收" },
        { no: 12, content: "正月 - 逆月 - 一迴旋正月 - 一迴旋逆月 - 收劍" },
        { no: 13, content: "落雷一迴旋飛行機" },
        { no: 14, content: "2 Tap 拋兩迴旋拋接止劍" },
        { no: 15, content: "嬉皮敲一迴旋飛行機" },
      ]
    }
  ], [])

  // Handle the lottery action
  const handleLottery = () => {
    const availableTricks = currentTricks.filter(trick => !alreadyDownList.includes(trick.no))
    if (availableTricks.length === 0) {
      alert("所有招式已經抽完了！")
      return
    }
    // 生成一個 UInt32Array 陣列，裡面包含一個密碼學安全的隨機數
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);

    // 使用這個隨機數來計算索引
    const randomIndex = randomBuffer[0] % availableTricks.length;
    const selectedTrick = availableTricks[randomIndex]
    setAlreadyDownList([...alreadyDownList, selectedTrick.no])
    setCurrentTrick(selectedTrick.no)
  }

  // Reset the game state
  const handleReset = () => {
    setAlreadyDownList([])
    setCurrentTrick(null)
    setP1Score(0)
    setP2Score(0)
  }

  // Handle score change for player 1 and player 2
  const handleScoreChange = (player: number, change: number) => {
    if (player === 1) {
      setP1Score(prev => Math.max(0, prev + change))
    } else {
      setP2Score(prev => Math.max(0, prev + change))
    }
  }

  useEffect(() => {
    if (currentTricks.length !== 0) return
    const savedLevel = localStorage.getItem('trickLevel')
    const initialLevel = savedLevel ? parseInt(savedLevel, 10) : 1
    const selectedLevel = trickList.find(trick => trick.level === initialLevel)
    if (selectedLevel) {
      setCurrentTricks(selectedLevel.tricks)
      setCurrentTricksLevel(selectedLevel.level)
    }
  }, [currentTricks, setCurrentTricks, trickList, setCurrentTricksLevel])

  return (
    <>
      <div className="w-full px-3 mb-5 grid grid-cols-3 gap-3">
        {trickList.map((trick) => (
          <button
            key={trick.level}
            onClick={() => {
              setCurrentTricks(trick.tricks)
              setCurrentTricksLevel(trick.level)
              handleReset()
              localStorage.setItem('trickLevel', String(trick.level))
            }}
            className={`py-3 px-4 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent ${currentTricksLevel === trick.level ? 'bg-neutral-800 text-yellow-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            {trick.title}
          </button>
        ))}
      </div>
      <div className="w-full px-3 grid grid-cols-2 gap-4">
        <button type="button" className="py-3 px-4 col-span-2 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="trick-list-modal" data-hs-overlay="#trick-list-modal">
          招式列表
        </button>
        <button
          type="button"
          onClick={handleLottery}
          className="py-3 px-4 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          抽招
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="py-3 px-4 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent bg-gray-600 text-white hover:bg-gray-700 focus:outline-hidden focus:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          重置
        </button>
        <div className="bg-gray-700 p-2 rounded-lg text-white">
          <div className="w-full mb-2 text-xl">
            <span>P1分數</span>
          </div>
          <div className="text-3xl flex items-center justify-between">
            <button
              onClick={() => handleScoreChange(1, -1)}
              className="bg-gray-800 rounded-lg"
            >
              <i className="bi bi-dash"></i>
            </button>
            <span>{p1Score}</span>
            <button
              onClick={() => handleScoreChange(1, 1)}
              className="bg-gray-800 rounded-lg"
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg text-white">
          <div className="w-full mb-2 text-xl">
            <span>P2分數</span>
          </div>
          <div className="text-3xl flex items-center justify-between">
            <button
              onClick={() => handleScoreChange(2, -1)}
              className="bg-gray-800 rounded-lg"
            >
              <i className="bi bi-dash"></i>
            </button>
            <span>{p2Score}</span>
            <button
              onClick={() => handleScoreChange(2, 1)}
              className="bg-gray-800 rounded-lg"
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
      {currentTrick !== null ? (
        <div className="mt-7 px-3">
          <div className="">
            <p className="text-center text-xl font-semibold mb-2">
              抽取的招式
            </p>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-semibold text-center text-white">
                {currentTricks.find(trick => trick.no === currentTrick)?.content}
              </p>
            </div>
          </div>
        </div>
      ) : (
        null
      )}
      <div className="mt-7 px-3">
        <h2 className="text-lg font-semibold">已經抽過的招式：</h2>
        <ul className="list-disc pl-5">
          {alreadyDownList.map((trickNo) => (
            <li key={trickNo} className="">{currentTricks.find(trick => trick.no === trickNo)?.content}</li>
          ))}
        </ul>
      </div>
      <div id="trick-list-modal" className="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-[100] opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" aria-labelledby="trick-list-modal-label">
        <div className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
          <div className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
            <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
              <h3 id="trick-list-modal-label" className="font-bold text-gray-800 dark:text-white">
                招式列表
              </h3>
              <button type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600" aria-label="Close" data-hs-overlay="#trick-list-modal">
                <span className="sr-only">Close</span>
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="rounded-lg border border-gray-200 dark:border-neutral-700">
                <table className="w-full text-left text-sm text-gray-500 dark:text-neutral-400">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-neutral-800 dark:text-neutral-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">No.</th>
                      <th scope="col" className="px-6 py-3">招式</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-800 dark:divide-neutral-700">
                    {currentTricks.map((trick) => (
                      <tr key={trick.no} className={`hover:bg-gray-50 dark:hover:bg-neutral-700 ${alreadyDownList.includes(trick.no) ? 'bg-gray-100 dark:bg-neutral-600' : ''}`}>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{trick.no}</td>
                        <td className="px-6 py-4 dark:text-white">{trick.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200 dark:border-neutral-700">
              <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" data-hs-overlay="#trick-list-modal">
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SouthJam