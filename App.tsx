
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Gear from './components/Gear';
import ClockFace from './components/ClockFace';
import { getMechanicalExplanation } from './services/geminiService';

const App: React.FC = () => {
  const getSecondsSinceStartOfPeriod = () => {
    const now = new Date();
    return (now.getHours() % 12) * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  };

  const [time, setTime] = useState(getSecondsSinceStartOfPeriod()); 
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showXRay, setShowXRay] = useState(false);
  const [aiTip, setAiTip] = useState("我是老钟表匠！把鼠标停在齿轮上，我就会带你透视它的层级哦。");
  const [loadingAi, setLoadingAi] = useState(false);
  const [hoveredGearId, setHoveredGearId] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{label?: string, desc: string} | null>(null);
  
  const timerRef = useRef<number>(undefined);

  const updateClock = useCallback(() => {
    if (!isPaused) {
      setTime(prev => (prev + 0.1 * speed) % (12 * 3600));
    }
  }, [isPaused, speed]);

  useEffect(() => {
    timerRef.current = window.setInterval(updateClock, 100);
    return () => clearInterval(timerRef.current);
  }, [updateClock]);

  const syncToRealTime = () => {
    setTime(getSecondsSinceStartOfPeriod());
    setSpeed(1);
    setIsPaused(false);
  };

  const fetchTip = async (topic: string) => {
    setLoadingAi(true);
    const tip = await getMechanicalExplanation(topic);
    setAiTip(tip);
    setLoadingAi(false);
  };

  const handleGearHover = (id: string | null, desc: string | null, label?: string) => {
    setHoveredGearId(id);
    if (desc) {
      setHoverInfo({ label, desc });
    } else {
      setHoverInfo(null);
    }
  };

  const secondDeg = (time % 60) * 6;
  const minuteDeg = ((time / 60) % 60) * 6;
  const hourDeg = ((time / 3600) % 12) * 30;
  const intermediateDeg = -minuteDeg * (10/30); 

  const escapeTickRate = 6;
  const escapeRotation = Math.floor((time % 60) * escapeTickRate) * (360 / (60 * escapeTickRate)) * 10;

  const colors = {
    brass: "#D4AF37",
    copper: "#B87333",
    steel: "#A9A9A9",
    gold: "#FFD700",
    darkSteel: "#4b5563"
  };

  const parts = [
    { id: 'escape', label: '节奏中心', color: colors.steel, desc: '【擒纵轮】它是时钟的心跳！它飞速旋转并很有节奏地“卡住”又“放开”，产生滴答声，控制整个钟表的速度。' },
    { id: 'minute', label: '分轮', color: colors.copper, desc: '【分轮】位于中间层，连接着分针。它负责把秒轮的快节奏“翻译”成稳健的分钟步伐。' },
    { id: 'second', label: '秒轮', color: colors.gold, desc: '【秒轮】位于轴心最底层，转得最快，直接带动红色的秒针。它是动力的第一站！' },
    { id: 'hour', label: '时轮', color: colors.darkSteel, desc: '【时轮】最外层的大齿轮，转得最慢。它通过跨轮的帮助，每12小时才转一圈。' },
    { id: 'intermediate', label: '跨轮', color: colors.brass, desc: '【跨轮】机械翻译官，它巧妙地连接分轮和时轮，完成精准的1:12减速任务。' }
  ];

  const isAnyFocused = hoveredGearId !== null;
  
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-900 drop-shadow-sm flex items-center justify-center gap-4">
          <i className="fa-solid fa-clock text-amber-600"></i>
          小小钟表匠：透视机械
        </h1>
        <p className="text-amber-800 mt-2 font-medium">精密计时器的内部奥秘，为你层层剥开。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col items-center border-4 border-amber-100">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
              onClick={() => setShowXRay(!showXRay)}
              className={`px-6 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 ${showXRay ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 border-2 border-amber-200'}`}
            >
              <i className={`fa-solid ${showXRay ? 'fa-eye' : 'fa-eye-slash'} mr-2`}></i>
              {showXRay ? '隐藏内部' : '透视构造'}
            </button>
          </div>

          <div className="relative w-full flex flex-col items-center">
            {hoverInfo && showXRay && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-20 max-w-sm text-center border-2 border-amber-500 animate-float-stable">
                {hoverInfo.label && <div className="font-bold text-amber-600 text-xl mb-2">{hoverInfo.label}</div>}
                <div className="text-amber-950 text-base font-medium leading-relaxed">{hoverInfo.desc}</div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-amber-500"></div>
              </div>
            )}

            <svg viewBox="0 0 600 600" className="w-full max-w-[500px]">
              <g opacity={showXRay ? 1 : 0.02} style={{ transition: 'opacity 0.6s ease' }}>
                <Gear 
                  x={300} y={100} radius={30} teeth={12} color={colors.steel} rotation={escapeRotation} 
                  label={parts[0].label} description={parts[0].desc}
                  isFocused={hoveredGearId === 'escape'} isDimmed={isAnyFocused && hoveredGearId !== 'escape'}
                  onHover={(d, l) => handleGearHover('escape', d, l)}
                />
                
                <Gear 
                  x={395} y={395} radius={55} teeth={24} color={colors.brass} rotation={intermediateDeg} 
                  label={parts[4].label} description={parts[4].desc}
                  isFocused={hoveredGearId === 'intermediate'} isDimmed={isAnyFocused && hoveredGearId !== 'intermediate'}
                  onHover={(d, l) => handleGearHover('intermediate', d, l)}
                />

                <Gear 
                  x={300} y={300} radius={120} teeth={48} color={colors.darkSteel} rotation={hourDeg} 
                  label={parts[3].label} description={parts[3].desc}
                  isSkeleton={true}
                  isFocused={hoveredGearId === 'hour'} isDimmed={isAnyFocused && hoveredGearId !== 'hour'}
                  onHover={(d, l) => handleGearHover('hour', d, l)}
                />

                <Gear 
                  x={300} y={300} radius={75} teeth={32} color={colors.copper} rotation={minuteDeg} 
                  label={parts[1].label} description={parts[1].desc}
                  isSkeleton={true}
                  isFocused={hoveredGearId === 'minute'} isDimmed={isAnyFocused && hoveredGearId !== 'minute'}
                  onHover={(d, l) => handleGearHover('minute', d, l)}
                />

                <Gear 
                  x={300} y={300} radius={45} teeth={18} color={colors.gold} rotation={secondDeg} 
                  label={parts[2].label} description={parts[2].desc}
                  isFocused={hoveredGearId === 'second'} isDimmed={isAnyFocused && hoveredGearId !== 'second'}
                  onHover={(d, l) => handleGearHover('second', d, l)}
                />
              </g>

              <ClockFace size={600} />

              <g className="hands pointer-events-none">
                <line x1="300" y1="300" x2={300 + Math.cos(((hourDeg - 90) * Math.PI) / 180) * 110} y2={300 + Math.sin(((hourDeg - 90) * Math.PI) / 180) * 110} stroke="#3e2723" strokeWidth="16" strokeLinecap="round" opacity={hoveredGearId === 'hour' || !isAnyFocused ? 1 : 0.15} />
                <line x1="300" y1="300" x2={300 + Math.cos(((minuteDeg - 90) * Math.PI) / 180) * 170} y2={300 + Math.sin(((minuteDeg - 90) * Math.PI) / 180) * 170} stroke="#5d4037" strokeWidth="10" strokeLinecap="round" opacity={hoveredGearId === 'minute' || !isAnyFocused ? 1 : 0.15} />
                <line x1="300" y1="300" x2={300 + Math.cos(((secondDeg - 90) * Math.PI) / 180) * 210} y2={300 + Math.sin(((secondDeg - 90) * Math.PI) / 180) * 210} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity={hoveredGearId === 'second' || !isAnyFocused ? 1 : 0.15} />
                <circle cx="300" cy="300" r="14" fill="#3e2723" />
                <circle cx="300" cy="300" r="6" fill="#8d6e63" />
              </g>
            </svg>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 w-full justify-center">
            {parts.map(p => (
              <div 
                key={p.id}
                onMouseEnter={() => handleGearHover(p.id, p.desc, p.label)}
                onMouseLeave={() => handleGearHover(null, null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-help
                  ${hoveredGearId === p.id ? 'bg-amber-600 text-white border-amber-600 scale-110' : 'bg-white text-amber-900 border-amber-100 hover:border-amber-400'}
                `}
              >
                <i className="fa-solid fa-circle-info mr-1.5"></i>
                {p.label}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 shadow-inner">
            <button onClick={() => setIsPaused(!isPaused)} className="w-16 h-16 rounded-full bg-amber-600 text-white text-3xl flex items-center justify-center hover:bg-amber-700 hover:scale-105 transition-all shadow-xl active:translate-y-1">
              <i className={`fa-solid ${isPaused ? 'fa-play ml-1' : 'fa-pause'}`}></i>
            </button>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex justify-between text-amber-900 font-bold text-sm px-1">
                <span>加速倍率</span>
                <span>{speed}x</span>
              </div>
              <input type="range" min="1" max="100" step="1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="accent-amber-600 h-3 bg-amber-200 rounded-full appearance-none cursor-pointer" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={syncToRealTime} className="px-6 py-3 bg-white border-2 border-amber-600 rounded-2xl text-amber-700 font-bold hover:bg-amber-600 hover:text-white transition-all shadow-md">
                <i className="fa-solid fa-sync mr-2"></i> 同步现实
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-[2.5rem] p-8 shadow-xl border-b-8 border-amber-200 flex-grow">
            <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-3">
              <i className="fa-solid fa-lightbulb text-amber-600"></i>
              钟表匠的奥秘
            </h3>
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 min-h-[160px] shadow-inner mb-6 border border-amber-200">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-amber-600"></div>
                  <span className="text-amber-800 font-medium text-sm">正在钻研图纸...</span>
                </div>
              ) : (
                <p className="text-amber-950 text-lg leading-relaxed font-medium italic">"{aiTip}"</p>
              )}
            </div>
            <div className="space-y-3">
              <button onClick={() => fetchTip("什么是‘节奏中心’的能量守恒？")} className="w-full text-sm bg-amber-600 text-white px-4 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg">节奏中心的深层原理</button>
              <button onClick={() => fetchTip("为什么分轮要被夹在中间？")} className="w-full text-sm bg-amber-600 text-white px-4 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg">分轮的层级奥秘</button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-t-8 border-emerald-400">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
              <i className="fa-solid fa-gear text-emerald-500"></i>
              零件详情
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-center group">
                <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-sm"><i className="fa-solid fa-layer-group text-xl"></i></div>
                <div>
                  <p className="font-bold text-emerald-900">分层触控</p>
                  <p className="text-sm text-gray-500">你可以直接点击内部的秒轮，或者透过时轮的空隙观察它们。</p>
                </div>
              </div>
              <div className="flex gap-4 items-center group">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-sm"><i className="fa-solid fa-arrows-to-circle text-xl"></i></div>
                <div>
                  <p className="font-bold text-blue-900">精准比例</p>
                  <p className="text-sm text-gray-500">每一个轮子的齿数都是精密计算过的，保证时间准确。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 mb-8 text-amber-900/30 text-[11px] font-bold uppercase tracking-[0.5em] text-center">
        机械计时器探索器 • 精密与稳定
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-stable {
          0% { opacity: 0; transform: translate(-50%, 15px); }
          15% { opacity: 1; transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -8px); }
          100% { opacity: 1; transform: translate(-50%, 0px); }
        }
        .animate-float-stable {
          animation: float-stable 4s ease-in-out infinite forwards;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #d97706;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .cursor-help { cursor: help; }
      `}} />
    </div>
  );
};

export default App;
