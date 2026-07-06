/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type React from 'react';
import confetti from 'canvas-confetti';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

type HistoryEvent = {
  id: string;
  text: string;
  order: number;
};

type Score = {
  name: string;
  time: number;
};

const INITIAL_EVENTS: HistoryEvent[] = [
  { id: '1', text: "荷蘭人建城 (1624)", order: 1 },
  { id: '2', text: "鄭成功來台 (1662)", order: 2 },
  { id: '3', text: "清領時期 (1683)", order: 3 },
  { id: '4', text: "日治時期 (1895)", order: 4 },
];

const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function App() {
  const [cards, setCards] = useState<HistoryEvent[]>(() => shuffle(INITIAL_EVENTS));
  const [slots, setSlots] = useState<(HistoryEvent | null)[]>([null, null, null, null]);
  const [message, setMessage] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [won, setWon] = useState<boolean>(false);
  const [finalTime, setFinalTime] = useState<number>(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const q = query(collection(db, 'scores'), orderBy('time', 'asc'), limit(5));
    const querySnapshot = await getDocs(q);
    const scores: Score[] = [];
    querySnapshot.forEach((doc) => {
      scores.push(doc.data() as Score);
    });
    setLeaderboard(scores);
  };

  const saveScore = async (name: string, time: number) => {
    await addDoc(collection(db, 'scores'), { name, time });
    await fetchLeaderboard();
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.classList.add('opacity-50');
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-200');
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-200');
  };

  const onDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-200');
    const cardId = e.dataTransfer.getData('text/plain');
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
      const newSlots = [...slots];
      newSlots[slotIndex] = card;
      setSlots(newSlots);
      setCards(cards.filter(c => c.id !== cardId));
    }
  };

  const checkAnswer = () => {
    if (slots.some(s => s === null)) {
      setMessage("請先填滿所有時間軸槽位！");
      return;
    }
    
    const isCorrect = slots.every((s, i) => s?.order === i + 1);
    if (isCorrect) {
      const time = (Date.now() - startTime) / 1000;
      setFinalTime(time);
      setWon(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setMessage("太棒了！順序完全正確！");
    } else {
      setMessage("順序還有點不對喔，再試試看！");
    }
  };

  const resetGame = () => {
    setCards(shuffle(INITIAL_EVENTS));
    setSlots([null, null, null, null]);
    setMessage(null);
    setWon(false);
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center font-sans">
      <div className="w-full text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">台灣歷史事件排序遊戲</h1>
        <p className="text-slate-500 text-lg">請將上方的歷史事件卡片拖曳至下方的正確時間軸順序中。</p>
      </div>
      
      <div className="flex gap-6 mb-12 flex-wrap justify-center">
        {cards.map(card => (
          <div 
            key={card.id} 
            draggable 
            onDragStart={(e) => onDragStart(e, card.id)}
            onDragEnd={onDragEnd}
            className="w-52 h-40 bg-white rounded-lg shadow-md border border-slate-200 p-5 flex flex-col justify-center items-center text-center cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all"
          >
            <h3 className="text-lg font-bold text-slate-800">{card.text}</h3>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-4xl h-48 flex items-center justify-between px-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-300 -translate-y-1/2 z-0"></div>
        {slots.map((slot, index) => (
          <div 
            key={index} 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className="relative z-10 w-48 h-32 border-2 border-dashed border-slate-300 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-medium transition-colors hover:bg-slate-200"
          >
            {slot ? (
              <div className="bg-blue-100 p-3 text-sm font-medium text-slate-800 rounded">{slot.text}</div>
            ) : (
              <span>槽位 {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={checkAnswer}
        className="mt-12 px-12 py-4 bg-blue-600 text-white rounded-full font-bold text-xl shadow-lg hover:bg-blue-700 transition-all"
      >
        檢查答案
      </button>

      <div className="mt-12 w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-800">排行榜 (前 5 名)</h2>
        {leaderboard.length === 0 ? <p className="text-slate-400">尚無紀錄</p> : (
          <ol className="list-decimal list-inside space-y-2">
            {leaderboard.map((score, i) => (
              <li key={i} className="text-slate-700 font-medium">
                {score.name}: {score.time.toFixed(2)} 秒
              </li>
            ))}
          </ol>
        )}
      </div>

      {message && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{message}</h2>
            {won ? (
              <div className="mb-6">
                <p className="mb-2 text-slate-600">完成時間: {finalTime.toFixed(2)} 秒</p>
                <input 
                  type="text" 
                  placeholder="輸入你的名字" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                />
                <button 
                  onClick={() => { saveScore(playerName, finalTime); resetGame(); }}
                  className="w-full mt-3 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  儲存紀錄
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setMessage(null); }}
                className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900"
              >
                再試一次
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
