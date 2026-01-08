'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Trick = {
  no: number;
  content: string;
};

type TrickList = {
  level: number;
  title: string;
  tricks: Trick[];
};

const TKO2026 = () => {
  const [lastRoundHistory, setLastRoundHistory] = useState<number[]>([]); // 紀錄上一回合抽過的招式，用於防重複
  const [alreadyDownList, setAlreadyDownList] = useState<number[]>([]);
  const [currentTrick, setCurrentTrick] = useState<number | null>(null);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [currentTricks, setCurrentTricks] = useState<Trick[]>([]);
  const [currentTricksLevel, setCurrentTricksLevel] = useState<number>(1);

  const trickList = useMemo<TrickList[]>(() => [
    {
      level: 1,
      title: "新手組🔰",
      tricks: [
        { no: 1, content: "非慣用手殺手中皿" },
        { no: 2, content: "飛行機" },
        { no: 3, content: "止劍" },
        { no: 4, content: "大皿 - 膝蓋大皿" },
        { no: 5, content: "空中飛人" },
        { no: 6, content: "簡單止劍 - 螺旋丸止劍" },
        { no: 7, content: "簡單大鶯 - 收劍" },
        { no: 8, content: "(止劍狀態) 抽線接劍" },
        { no: 9, content: "▲ 天中殺" },
        { no: 10, content: "▲ 殺手手勢皿一周" },
      ]
    },
    {
      level: 2,
      title: "初階組🌟",
      tricks: [
        { no: 1, content: "歐洲一周" },
        { no: 2, content: "月面 - 一迴旋收" },
        { no: 3, content: "大皿 - 茶壺 - 收劍" },
        { no: 4, content: "飛行機 - 中皿 - 天中殺" },
        { no: 5, content: "小鶯 - 地球收" },
        { no: 6, content: "小指止劍 - 收劍" },
        { no: 7, content: "大皿撈金魚 - 收劍" },
        { no: 8, content: "燈台 - 抓劍收" },
        { no: 9, content: "重力機快手止劍" },
        { no: 10, content: "招財貓收劍" },
        { no: 11, content: "▲ 竹馬 - 收劍" },
        { no: 12, content: "▲ 逆飛行球 - 地球" }
      ]
    },
    {
      level: 3,
      title: "進階組🔥",
      tricks: [
        { no: 1, content: "非慣用手重力機快手止劍" },
        { no: 2, content: "歐洲鶯" },
        { no: 3, content: "兩圈跳劍殺快手" },
        { no: 4, content: "圓月殺法放燈 - 收劍" },
        { no: 5, content: "竹馬渡玉 - 一迴旋收" },
        { no: 6, content: "逆一迴旋月面 - 月上月 - 逆一迴旋收" },
        { no: 7, content: "殺手中皿極意 - 收劍" },
        { no: 8, content: "丹麥一周" },
        { no: 9, content: "兩圈離轉地球" },
        { no: 10, content: "拋接燈台 - 1.5 Cush in" },
        { no: 11, content: "▲ 飛行機 - tap 逆一迴旋 in - 一迴旋 Cush in" },
        { no: 12, content: "▲ 蠟燭 - 離轉蠟燭 - 止劍" },
        { no: 13, content: "▲ 轉劍 late 轉劍止劍" },
      ]
    },
    {
      level: 4,
      title: "挑戰組👑",
      tricks: [
        { no: 1, content: "三圈跳劍" },
        { no: 2, content: "逆月面 - 3 tap 一迴旋逆月 - 止劍" },
        { no: 3, content: "拉二迴旋轉劍 兩圈拋一迴旋飛行機" },
        { no: 4, content: "非慣用手離轉地球" },
        { no: 5, content: "逆 juggle ghost juggle 正 juggle 止劍" },
        { no: 6, content: "中皿極意 - 太陽極意 - 大鶯 - 小鶯 - 收劍" },
        { no: 7, content: "直拉夢幻小竹馬 - 夢幻馬上馬 - 抓劍收" },
        { no: 8, content: "直拉 tap 正一迴旋飛行機 - 0.5 tap 正一迴旋 in" },
        { no: 9, content: "一迴旋重力機 - 一迴旋重力機快手止劍" },
        { no: 10, content: "一迴旋燈台 - 逆燈上燈 insta juggle 燈台 insta 逆一迴旋收" },
        { no: 11, content: "▲ 轉劍 juggle 轉劍止劍" },
        { no: 12, content: "▲ 兩圈離轉 juggle 2 tap juggle 止劍" },
        { no: 13, content: "▲ 月面 - 月上月 1 2 3 - 收劍" },
      ]
    }
  ], []);

  // Handle the lottery action
  const handleLottery = () => {
    // 找出本局尚未抽過的招式
    const availableTricks = currentTricks.filter(trick => !alreadyDownList.includes(trick.no));

    if (availableTricks.length === 0) {
      alert("所有招式已經抽完了！");
      return;
    }

    // 進階篩選：從「本局未抽過」中，再過濾掉「上一局抽過」的招式
    const highPriorityTricks = availableTricks.filter(trick => !lastRoundHistory.includes(trick.no));

    // 決定抽籤池：如果還有「全新未重複」的招式，優先從這裡抽；否則只能從剩下的抽
    const poolToUse = highPriorityTricks.length > 0 ? highPriorityTricks : availableTricks;

    // 生成隨機數
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);

    // 使用隨機數計算索引
    const randomIndex = randomBuffer[0] % poolToUse.length;
    const selectedTrick = poolToUse[randomIndex];

    setAlreadyDownList([...alreadyDownList, selectedTrick.no]);
    setCurrentTrick(selectedTrick.no);
  };

  // Reset the game state
  const handleReset = () => {
    // 重置時，將當前的清單存入歷史紀錄，作為下一局的排除依據
    setLastRoundHistory([...alreadyDownList]);

    setAlreadyDownList([]);
    setCurrentTrick(null);
    setP1Score(0);
    setP2Score(0);
  };

  // Handle score change for player 1 and player 2
  const handleScoreChange = (player: number, change: number) => {
    if (player === 1) {
      setP1Score(prev => Math.max(0, prev + change));
    } else {
      setP2Score(prev => Math.max(0, prev + change));
    }
  };

  useEffect(() => {
    if (currentTricks.length !== 0) return;
    const savedLevel = localStorage.getItem('trickLevel');
    const initialLevel = savedLevel ? parseInt(savedLevel, 10) : 1;
    const selectedLevel = trickList.find(trick => trick.level === initialLevel);
    if (selectedLevel) {
      setCurrentTricks(selectedLevel.tricks);
      setCurrentTricksLevel(selectedLevel.level);
    }
  }, [currentTricks, setCurrentTricks, trickList, setCurrentTricksLevel]);

  return (
    <>
      {/* 定義流動動畫的 CSS */}
      <style>{`
        @keyframes tech-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .tech-gradient-text {
          /* 定義漸層顏色：青 -> 藍 -> 紫 -> 青 (循環) */
          background: linear-gradient(to right, #22d3ee, #3b82f6, #a855f7, #22d3ee);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: tech-flow 3s linear infinite;
        }

        .tech-gradient-bg {
          /* 使用較深的色階：Cyan-800 -> Blue-800 -> Purple-800 */
          background: linear-gradient(110deg, #155e75, #1e40af, #6b21a8, #155e75);
          background-size: 200% auto;
          animation: tech-flow 3s linear infinite;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); /* 增加一點藍色光暈 */
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="w-full flex justify-center mb-7 mt-2">
        <h3 className="text-2xl md:text-4xl font-extrabold tracking-widest tech-gradient-text drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          2026 TKO 指定賽練習
        </h3>
      </div>
      <div className="w-full px-3 mb-4 grid grid-cols-3 gap-4">
        {trickList.map((trick, index) => (
          <button
            key={trick.level}
            onClick={() => {
              setCurrentTricks(trick.tricks);
              setCurrentTricksLevel(trick.level);

              // 切換難度時，應該完全重置歷史紀錄，因為不同難度的招式編號意義不同
              setLastRoundHistory([]);
              handleReset();

              localStorage.setItem('trickLevel', String(trick.level));
            }}
            className={`
              ${index === 3 ? "col-span-3" : ""}
              ${currentTricksLevel === trick.level ? 'tech-gradient-bg text-yellow-300 scale-100' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-transparent'}
              py-3 px-4 inline-flex items-center justify-center gap-x-2 text-xl font-medium rounded-lg border border-transparent
            `}
          >
            {trick.title}
          </button>
        ))}
      </div>
      <div className="w-full px-3 grid grid-cols-2 gap-4">
        <button
          type="button"
          className="py-3 px-4 col-span-2 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-black border-transparent dark:bg-gray-700 dark:border-none disabled:opacity-50 disabled:pointer-events-none"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="trick-list-modal"
          data-hs-overlay="#trick-list-modal"
        >
          招式列表
        </button>
        <button
          type="button"
          onClick={handleLottery}
          className="py-3 px-4 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent bg-blue-600 text-white focus:outline-hidden focus:bg-blue-600 disabled:opacity-50 disabled:pointer-events-none transition-transform active:scale-90"
        >
          抽招
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="py-3 px-4 inline-flex items-center justify-center gap-x-2 text-3xl font-medium rounded-lg border border-transparent bg-gray-500 text-white focus:outline-hidden focus:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition-transform active:scale-90"
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
        {currentTrick !== null ? (
          <div className="col-span-2">
            <div className="bg-gray-200 dark:bg-slate-800 p-2 rounded-lg">
              <p className="text-center text-xl font-semibold mb-2">
                當前招式
              </p>
              <div className="">
                <p className="text-2xl font-semibold text-center">
                  {currentTricks.find(trick => trick.no === currentTrick)?.content}
                </p>
              </div>
            </div>
          </div>
        ) : (
          null
        )}
      </div>
      <div className="mt-7 px-3">
        <h2 className="text-lg font-semibold">抽招紀錄：</h2>
        <ul className="list-disc pl-5">
          {alreadyDownList.map((trickNo) => (
            <li key={trickNo} className="text-lg">{currentTricks.find(trick => trick.no === trickNo)?.content}</li>
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
                      <tr key={trick.no} className={alreadyDownList.includes(trick.no) ? 'bg-gray-100 dark:bg-neutral-600' : ''}>
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
  );
};

export default TKO2026;