import React from 'react';
import { Code, Plus, Minus, Trophy, Activity, Target } from 'lucide-react';

export default function LeetCodeTracker({ stats, onChange, theme }) {
  const activeTheme = theme || {
    id: "cyber_cyan",
    name: "Cyber Core",
    borderAccent: "border-cyan-500/40",
    borderAccentFocus: "border-cyan-400 focus:border-cyan-350 focus:ring-cyan-500/50",
    textAccent: "text-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
    textAccentHover: "hover:text-cyan-300",
    tagBg: "bg-cyan-950/70 border border-cyan-500/45 text-cyan-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-cyan-400 to-indigo-650 shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:shadow-[0_0_40px_rgba(6,182,212,1.0)] text-white font-black",
    accentHex: "#06b6d4",
    logoColor: "text-cyan-455 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.85)]",
    scrollbarThumb: "#06b6d4",
    glassClass: "bg-[#0a1124]/96 border-[1.5px] border-cyan-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-cyan-500 to-indigo-505"
  };

  const easy = stats?.easy || 0;
  const medium = stats?.medium || 0;
  const hard = stats?.hard || 0;
  const total = easy + medium + hard;

  // Let's create an elegant visual target baseline (e.g. 100 solved problems is target master)
  const targetMin = 100;
  const totalPercentage = Math.min(Math.round((total / targetMin) * 100), 100);

  // SVG circular properties
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalPercentage / 100) * circumference;

  return (
    <div className={`${activeTheme.glassClass} rounded-2xl p-5 flex flex-col relative overflow-hidden`} id="leetcode-tracker">
      {/* Decorative background grid and vector glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40"></div>
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${activeTheme.accentHex}1a` }}></div>
      
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <Code className={`w-4 h-4 animate-pulse ${activeTheme.textAccent}`} />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono">DSA Activity deck</h2>
        </div>
        <div 
          className="flex items-center gap-1 bg-slate-950 border rounded-full px-2.5 py-0.5 text-[9.5px] font-black font-mono"
          style={{ borderColor: `${activeTheme.accentHex}40`, color: activeTheme.accentHex, boxShadow: `0 0 15px ${activeTheme.accentHex}20` }}
        >
          <Trophy className="w-3.5 h-3.5 animate-pulse" style={{ color: activeTheme.accentHex }} />
          <span>{total} SOLVED</span>
        </div>
      </div>

      {/* Interactive Donut & Target Status Deck */}
      <div 
        className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border mb-4 relative z-10 shadow-inner"
        style={{ borderColor: `${activeTheme.accentHex}25` }}
      >
        {/* Glowing circular gauge */}
        <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Progress Circle with beautiful dynamic gradient style */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={activeTheme.accentHex}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${activeTheme.accentHex})`,
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-black text-white filter drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]">{totalPercentage}%</span>
            <span className="text-[7px] text-slate-350 font-mono font-bold uppercase tracking-widest">Mastery</span>
          </div>
        </div>

        {/* Quick analytics info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3" style={{ color: activeTheme.accentHex }} />
            <span className="text-[9px] font-black text-white uppercase tracking-wider font-mono">Daily Target Rank</span>
          </div>
          <p className="text-[10px] text-slate-100 font-bold leading-relaxed truncate">
            {total < 10 ? '🌱 Novice coder initiation' : total < 40 ? '⚡ Intermediate system explorer' : total < 90 ? '🔥 DSA Algorithms champion' : '👑 Absolute master level mind'}
          </p>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-1.5 overflow-hidden border border-white/5">
            <div 
              className="h-full rounded" 
              style={{ 
                width: `${(total % 10) * 10}%`, 
                backgroundColor: activeTheme.accentHex, 
                boxShadow: `0 0 8px ${activeTheme.accentHex}` 
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        {/* Easy */}
        <div className="bg-slate-900/60 border border-emerald-500/25 p-2.5 rounded-xl text-center relative overflow-hidden group transition-all duration-300 hover:border-emerald-400/50 hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_1px_10px_#10b981]"></div>
          <span className="text-[8.5px] font-mono font-black tracking-widest text-[#10b981] block uppercase mb-1 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">Easy</span>
          <span className="text-lg font-black text-white font-mono block mb-2">{easy}</span>
          <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => onChange('easy', -1)}
              className="w-5.5 h-5.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:border-emerald-500/40 text-slate-300 transition-all active:scale-[0.8] cursor-pointer font-bold"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onChange('easy', 1)}
              className="w-5.5 h-5.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all active:scale-[0.8] cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Medium */}
        <div className="bg-slate-900/60 border border-amber-500/25 p-2.5 rounded-xl text-center relative overflow-hidden group transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_18px_rgba(245,158,11,0.2)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 shadow-[0_1px_10px_#f59e0b]"></div>
          <span className="text-[8.5px] font-mono font-black tracking-widest text-[#f59e0b] block uppercase mb-1 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]">Medium</span>
          <span className="text-lg font-black text-white font-mono block mb-2">{medium}</span>
          <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => onChange('medium', -1)}
              className="w-5.5 h-5.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:border-amber-500/40 text-slate-300 transition-all active:scale-[0.85] cursor-pointer font-bold"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onChange('medium', 1)}
              className="w-5.5 h-5.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)] hover:shadow-[0_0_15px_rgba(245,158,11,0.7)] transition-all active:scale-[0.85] cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Hard */}
        <div className="bg-slate-900/60 border border-rose-500/25 p-2.5 rounded-xl text-center relative overflow-hidden group transition-all duration-300 hover:border-rose-400/50 hover:shadow-[0_0_18px_rgba(244,63,94,0.25)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500 shadow-[0_1px_10px_#f43f5e]"></div>
          <span className="text-[8.5px] font-mono font-black tracking-widest text-[#f43f5e] block uppercase mb-1 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]">Hard</span>
          <span className="text-lg font-black text-white font-mono block mb-2">{hard}</span>
          <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => onChange('hard', -1)}
              className="w-5.5 h-5.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:border-rose-500/40 text-slate-300 transition-all active:scale-[0.85] cursor-pointer font-bold"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onChange('hard', 1)}
              className="w-5.5 h-5.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.4)] hover:shadow-[0_0_15px_rgba(244,63,94,0.7)] transition-all active:scale-[0.85] cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
