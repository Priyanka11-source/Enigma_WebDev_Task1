import React from 'react';
import { 
  CheckCircle2, Circle, Clock, Award, BookOpen,
  Calculator, Binary, Cpu, Braces, Workflow, 
  Infinity, Terminal, Layers, Database, Network
} from 'lucide-react';

const TOPIC_CONFIG = {
  maths: {
    name: 'Engineering Mathematics',
    desc: 'Linear Algebra, Calculus, Probability',
    theme: 'indigo',
    border: 'group-hover:border-indigo-500/30 border-indigo-500/10',
    bg: 'bg-indigo-950/20',
    text: 'text-indigo-400',
    accent: '#6366f1',
    glow: 'group-hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    icon: Calculator
  },
  digital: {
    name: 'Digital Logic',
    desc: 'Combinational/Sequential Circuits',
    theme: 'amber',
    border: 'group-hover:border-amber-500/30 border-amber-500/10',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    accent: '#f59e0b',
    glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    icon: Binary
  },
  coa: {
    name: 'System Architecture',
    desc: 'Pipeline, Cache memory, Stack system',
    theme: 'rose',
    border: 'group-hover:border-rose-500/30 border-rose-500/10',
    bg: 'bg-rose-950/20',
    text: 'text-rose-400',
    accent: '#f43f5e',
    glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    icon: Cpu
  },
  programming: {
    name: 'Data Structures',
    desc: 'Recursion, Stacks, Queues, Binary Heaps',
    theme: 'cyan',
    border: 'group-hover:border-cyan-500/30 border-cyan-500/10',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-400',
    accent: '#06b6d4',
    glow: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.30)]',
    icon: Braces
  },
  algorithms: {
    name: 'Algorithms & Complexity',
    desc: 'Divide & Conquer, Greedy, Graphs, DP',
    theme: 'purple',
    border: 'group-hover:border-purple-500/30 border-purple-500/10',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400',
    accent: '#a855f7',
    glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    icon: Workflow
  },
  toc: {
    name: 'Theory of Computation',
    desc: 'Automata, Turing Machines, Grammars',
    theme: 'blue',
    border: 'group-hover:border-blue-500/30 border-blue-500/10',
    bg: 'bg-blue-950/20',
    text: 'text-blue-400',
    accent: '#3b82f6',
    glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    icon: Infinity
  },
  compiler: {
    name: 'Compiler Design',
    desc: 'Lexical analysis, Run-time environments',
    theme: 'lime',
    border: 'group-hover:border-lime-500/30 border-lime-500/10',
    bg: 'bg-lime-950/15',
    text: 'text-lime-400',
    accent: '#84cc16',
    glow: 'group-hover:shadow-[0_0_15px_rgba(132,204,22,0.25)]',
    icon: Terminal
  },
  os: {
    name: 'Operating Systems',
    desc: 'Semaphores, CPU Scheduling, Virtual Memory',
    theme: 'fuchsia',
    border: 'group-hover:border-fuchsia-500/30 border-fuchsia-500/10',
    bg: 'bg-fuchsia-950/20',
    text: 'text-fuchsia-400',
    accent: '#d946ef',
    glow: 'group-hover:shadow-[0_0_15px_rgba(217,70,239,0.25)]',
    icon: Layers
  },
  dbms: {
    name: 'Database Operations',
    desc: 'SQL Queries, ACID Transaction, Indexing',
    theme: 'teal',
    border: 'group-hover:border-teal-500/30 border-teal-500/10',
    bg: 'bg-teal-950/20',
    text: 'text-teal-400',
    accent: '#14b8a6',
    glow: 'group-hover:shadow-[0_0_15px_rgba(20,184,166,0.25)]',
    icon: Database
  },
  networks: {
    name: 'Computer Networks',
    desc: 'Routing, TCP/UDP, DNS, OSI Standard',
    theme: 'emerald',
    border: 'group-hover:border-emerald-500/30 border-emerald-500/10',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400',
    accent: '#10b981',
    glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    icon: Network
  }
};

export default function SyllabusTracker({ stats, onChange, theme }) {
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

  const topics = Object.keys(TOPIC_CONFIG);
  const total = topics.length;
  const completed = topics.filter(key => stats?.[key] === 'COMPLETED').length;
  const inProgress = topics.filter(key => stats?.[key] === 'IN_PROGRESS').length;
  const percent = Math.round((completed / total) * 100);

  const toggleStatus = (key) => {
    const current = stats?.[key] || 'NOT_STARTED';
    let next = 'NOT_STARTED';
    if (current === 'NOT_STARTED') {
      next = 'IN_PROGRESS';
    } else if (current === 'IN_PROGRESS') {
      next = 'COMPLETED';
    } else {
      next = 'NOT_STARTED';
    }
    onChange(key, next);
  };

  return (
    <div className={`${activeTheme.glassClass} rounded-2xl p-5 flex flex-col h-full relative overflow-hidden`} id="syllabus-tracker">
      {/* Decorative cyber grid accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <BookOpen className={`w-4 h-4 ${activeTheme.textAccent}`} />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono">GATE CS Skill Tree</h2>
        </div>
        <div 
          className="flex items-center gap-1 bg-slate-950/75 border rounded-full px-2.5 py-0.5 text-[9.5px] font-black font-mono"
          style={{ borderColor: `${activeTheme.accentHex}40`, color: activeTheme.accentHex, boxShadow: `0 0 15px ${activeTheme.accentHex}20` }}
        >
          <Award className="w-3.5 h-3.5 animate-bounce" style={{ color: activeTheme.accentHex }} />
          <span>{percent}% MASTERED</span>
        </div>
      </div>

      {/* Futuristic Progress bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 mb-4 overflow-hidden border border-white/5 relative z-10">
        <div 
          className="h-full rounded-full transition-all duration-700"
          style={{ 
            width: `${percent}%`,
            background: activeTheme.accentHex === '#06b6d4' 
              ? 'linear-gradient(90deg, #6366f1, #22d3ee, #10b981)' 
              : `linear-gradient(90deg, ${activeTheme.accentHex}, ${activeTheme.accentHex}aa)`, 
            boxShadow: `0 0 15px ${activeTheme.accentHex}cc` 
          }}
        ></div>
      </div>

      {/* Multi-colored status counter summaries */}
      <div 
        className="flex gap-2 text-[9px] font-bold font-mono text-slate-400 mb-4 bg-slate-950 p-2 rounded-xl border justify-between relative z-10 shadow-inner"
        style={{ borderColor: `${activeTheme.accentHex}25` }}
      >
        <div className="flex-1 text-center py-1 rounded bg-slate-900/40 border border-emerald-500/15 hover:border-emerald-500/35 transition-all duration-200">
          <div className="text-emerald-400 text-xs font-extrabold filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]">{completed}</div>
          <span className="text-[7.5px] text-slate-350 font-bold uppercase tracking-wider block mt-0.5">Completed</span>
        </div>
        <div className="flex-1 text-center py-1 rounded bg-slate-900/40 border transition-all duration-200" style={{ borderColor: `${activeTheme.accentHex}20` }}>
          <div className="text-xs font-extrabold" style={{ color: activeTheme.accentHex, filter: `drop-shadow(0 0 4px ${activeTheme.accentHex}60)` }}>{inProgress}</div>
          <span className="text-[7.5px] text-slate-350 font-bold uppercase tracking-wider block mt-0.5">InProgress</span>
        </div>
        <div className="flex-1 text-center py-1 rounded bg-slate-900/40 border border-rose-500/15 hover:border-rose-500/35 transition-all duration-200">
          <div className="text-rose-450 text-xs font-extrabold filter drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]">{total - completed - inProgress}</div>
          <span className="text-[7.5px] text-slate-350 font-bold uppercase tracking-wider block mt-0.5">Backlog</span>
        </div>
      </div>

      {/* Scrollable list of topics */}
      <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1 flex-grow scrollbar-thin relative z-10">
        {topics.map((key) => {
          const cfg = TOPIC_CONFIG[key];
          const status = stats?.[key] || 'NOT_STARTED';
          const SubjectIcon = cfg.icon;

          // Compute style factors
          let itemStyle = 'bg-slate-900/30 border-white/5 hover:bg-slate-930 hover:border-white/20 text-slate-300';
          let iconStyle = 'bg-slate-950/80 border-slate-800 text-slate-400';

          if (status === 'IN_PROGRESS') {
            itemStyle = `${cfg.bg} border-cyan-400/40 text-white ${cfg.glow}`;
            iconStyle = `bg-slate-950 border-cyan-400/50 ${cfg.text} shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse`;
          } else if (status === 'COMPLETED') {
            itemStyle = `${cfg.bg} border-emerald-500/40 text-slate-100 ${cfg.glow}`;
            iconStyle = `bg-emerald-950/90 border-emerald-500/50 text-emerald-350 shadow-[0_0_10px_rgba(16,185,129,0.4)]`;
          }

          return (
            <div 
              key={key}
              onClick={() => toggleStatus(key)}
              className={`group p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-3 relative ${itemStyle}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 ${iconStyle}`}>
                <SubjectIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11.5px] font-bold tracking-tight text-white font-sans truncate group-hover:text-cyan-305 transition-colors duration-200">
                    {cfg.name}
                  </h4>
                  {status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 shrink-0 filter drop-shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                  ) : status === 'IN_PROGRESS' ? (
                    <Clock className="w-3.5 h-3.5 shrink-0 animate-spin [animation-duration:8s]" style={{ color: activeTheme.accentHex, filter: `drop-shadow(0 0 5px ${activeTheme.accentHex})` }} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-650 shrink-0 group-hover:text-slate-400 group-hover:scale-115 transition-all" />
                  )}
                </div>
                <p className="text-[9.5px] text-slate-250 font-medium font-sans mt-0.5 truncate leading-relaxed group-hover:text-white">{cfg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
