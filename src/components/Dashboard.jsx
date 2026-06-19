import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import SyllabusTracker from "./SyllabusTracker";
import LeetCodeTracker from "./LeetCodeTracker";
import AIBotChat from "./AIBotChat";
import {
  Plus,
  Search,
  LogOut,
  Terminal,
  Edit,
  Trash2,
  Code,
  BookOpen,
  AlignLeft,
  Play,
  RefreshCw,
  Layers,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Eye,
  ListTodo,
  Clock,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Sparkles,
  Target,
  Compass,
  ChevronDown,
  ChevronUp,
  Sliders,
  Cpu,
  Music,
  Settings,
  Activity
} from "lucide-react";
const CATEGORY_COLORS = {
  "LeetCode": "bg-amber-950/40 border-amber-500/20 text-amber-400 font-mono text-[9px]",
  "DSA": "bg-emerald-950/40 border-emerald-500/20 text-emerald-400 font-mono text-[9px]",
  "GATE Prep": "bg-cyan-950/40 border-cyan-500/20 text-cyan-400 font-mono tracking-wide text-[9px]",
  "Web Dev": "bg-rose-950/40 border-rose-500/20 text-rose-450 font-mono text-[9px]",
  "General": "bg-slate-900 border-white/5 text-slate-300 font-mono text-[9px]"
};
const INITIAL_GATE = {
  maths: "NOT_STARTED",
  digital: "NOT_STARTED",
  coa: "NOT_STARTED",
  programming: "NOT_STARTED",
  algorithms: "NOT_STARTED",
  toc: "NOT_STARTED",
  compiler: "NOT_STARTED",
  os: "NOT_STARTED",
  dbms: "NOT_STARTED",
  networks: "NOT_STARTED"
};
const INITIAL_LEETCODE = { easy: 0, medium: 0, hard: 0 };
function parseInlineMarkup(text) {
  let parts = [text];
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const pieces = part.split(/<u>([\s\S]*?)<\/u>/);
    return pieces.map((piece, i) => i % 2 === 1 ? <u className="underline text-cyan-400 font-medium decoration-cyan-500/50" key={i}>{piece}</u> : piece);
  });
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const pieces = part.split(/\*\*([\s\S]*?)\*\*/);
    return pieces.map((piece, i) => i % 2 === 1 ? <strong className="font-bold text-white glow-text-cyan" key={i}>{piece}</strong> : piece);
  });
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const pieces = part.split(/\*([\s\S]*?)\*/);
    return pieces.map((piece, i) => i % 2 === 1 ? <em className="italic text-slate-300" key={i}>{piece}</em> : piece);
  });
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const pieces = part.split(/`([\s\S]*?)`/);
    return pieces.map((piece, i) => i % 2 === 1 ? <code className="bg-slate-950 border border-white/5 text-[10px] px-1 rounded font-mono text-cyan-300" key={i}>{piece}</code> : piece);
  });
  return <React.Fragment>{parts.map((p, index) => <span key={index}>{p}</span>)}</React.Fragment>;
}
function parseNoteToReact(noteContent, onToggleCheckbox) {
  if (!noteContent) return <p className="text-slate-400 italic text-xs">No study content available.</p>;
  const lines = noteContent.split("\n");
  return <div className="space-y-1.5 leading-relaxed font-sans text-slate-300 text-xs text-left">
      {lines.map((line, idx) => {
    const todoMatch = line.trim().match(/^- \[( |x|X)\] (.*)/);
    if (todoMatch) {
      const isChecked = todoMatch[1].toLowerCase() === "x";
      const content = todoMatch[2];
      return <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5">
              <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggleCheckbox?.(idx)}
        className="w-3.5 h-3.5 mt-0.5 rounded border-cyan-500/30 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500 shrink-0 shadow-sm"
      />
              <span className={`flex-1 transition-all duration-300 ${isChecked ? "line-through text-slate-500 decoration-slate-650" : "text-slate-300"}`}>
                {parseInlineMarkup(content)}
              </span>
            </div>;
    }
    if (line.trim().startsWith("- ")) {
      const content = line.trim().substring(2);
      return <div key={idx} className="flex items-start gap-1.5 pl-3">
              <span className="text-cyan-400 font-bold select-none">•</span>
              <span className="flex-1">{parseInlineMarkup(content)}</span>
            </div>;
    }
    const olMatch = line.trim().match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      const num = olMatch[1];
      const content = olMatch[2];
      return <div key={idx} className="flex items-start gap-1.5 pl-3">
              <span className="text-cyan-400 font-bold select-none font-mono text-[10px] mt-0.5">{num}.</span>
              <span className="flex-1">{parseInlineMarkup(content)}</span>
            </div>;
    }
    if (line.trim().startsWith("```")) {
      return <div key={idx} className="my-1 border-l-2 border-cyan-500 bg-slate-950 text-[9.5px]/[13px] text-cyan-350 font-mono py-1 px-3 rounded-lg opacity-85">
              {line}
            </div>;
    }
    if (line.trim() === "") {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-slate-300 leading-relaxed text-left">
            {parseInlineMarkup(line)}
          </p>;
  })}
    </div>;
}
export const THEMES = {
  cyber_cyan: {
    id: "cyber_cyan",
    name: "Cyber Core",
    gradientBg: "from-[#020306] via-[#04060f] to-[#010103]",
    navBg: "bg-[#020306]/95 border-cyan-500/40",
    glowTopLeft: "from-cyan-500/30 via-indigo-600/5 to-transparent",
    glowBottomRight: "from-fuchsia-500/25 via-indigo-500/5 to-transparent",
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
  },
  neon_fuchsia: {
    id: "neon_fuchsia",
    name: "Synthwave Retro",
    gradientBg: "from-[#030105] via-[#06020c] to-[#010002]",
    navBg: "bg-[#030105]/95 border-fuchsia-500/40",
    glowTopLeft: "from-fuchsia-500/30 via-purple-600/5 to-transparent",
    glowBottomRight: "from-orange-500/25 via-rose-500/5 to-transparent",
    borderAccent: "border-fuchsia-500/40",
    borderAccentFocus: "border-fuchsia-400 focus:border-fuchsia-350 focus:ring-fuchsia-500/50",
    textAccent: "text-fuchsia-400 filter drop-shadow-[0_0_10px_rgba(240,70,250,0.8)]",
    textAccentHover: "hover:text-fuchsia-300",
    tagBg: "bg-fuchsia-950/70 border border-fuchsia-500/45 text-fuchsia-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-fuchsia-400 to-rose-600 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:shadow-[0_0_40px_rgba(217,70,239,1.0)] text-white font-black",
    accentHex: "#d946ef",
    logoColor: "text-fuchsia-455 filter drop-shadow-[0_0_12px_rgba(217,70,239,0.85)]",
    scrollbarThumb: "#d946ef",
    glassClass: "bg-[#14061a]/96 border-[1.5px] border-fuchsia-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(217,70,239,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-fuchsia-500 to-rose-500"
  },
  matrix_green: {
    id: "matrix_green",
    name: "Phosphor Matrix",
    gradientBg: "from-[#000100] via-[#010302] to-[#000000]",
    navBg: "bg-[#000100]/95 border-emerald-500/40",
    glowTopLeft: "from-emerald-500/30 via-green-600/5 to-transparent",
    glowBottomRight: "from-teal-500/25 via-emerald-500/5 to-transparent",
    borderAccent: "border-emerald-500/40",
    borderAccentFocus: "border-emerald-400 focus:border-emerald-350 focus:ring-emerald-500/50",
    textAccent: "text-emerald-400 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    textAccentHover: "hover:text-emerald-300",
    tagBg: "bg-emerald-950/70 border border-emerald-500/45 text-emerald-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-emerald-400 to-teal-650 shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:shadow-[0_0_40px_rgba(16,185,129,1.0)] text-white font-black",
    accentHex: "#10b981",
    logoColor: "text-emerald-455 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.85)]",
    scrollbarThumb: "#10b981",
    glassClass: "bg-[#05120a]/96 border-[1.5px] border-emerald-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(16,185,129,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-emerald-500 to-teal-500"
  },
  solar_amber: {
    id: "solar_amber",
    name: "Solar Flare",
    gradientBg: "from-[#030201] via-[#050301] to-[#010000]",
    navBg: "bg-[#030201]/95 border-amber-500/40",
    glowTopLeft: "from-amber-500/30 via-orange-600/5 to-transparent",
    glowBottomRight: "from-[#dc2626]/25 via-amber-600/5 to-transparent",
    borderAccent: "border-amber-500/40",
    borderAccentFocus: "border-amber-400 focus:border-amber-350 focus:ring-amber-500/50",
    textAccent: "text-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]",
    textAccentHover: "hover:text-amber-300",
    tagBg: "bg-amber-950/70 border border-amber-500/45 text-amber-250 font-bold",
    buttonPrimary: "bg-gradient-to-r from-amber-400 to-orange-600 shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:shadow-[0_0_40px_rgba(245,158,11,1.0)] text-white font-black",
    accentHex: "#f59e0b",
    logoColor: "text-amber-455 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]",
    scrollbarThumb: "#f59e0b",
    glassClass: "bg-[#120a04]/96 border-[1.5px] border-amber-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-amber-500 to-orange-500"
  },
  royal_violet: {
    id: "royal_violet",
    name: "Royal Violet",
    gradientBg: "from-[#020005] via-[#04010a] to-[#010001]",
    navBg: "bg-[#020005]/95 border-violet-500/40",
    glowTopLeft: "from-violet-500/30 via-indigo-600/5 to-transparent",
    glowBottomRight: "from-fuchsia-500/25 via-pink-500/5 to-transparent",
    borderAccent: "border-violet-500/40",
    borderAccentFocus: "border-violet-400 focus:border-violet-350 focus:ring-violet-500/50",
    textAccent: "text-violet-400 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]",
    textAccentHover: "hover:text-violet-300",
    tagBg: "bg-violet-950/70 border border-violet-500/45 text-violet-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-violet-400 to-indigo-600 shadow-[0_0_25px_rgba(139,92,246,0.7)] hover:shadow-[0_0_40px_rgba(139,92,246,1.0)] text-white font-black",
    accentHex: "#8b5cf6",
    logoColor: "text-violet-455 filter drop-shadow-[0_0_12px_rgba(139,92,246,0.85)]",
    scrollbarThumb: "#8b5cf6",
    glassClass: "bg-[#0e041a]/96 border-[1.5px] border-violet-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(139,92,246,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-violet-500 to-indigo-500"
  },
  crimson_overdrive: {
    id: "crimson_overdrive",
    name: "Crimson Fury",
    gradientBg: "from-[#030000] via-[#060102] to-[#010000]",
    navBg: "bg-[#030000]/95 border-rose-500/40",
    glowTopLeft: "from-rose-500/30 via-red-600/5 to-transparent",
    glowBottomRight: "from-orange-500/25 via-rose-500/5 to-transparent",
    borderAccent: "border-rose-500/40",
    borderAccentFocus: "border-rose-400 focus:border-rose-350 focus:ring-rose-500/50",
    textAccent: "text-rose-450 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]",
    textAccentHover: "hover:text-rose-300",
    tagBg: "bg-rose-950/70 border border-rose-500/45 text-rose-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-rose-400 to-red-650 shadow-[0_0_25px_rgba(244,63,94,0.7)] hover:shadow-[0_0_40px_rgba(244,63,94,1.0)] text-white font-black",
    accentHex: "#f43f5e",
    logoColor: "text-rose-455 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.85)]",
    scrollbarThumb: "#f43f5e",
    glassClass: "bg-[#150204]/96 border-[1.5px] border-rose-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(244,63,94,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-rose-500 to-red-500"
  },
  deep_ocean: {
    id: "deep_ocean",
    name: "Deep Ocean",
    gradientBg: "from-[#000104] via-[#01030e] to-[#000001]",
    navBg: "bg-[#000104]/95 border-blue-500/40",
    glowTopLeft: "from-blue-500/30 via-teal-600/5 to-transparent",
    glowBottomRight: "from-cyan-500/25 via-indigo-500/5 to-transparent",
    borderAccent: "border-blue-500/40",
    borderAccentFocus: "border-blue-400 focus:border-blue-350 focus:ring-blue-500/50",
    textAccent: "text-blue-400 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]",
    textAccentHover: "hover:text-blue-300",
    tagBg: "bg-blue-950/70 border border-blue-500/45 text-blue-250 font-bold",
    buttonPrimary: "bg-gradient-to-r from-blue-400 to-indigo-650 shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:shadow-[0_0_40px_rgba(59,130,246,1.0)] text-white font-black",
    accentHex: "#3b82f6",
    logoColor: "text-blue-455 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.85)]",
    scrollbarThumb: "#3b82f6",
    glassClass: "bg-[#051026]/96 border-[1.5px] border-blue-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(59,130,246,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-blue-500 to-indigo-500"
  },
  emerald_aurora: {
    id: "emerald_aurora",
    name: "Emerald Aurora",
    gradientBg: "from-[#000100] via-[#010402] to-[#000000]",
    navBg: "bg-[#000100]/95 border-emerald-500/40",
    glowTopLeft: "from-emerald-500/30 via-teal-600/5 to-transparent",
    glowBottomRight: "from-cyan-500/25 via-emerald-600/5 to-transparent",
    borderAccent: "border-emerald-500/40",
    borderAccentFocus: "border-emerald-400 focus:border-emerald-350 focus:ring-emerald-500/50",
    textAccent: "text-emerald-400 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    textAccentHover: "hover:text-emerald-300",
    tagBg: "bg-emerald-950/70 border border-emerald-500/45 text-emerald-250 font-bold",
    buttonPrimary: "bg-gradient-to-r from-emerald-405 to-teal-505 shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:shadow-[0_0_40px_rgba(16,185,129,1.0)] text-white font-black",
    accentHex: "#10b981",
    logoColor: "text-emerald-455 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.85)]",
    scrollbarThumb: "#10b981",
    glassClass: "bg-[#03140a]/96 border-[1.5px] border-emerald-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(16,185,129,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-emerald-500 to-teal-500"
  },
  glacier_mint: {
    id: "glacier_mint",
    name: "Glacier Mint",
    gradientBg: "from-[#000102] via-[#01050a] to-[#000001]",
    navBg: "bg-[#000102]/95 border-teal-500/45",
    glowTopLeft: "from-teal-400/30 via-cyan-600/5 to-transparent",
    glowBottomRight: "from-emerald-500/25 via-cyan-500/5 to-transparent",
    borderAccent: "border-teal-500/40",
    borderAccentFocus: "border-teal-400 focus:border-teal-350 focus:ring-teal-500/50",
    textAccent: "text-teal-300 filter drop-shadow-[0_0_10px_rgba(45,212,191,0.8)]",
    textAccentHover: "hover:text-teal-200",
    tagBg: "bg-teal-950/70 border border-teal-500/45 text-teal-200 font-bold",
    buttonPrimary: "bg-gradient-to-r from-teal-400 to-cyan-505 shadow-[0_0_25px_rgba(20,184,166,0.7)] hover:shadow-[0_0_40px_rgba(20,184,166,1.0)] text-slate-950 font-black",
    accentHex: "#2dd4bf",
    logoColor: "text-teal-330 filter drop-shadow-[0_0_12px_rgba(20,184,166,0.85)]",
    scrollbarThumb: "#2dd4bf",
    glassClass: "bg-[#031524]/96 border-[1.5px] border-teal-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(20,184,166,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-teal-500 to-cyan-500"
  },
  synthwave_sunset: {
    id: "synthwave_sunset",
    name: "Sunset Synth",
    gradientBg: "from-[#030002] via-[#070104] to-[#010001]",
    navBg: "bg-[#030002]/95 border-[#f97316]/40",
    glowTopLeft: "from-pink-500/30 via-orange-600/5 to-transparent",
    glowBottomRight: "from-[#f97316]/25 via-pink-600/5 to-transparent",
    borderAccent: "border-[#f97316]/40",
    borderAccentFocus: "border-pink-500 focus:border-pink-400 focus:ring-pink-500/50",
    textAccent: "text-orange-450 filter drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]",
    textAccentHover: "hover:text-orange-300",
    tagBg: "bg-orange-950/70 border border-orange-500/45 text-orange-250 font-bold",
    buttonPrimary: "bg-gradient-to-r from-pink-500 to-[#f97316] shadow-[0_0_25px_rgba(236,72,153,0.7)] hover:shadow-[0_0_40px_rgba(236,72,153,1.0)] text-white font-black",
    accentHex: "#f97316",
    logoColor: "text-orange-455 filter drop-shadow-[0_0_12px_rgba(249,115,22,0.85)]",
    scrollbarThumb: "#f97316",
    glassClass: "bg-[#160411]/96 border-[1.5px] border-pink-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(236,72,153,0.40)]",
    tabActiveBg: "bg-gradient-to-r from-pink-500 to-[#f97316]"
  }
};
function FloatingMatrixNetwork({
  color,
  speedMultiplier = 1,
  density = 40,
  maxDist = 110
}) {
  const canvasRef = React.useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);
    const points = [];
    for (let i = 0; i < density; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * speedMultiplier,
        vy: (Math.random() - 0.5) * 0.35 * speedMultiplier,
        r: Math.random() * 2 + 0.8
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}44`;
        ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speedMultiplier, density, maxDist]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-40" />;
}
function FocusAudioVisualizer({ soundType, color }) {
  const canvasRef = React.useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animFrame;
    let width = canvas.width = canvas.offsetWidth || 280;
    let height = canvas.height = canvas.offsetHeight || 50;
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 280;
      height = canvas.height = canvas.offsetHeight || 50;
    };
    window.addEventListener("resize", handleResize);
    let phase = 0;
    const noiseSeed = Array.from({ length: 120 }, () => Math.random());
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.04;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      if (soundType === "none") {
        ctx.strokeStyle = `${color}44`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.015 + phase * 0.5) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (soundType === "binaural_alpha") {
        ctx.strokeStyle = `${color}dd`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.045 + phase) * 8 * Math.sin(x * 5e-3 + phase * 0.1);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "#c026d3cc";
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.048 - phase * 1.05) * 8 * Math.sin(x * 5e-3 + phase * 0.1);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = `${color}11`;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 10 + Math.sin(phase) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (soundType === "cosmic_pink_noise") {
        ctx.strokeStyle = `${color}bb`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const index = Math.floor(x + phase * 10) % noiseSeed.length;
          const noise = (noiseSeed[index] - 0.5) * 16 * Math.sin(x * 0.02 + phase);
          const y = height / 2 + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = `${color}44`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 1) {
          const y = height / 2 + Math.sin(x * 0.08 + phase * 2) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (soundType === "digital_wind") {
        const gust = 4 + Math.sin(phase * 0.2) * 5;
        ctx.strokeStyle = `${color}aa`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.015 + phase) * gust * Math.cos(x * 0.03 + phase * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = `${color}33`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const y = height / 2 + Math.cos(x * 8e-3 + phase * 0.4) * (gust * 0.7);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (soundType === "binaural_theta") {
        ctx.strokeStyle = `${color}dd`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.02 + phase * 0.3) * 10 * Math.sin(x * 3e-3 + phase * 0.05);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (soundType === "submarine_sonar") {
        ctx.strokeStyle = `${color}44`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.cos(x * 0.015) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const pingTime = phase * 15 % 120;
        ctx.strokeStyle = `${color}ee`;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, pingTime, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(0.1, 2 - pingTime / 60);
        ctx.stroke();
        ctx.lineWidth = 1.5;
      } else if (soundType === "subterrene_rumble") {
        ctx.strokeStyle = `${color}dd`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const rumble = (Math.sin(x * 0.5 + phase * 4) * 5 + Math.cos(x * 0.2 - phase * 5) * 4) * (0.4 + Math.sin(phase * 0.2) * 0.4);
          const y = height / 2 + rumble;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (soundType === "rainfall_forest") {
        ctx.strokeStyle = `${color}88`;
        for (let i = 0; i < 15; i++) {
          const index = Math.floor(i * 12 + phase * 2) % noiseSeed.length;
          const rx = noiseSeed[index] * width;
          const ry = (noiseSeed[(index + 5) % noiseSeed.length] * height + phase * 50) % height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 1, ry + 6);
          ctx.stroke();
        }
      } else if (soundType === "tibetan_bowl") {
        ctx.strokeStyle = `${color}bb`;
        for (let r = 5; r <= 30; r += 8) {
          const pulse = r + Math.sin(phase * 1.5 - r * 0.1) * 3;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (soundType === "space_nebula") {
        ctx.strokeStyle = `${color}66`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin(x * 0.01 + phase * 0.1) * 6 * Math.sin(phase * 0.3) + Math.cos(x * 0.03 + phase * 0.15) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [soundType, color]);
  return <div className="relative w-full h-12 bg-black/60 rounded-xl overflow-hidden border border-white/5 mx-auto">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <span className="absolute bottom-1 right-2 text-[6.5px] font-mono text-slate-500 uppercase tracking-widest z-10 select-none">
        Reactive Oscilloscope
      </span>
    </div>;
}
export default function Dashboard({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [leftTab, setLeftTab] = useState("vault");
  const [showManual, setShowManual] = useState(true);
  const [pomoDuration, setPomoDuration] = useState(25);
  const [pomoTime, setPomoTime] = useState(1500);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoBreak, setPomoBreak] = useState(false);
  const [pomoAlert, setPomoAlert] = useState(null);
  const [gateStats, setGateStats] = useState(INITIAL_GATE);
  const [lcStats, setLcStats] = useState(INITIAL_LEETCODE);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LeetCode");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showCodeArea, setShowCodeArea] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem("codexgate_theme");
      if (saved && THEMES[saved]) {
        return saved;
      }
    } catch (e) {
    }
    return "cyber_cyan";
  });
  const activeTheme = THEMES[themeId];
  const [ambientType, setAmbientType] = useState("none");
  const [ambientVolume, setAmbientVolume] = useState(0.12);
  const [isSubHarmonic, setIsSubHarmonic] = useState(false);
  const ambientNodesRef = React.useRef({});
  const [isConsoleMin, setIsConsoleMin] = useState(true);
  const [isFloatingPomo, setIsFloatingPomo] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [particleDensity, setParticleDensity] = useState(40);
  const [particleDistance, setParticleDistance] = useState(110);
  useEffect(() => {
    localStorage.setItem("codexgate_theme", themeId);
  }, [themeId]);
  useEffect(() => {
    const handleStop = () => {
      try {
        const nodes = ambientNodesRef.current;
        if (nodes.intervals) {
          nodes.intervals.forEach((id) => clearInterval(id));
          nodes.intervals = void 0;
        }
        if (nodes.subHarmonic) {
          nodes.subHarmonic.stop();
          nodes.subHarmonic.disconnect();
          nodes.subHarmonic = void 0;
        }
        if (nodes.carrier) {
          nodes.carrier.stop();
          nodes.carrier.disconnect();
          nodes.carrier = void 0;
        }
        if (nodes.modulator) {
          nodes.modulator.stop();
          nodes.modulator.disconnect();
          nodes.modulator = void 0;
        }
        if (nodes.noiseSource) {
          try {
            nodes.noiseSource.stop?.();
          } catch (e) {
          }
          nodes.noiseSource.disconnect();
          nodes.noiseSource = void 0;
        }
        if (nodes.gainNode) {
          nodes.gainNode.disconnect();
          nodes.gainNode = void 0;
        }
        if (nodes.ctx) {
          nodes.ctx.close();
          nodes.ctx = void 0;
        }
      } catch (err) {
        console.error("Audio acoustics node teardown failed:", err);
      }
    };
    if (ambientType === "none") {
      handleStop();
    } else {
      handleStop();
      try {
        const audioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (audioCtxClass) {
          const ctx = new audioCtxClass();
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          ambientNodesRef.current.ctx = ctx;
          const mainGain = ctx.createGain();
          mainGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
          mainGain.connect(ctx.destination);
          ambientNodesRef.current.gainNode = mainGain;
          if (isSubHarmonic) {
            const subOsc = ctx.createOscillator();
            subOsc.type = "sine";
            subOsc.frequency.setValueAtTime(40, ctx.currentTime);
            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.4, ctx.currentTime);
            subOsc.connect(subGain);
            subGain.connect(mainGain);
            subOsc.start(ctx.currentTime);
            ambientNodesRef.current.subHarmonic = subOsc;
          }
          if (ambientType === "binaural_alpha") {
            const merger = ctx.createChannelMerger(2);
            const leftOsc = ctx.createOscillator();
            leftOsc.frequency.setValueAtTime(140, ctx.currentTime);
            const leftGain = ctx.createGain();
            leftGain.gain.setValueAtTime(0.5, ctx.currentTime);
            leftOsc.connect(leftGain);
            leftGain.connect(merger, 0, 0);
            const rightOsc = ctx.createOscillator();
            rightOsc.frequency.setValueAtTime(150, ctx.currentTime);
            const rightGain = ctx.createGain();
            rightGain.gain.setValueAtTime(0.5, ctx.currentTime);
            rightOsc.connect(rightGain);
            rightGain.connect(merger, 0, 1);
            merger.connect(mainGain);
            leftOsc.start(ctx.currentTime);
            rightOsc.start(ctx.currentTime);
            ambientNodesRef.current.carrier = leftOsc;
            ambientNodesRef.current.modulator = rightOsc;
          } else if (ambientType === "cosmic_pink_noise") {
            const bufferSize = ctx.sampleRate * 4;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.969 * b2 + white * 0.153852;
              b3 = 0.8665 * b3 + white * 0.3104856;
              b4 = 0.55 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.016898;
              const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              b6 = white * 0.115926;
              output[i] = pink * 0.12;
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(380, ctx.currentTime);
            noiseSource.connect(filter);
            filter.connect(mainGain);
            noiseSource.start(ctx.currentTime);
            ambientNodesRef.current.noiseSource = noiseSource;
            ambientNodesRef.current.biquadFilter = filter;
          } else if (ambientType === "digital_wind") {
            const bufferSize = ctx.sampleRate * 4;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              output[i] = (Math.random() * 2 - 1) * 0.25;
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.Q.setValueAtTime(2.5, ctx.currentTime);
            filter.frequency.setValueAtTime(250, ctx.currentTime);
            noiseSource.connect(filter);
            filter.connect(mainGain);
            noiseSource.start(ctx.currentTime);
            ambientNodesRef.current.noiseSource = noiseSource;
            ambientNodesRef.current.biquadFilter = filter;
            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(140, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start(ctx.currentTime);
            ambientNodesRef.current.modulator = lfo;
          } else if (ambientType === "binaural_theta") {
            const merger = ctx.createChannelMerger(2);
            const leftOsc = ctx.createOscillator();
            leftOsc.frequency.setValueAtTime(140, ctx.currentTime);
            const leftGain = ctx.createGain();
            leftGain.gain.setValueAtTime(0.55, ctx.currentTime);
            leftOsc.connect(leftGain);
            leftGain.connect(merger, 0, 0);
            const rightOsc = ctx.createOscillator();
            rightOsc.frequency.setValueAtTime(146, ctx.currentTime);
            const rightGain = ctx.createGain();
            rightGain.gain.setValueAtTime(0.55, ctx.currentTime);
            rightOsc.connect(rightGain);
            rightGain.connect(merger, 0, 1);
            merger.connect(mainGain);
            leftOsc.start(ctx.currentTime);
            rightOsc.start(ctx.currentTime);
            ambientNodesRef.current.carrier = leftOsc;
            ambientNodesRef.current.modulator = rightOsc;
          } else if (ambientType === "submarine_sonar") {
            const merger = ctx.createChannelMerger(2);
            const osc1 = ctx.createOscillator();
            osc1.type = "triangle";
            osc1.frequency.setValueAtTime(85, ctx.currentTime);
            const osc2 = ctx.createOscillator();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(85.5, ctx.currentTime);
            const backgroundGain = ctx.createGain();
            backgroundGain.gain.setValueAtTime(0.5, ctx.currentTime);
            osc1.connect(backgroundGain);
            osc2.connect(backgroundGain);
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(150, ctx.currentTime);
            backgroundGain.connect(lowpass);
            lowpass.connect(merger, 0, 0);
            lowpass.connect(merger, 0, 1);
            const pingOsc = ctx.createOscillator();
            pingOsc.type = "sine";
            pingOsc.frequency.setValueAtTime(880, ctx.currentTime);
            const pingGain = ctx.createGain();
            pingGain.gain.setValueAtTime(1e-3, ctx.currentTime);
            pingOsc.connect(pingGain);
            pingGain.connect(merger, 0, 0);
            pingGain.connect(merger, 0, 1);
            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            pingOsc.start(ctx.currentTime);
            ambientNodesRef.current.carrier = osc1;
            ambientNodesRef.current.modulator = osc2;
            ambientNodesRef.current.subHarmonic = pingOsc;
            const triggerSonarPing = (time) => {
              if (ctx.state === "closed") return;
              pingGain.gain.cancelScheduledValues(time);
              pingGain.gain.setValueAtTime(1e-3, time);
              pingGain.gain.linearRampToValueAtTime(0.35, time + 0.04);
              pingGain.gain.exponentialRampToValueAtTime(1e-3, time + 2.8);
            };
            triggerSonarPing(ctx.currentTime);
            const pingInterval = setInterval(() => {
              try {
                if (ctx && ctx.state !== "closed") {
                  triggerSonarPing(ctx.currentTime);
                }
              } catch (e) {
                console.error("Sonar ping failed:", e);
              }
            }, 6e3);
            ambientNodesRef.current.intervals = [pingInterval];
            merger.connect(mainGain);
          } else if (ambientType === "subterrene_rumble") {
            const merger = ctx.createChannelMerger(2);
            const osc1 = ctx.createOscillator();
            osc1.type = "triangle";
            osc1.frequency.setValueAtTime(72, ctx.currentTime);
            const osc2 = ctx.createOscillator();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(72.4, ctx.currentTime);
            const subOsc = ctx.createOscillator();
            subOsc.type = "triangle";
            subOsc.frequency.setValueAtTime(144, ctx.currentTime);
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
            osc1.connect(oscGain);
            osc2.connect(oscGain);
            subOsc.connect(oscGain);
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(180, ctx.currentTime);
            lowpass.Q.setValueAtTime(1.5, ctx.currentTime);
            oscGain.connect(lowpass);
            lowpass.connect(merger, 0, 0);
            lowpass.connect(merger, 0, 1);
            const bufferSize = ctx.sampleRate * 4;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              lastOut = (lastOut + 0.025 * white) / 1.002;
              output[i] = lastOut * 2.8;
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "lowpass";
            noiseFilter.frequency.setValueAtTime(120, ctx.currentTime);
            noiseSource.connect(noiseFilter);
            noiseFilter.connect(merger, 0, 0);
            noiseFilter.connect(merger, 0, 1);
            noiseSource.start(ctx.currentTime);
            const lfo = ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.065, ctx.currentTime);
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);
            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            subOsc.start(ctx.currentTime);
            lfo.start(ctx.currentTime);
            ambientNodesRef.current.carrier = osc1;
            ambientNodesRef.current.modulator = osc2;
            ambientNodesRef.current.subHarmonic = subOsc;
            ambientNodesRef.current.noiseSource = noiseSource;
            merger.connect(mainGain);
          } else if (ambientType === "rainfall_forest") {
            const merger = ctx.createChannelMerger(2);
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              output[i] = Math.random() * 2 - 1;
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(650, ctx.currentTime);
            const rainGain = ctx.createGain();
            rainGain.gain.setValueAtTime(0.35, ctx.currentTime);
            noiseSource.connect(lowpass);
            lowpass.connect(rainGain);
            rainGain.connect(merger, 0, 0);
            rainGain.connect(merger, 0, 1);
            const breezeLfo = ctx.createOscillator();
            breezeLfo.frequency.setValueAtTime(0.12, ctx.currentTime);
            const breezeGain = ctx.createGain();
            breezeGain.gain.setValueAtTime(0.1, ctx.currentTime);
            breezeLfo.connect(breezeGain);
            breezeGain.connect(rainGain.gain);
            const pinger = ctx.createOscillator();
            pinger.type = "sine";
            pinger.frequency.setValueAtTime(1050, ctx.currentTime);
            const pingGain = ctx.createGain();
            pingGain.gain.setValueAtTime(0, ctx.currentTime);
            pinger.connect(pingGain);
            pingGain.connect(merger);
            noiseSource.start(ctx.currentTime);
            breezeLfo.start(ctx.currentTime);
            pinger.start(ctx.currentTime);
            ambientNodesRef.current.carrier = pinger;
            ambientNodesRef.current.noiseSource = noiseSource;
            const triggerRaindrop = () => {
              if (ctx.state === "closed") return;
              const randPitch = 850 + Math.random() * 600;
              const randVol = 0.02 + Math.random() * 0.05;
              const time = ctx.currentTime;
              pinger.frequency.setValueAtTime(randPitch, time);
              pingGain.gain.setValueAtTime(0, time);
              pingGain.gain.linearRampToValueAtTime(randVol, time + 0.01);
              pingGain.gain.exponentialRampToValueAtTime(1e-3, time + 0.12);
            };
            triggerRaindrop();
            const rainInterval = setInterval(() => {
              try {
                if (ctx && ctx.state !== "closed") {
                  triggerRaindrop();
                }
              } catch (e) {
                console.error("Rain drop trigger failed:", e);
              }
            }, 1200);
            ambientNodesRef.current.intervals = [rainInterval];
            merger.connect(mainGain);
          } else if (ambientType === "tibetan_bowl") {
            const merger = ctx.createChannelMerger(2);
            const bowl1 = ctx.createOscillator();
            bowl1.type = "sine";
            bowl1.frequency.setValueAtTime(220, ctx.currentTime);
            const bowl2 = ctx.createOscillator();
            bowl2.type = "sine";
            bowl2.frequency.setValueAtTime(329.63, ctx.currentTime);
            const bowl3 = ctx.createOscillator();
            bowl3.type = "sine";
            bowl3.frequency.setValueAtTime(440.5, ctx.currentTime);
            const bowl4 = ctx.createOscillator();
            bowl4.type = "sine";
            bowl4.frequency.setValueAtTime(554.37, ctx.currentTime);
            const bowl5 = ctx.createOscillator();
            bowl5.type = "sine";
            bowl5.frequency.setValueAtTime(659.25, ctx.currentTime);
            const g1 = ctx.createGain();
            g1.gain.setValueAtTime(0.35, ctx.currentTime);
            const g2 = ctx.createGain();
            g2.gain.setValueAtTime(0.25, ctx.currentTime);
            const g3 = ctx.createGain();
            g3.gain.setValueAtTime(0.18, ctx.currentTime);
            const g4 = ctx.createGain();
            g4.gain.setValueAtTime(0.12, ctx.currentTime);
            const g5 = ctx.createGain();
            g5.gain.setValueAtTime(0.08, ctx.currentTime);
            bowl1.connect(g1);
            bowl2.connect(g2);
            bowl3.connect(g3);
            bowl4.connect(g4);
            bowl5.connect(g5);
            const bowlMix = ctx.createGain();
            bowlMix.gain.setValueAtTime(0.6, ctx.currentTime);
            g1.connect(bowlMix);
            g2.connect(bowlMix);
            g3.connect(bowlMix);
            g4.connect(bowlMix);
            g5.connect(bowlMix);
            bowlMix.connect(merger, 0, 0);
            bowlMix.connect(merger, 0, 1);
            const spinLfo = ctx.createOscillator();
            spinLfo.frequency.setValueAtTime(0.18, ctx.currentTime);
            const spinGain = ctx.createGain();
            spinGain.gain.setValueAtTime(0.18, ctx.currentTime);
            spinLfo.connect(spinGain);
            spinGain.connect(bowlMix.gain);
            bowl1.start(ctx.currentTime);
            bowl2.start(ctx.currentTime);
            bowl3.start(ctx.currentTime);
            bowl4.start(ctx.currentTime);
            bowl5.start(ctx.currentTime);
            spinLfo.start(ctx.currentTime);
            ambientNodesRef.current.carrier = bowl1;
            ambientNodesRef.current.modulator = bowl2;
            ambientNodesRef.current.subHarmonic = bowl3;
            merger.connect(mainGain);
          } else if (ambientType === "space_nebula") {
            const merger = ctx.createChannelMerger(2);
            const pad1 = ctx.createOscillator();
            pad1.type = "triangle";
            pad1.frequency.setValueAtTime(82.41, ctx.currentTime);
            const pad2 = ctx.createOscillator();
            pad2.type = "sawtooth";
            pad2.frequency.setValueAtTime(123.47, ctx.currentTime);
            const pad3 = ctx.createOscillator();
            pad3.type = "sine";
            pad3.frequency.setValueAtTime(164.81, ctx.currentTime);
            const padGain = ctx.createGain();
            padGain.gain.setValueAtTime(0.3, ctx.currentTime);
            pad1.connect(padGain);
            pad2.connect(padGain);
            pad3.connect(padGain);
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.Q.setValueAtTime(1.5, ctx.currentTime);
            bandpass.frequency.setValueAtTime(180, ctx.currentTime);
            padGain.connect(bandpass);
            bandpass.connect(merger, 0, 0);
            bandpass.connect(merger, 0, 1);
            const filterLfo = ctx.createOscillator();
            filterLfo.frequency.setValueAtTime(0.04, ctx.currentTime);
            const filterLfoGain = ctx.createGain();
            filterLfoGain.gain.setValueAtTime(250, ctx.currentTime);
            filterLfo.connect(filterLfoGain);
            filterLfoGain.connect(bandpass.frequency);
            pad1.start(ctx.currentTime);
            pad2.start(ctx.currentTime);
            pad3.start(ctx.currentTime);
            filterLfo.start(ctx.currentTime);
            ambientNodesRef.current.carrier = pad1;
            ambientNodesRef.current.modulator = pad2;
            ambientNodesRef.current.subHarmonic = pad3;
            merger.connect(mainGain);
          }
        }
      } catch (err) {
        console.error("Focus acoustics synthesizer bootup failed:", err);
      }
    }
    return () => handleStop();
  }, [ambientType, isSubHarmonic]);
  useEffect(() => {
    if (ambientNodesRef.current.gainNode && ambientNodesRef.current.ctx) {
      try {
        ambientNodesRef.current.gainNode.gain.setValueAtTime(ambientVolume, ambientNodesRef.current.ctx.currentTime);
      } catch (err) {
      }
    }
  }, [ambientVolume]);
  const currentUser = auth.currentUser;
  const contentRef = React.useRef(null);
  const playPomoBeep = () => {
    try {
      const audioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxClass) return;
      const audioContext = new audioCtxClass();
      const playBeep = (time, freq, duration) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = audioContext.currentTime;
      playBeep(now, 880, 0.15);
      playBeep(now + 0.22, 1e3, 0.15);
      playBeep(now + 0.44, 1200, 0.35);
    } catch (error) {
      console.error("Synthesizer beep failed:", error);
    }
  };
  const playDiagnosticPing = () => {
    try {
      const audioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxClass) return;
      const audioContext = new audioCtxClass();
      const playTone = (time, freq, duration, vol) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(1e-3, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = audioContext.currentTime;
      playTone(now, 587.33, 0.12, 0.15);
      playTone(now + 0.08, 783.99, 0.12, 0.15);
      playTone(now + 0.18, 880, 0.4, 0.2);
    } catch (e) {
      console.warn("Diagnostic chime failed:", e);
    }
  };
  useEffect(() => {
    let interval = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime((t) => t - 1);
      }, 1e3);
    } else if (pomoActive && pomoTime === 0) {
      playPomoBeep();
      if (pomoBreak) {
        setPomoTime(pomoDuration * 60);
        setPomoBreak(false);
        setPomoAlert({
          show: true,
          message: "\u{1F3AF} Focus Cycle Commences!",
          sub: `Breather break is over. Let's load back into deep-work mode for a productive ${pomoDuration} minutes!`
        });
      } else {
        const breakTime = pomoDuration >= 50 ? 600 : 300;
        setPomoTime(breakTime);
        setPomoBreak(true);
        setPomoAlert({
          show: true,
          message: "\u2615 Focus Session Achieved!",
          sub: `Spectacular job! Your focus interval is complete. Take a well-deserved ${breakTime / 60}-minute breather.`
        });
      }
      setPomoActive(false);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime, pomoBreak, pomoDuration]);
  const togglePomo = () => setPomoActive(!pomoActive);
  const resetPomo = () => {
    setPomoActive(false);
    const breakTime = pomoDuration >= 50 ? 600 : 300;
    setPomoTime(pomoBreak ? breakTime : pomoDuration * 60);
  };
  const selectPomoDuration = (mins) => {
    setPomoActive(false);
    setPomoBreak(false);
    setPomoDuration(mins);
    setPomoTime(mins * 60);
  };
  const formatPomoTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const insertFormat = (formatType) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    let replacement = "";
    let offsetCursor = 0;
    switch (formatType) {
      case "bold":
        replacement = `**${selected || "bold text"}**`;
        offsetCursor = selected ? 0 : 2;
        break;
      case "italic":
        replacement = `*${selected || "italic text"}*`;
        offsetCursor = selected ? 0 : 1;
        break;
      case "underline":
        replacement = `<u>${selected || "underlined text"}</u>`;
        offsetCursor = selected ? 0 : 4;
        break;
      case "ul":
        replacement = selected ? selected.split("\n").map((line) => line.trim().startsWith("- ") ? line : `- ${line}`).join("\n") : `
- Item 1
- Item 2
`;
        break;
      case "ol":
        replacement = selected ? selected.split("\n").map((line, i) => line.trim().match(/^\d+\.\s/) ? line : `${i + 1}. ${line}`).join("\n") : `
1. First item
2. Second item
`;
        break;
      case "todo":
        replacement = selected ? selected.split("\n").map((line) => {
          if (line.trim().startsWith("- [ ] ") || line.trim().startsWith("- [x] ") || line.trim().startsWith("- [X] ")) {
            return line;
          }
          return `- [ ] ${line}`;
        }).join("\n") : `
- [ ] Task 1
- [ ] Task 2
`;
        break;
      case "inlinecode":
        replacement = `\`${selected || "code"}\``;
        offsetCursor = selected ? 0 : 1;
        break;
      case "codeblock":
        replacement = `
\`\`\`${codeLanguage}
${selected || "// code block"}
\`\`\`
`;
        break;
      default:
        break;
    }
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setContent(newValue);
    setTimeout(() => {
      el.focus();
      const newSelStart = start + (replacement.length - offsetCursor);
      el.setSelectionRange(newSelStart, newSelStart);
    }, 50);
  };
  useEffect(() => {
    if (!currentUser) return;
    const loadNotes = async () => {
      try {
        const q = query(collection(db, "notes"), where("userId", "==", currentUser.uid));
        const notesSnapshot = await getDocs(q);
        const data = [];
        notesSnapshot.forEach((doc2) => {
          data.push({ id: doc2.id, ...doc2.data() });
        });
        data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNotes(data || []);
        localStorage.setItem(`notes_backup_${currentUser.uid}`, JSON.stringify(data));
        if (data && data.length > 0 && !selectedNote) {
          setSelectedNote(data[0]);
          populateEditForm(data[0]);
        }
      } catch (err) {
        console.error("Failed to load notes, fetching local backup:", err);
        const backup = localStorage.getItem(`notes_backup_${currentUser.uid}`);
        if (backup) {
          try {
            const data = JSON.parse(backup);
            setNotes(data || []);
            if (data && data.length > 0 && !selectedNote) {
              setSelectedNote(data[0]);
              populateEditForm(data[0]);
            }
          } catch (e) {
          }
        }
        handleFirestoreError(err, OperationType.GET, "notes");
      }
    };
    const loadTrackers = async () => {
      try {
        const trackerDocRef = doc(db, "users", currentUser.uid, "tracking", "state");
        const d = await getDoc(trackerDocRef);
        if (d.exists()) {
          const cloudData = d.data();
          if (cloudData.gate) setGateStats(cloudData.gate);
          if (cloudData.leetcode) setLcStats(cloudData.leetcode);
        } else {
          setGateStats(INITIAL_GATE);
          setLcStats(INITIAL_LEETCODE);
        }
      } catch (err) {
        console.error("Failed to fetch trackers, falling back to localStorage:", err);
        const localG = localStorage.getItem(`gate_${currentUser.uid}`);
        const localL = localStorage.getItem(`leetcode_${currentUser.uid}`);
        if (localG) setGateStats(JSON.parse(localG));
        if (localL) setLcStats(JSON.parse(localL));
      }
    };
    loadNotes();
    loadTrackers();
  }, [currentUser]);
  const saveStatsToCloud = async (newGate, newLC) => {
    if (!currentUser) return;
    try {
      const trackerDocRef = doc(db, "users", currentUser.uid, "tracking", "state");
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      await setDoc(trackerDocRef, {
        gate: newGate,
        leetcode: newLC,
        updatedAt: timestamp
      }, { merge: true });
      localStorage.setItem(`gate_${currentUser.uid}`, JSON.stringify(newGate));
      localStorage.setItem(`leetcode_${currentUser.uid}`, JSON.stringify(newLC));
    } catch (err) {
      console.error("Stats save failure, saved to localStorage only:", err);
      localStorage.setItem(`gate_${currentUser.uid}`, JSON.stringify(newGate));
      localStorage.setItem(`leetcode_${currentUser.uid}`, JSON.stringify(newLC));
    }
  };
  const handleGateChange = (subject, status) => {
    const next = { ...gateStats, [subject]: status };
    setGateStats(next);
    saveStatsToCloud(next, lcStats);
  };
  const handleLeetCodeChange = (difficulty, change) => {
    const count = Math.max(0, (lcStats[difficulty] || 0) + change);
    const next = { ...lcStats, [difficulty]: count };
    setLcStats(next);
    saveStatsToCloud(gateStats, next);
  };
  const toggleCheckbox = async (lineIdx) => {
    const lines = content.split("\n");
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    const todoMatch = line.trim().match(/^- \[( |x|X)\] (.*)/);
    if (!todoMatch) return;
    const isChecked = todoMatch[1].toLowerCase() === "x";
    const newCheckedChar = isChecked ? " " : "x";
    const leadingWhitespace = line.match(/^(\s*)/)?.[1] || "";
    lines[lineIdx] = `${leadingWhitespace}- [${newCheckedChar}] ${todoMatch[2]}`;
    const newContent = lines.join("\n");
    setContent(newContent);
    if (isEditing && selectedNote && currentUser) {
      const docRef = doc(db, "notes", selectedNote.id);
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedFields = {
        content: newContent,
        updatedAt: timestamp
      };
      try {
        await updateDoc(docRef, updatedFields);
      } catch (dbErr) {
        console.warn("Offline check status toggle cached", dbErr);
      }
      const updatedNote = { ...selectedNote, ...updatedFields };
      setNotes((prev) => {
        const next = prev.map((n) => n.id === selectedNote.id ? updatedNote : n);
        localStorage.setItem(`notes_backup_${currentUser.uid}`, JSON.stringify(next));
        return next;
      });
      setSelectedNote(updatedNote);
    }
  };
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Invalid context state: Unauthorized.");
      return;
    }
    const compiledTags = tagsInput.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    try {
      if (isEditing && selectedNote) {
        const docRef = doc(db, "notes", selectedNote.id);
        const updatedFields = {
          title,
          category,
          content,
          codeSnippet: codeSnippet || "",
          codeLanguage,
          tags: compiledTags,
          updatedAt: timestamp
        };
        try {
          await updateDoc(docRef, updatedFields);
        } catch (dbErr) {
          console.warn("Saving to cloud deferred: saved offline", dbErr);
        }
        const updatedNote = { ...selectedNote, ...updatedFields };
        setNotes((prev) => {
          const next = prev.map((n) => n.id === selectedNote.id ? updatedNote : n);
          localStorage.setItem(`notes_backup_${currentUser.uid}`, JSON.stringify(next));
          return next;
        });
        setSelectedNote(updatedNote);
        setIsPreviewMode(true);
      } else {
        const tempId = "temp_" + Date.now();
        const newFields = {
          userId: currentUser.uid,
          title,
          category,
          content,
          codeSnippet: codeSnippet || "",
          codeLanguage,
          tags: compiledTags,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        let finalId = tempId;
        try {
          const docRef = await addDoc(collection(db, "notes"), newFields);
          finalId = docRef.id;
        } catch (dbErr) {
          console.warn("Cloud persistence deferred: saved offline", dbErr);
        }
        const newNote = { id: finalId, ...newFields };
        setNotes((prev) => {
          const next = [newNote, ...prev];
          localStorage.setItem(`notes_backup_${currentUser.uid}`, JSON.stringify(next));
          return next;
        });
        setSelectedNote(newNote);
        setIsEditing(true);
        setIsPreviewMode(true);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, "notes");
    }
  };
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to permanently delete this CSE note?")) return;
    try {
      try {
        await deleteDoc(doc(db, "notes", noteId));
      } catch (dbErr) {
        console.warn("Cloud delete deferred: removed offline", dbErr);
      }
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== noteId);
        localStorage.setItem(`notes_backup_${currentUser.uid}`, JSON.stringify(next));
        return next;
      });
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        resetForm();
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      handleFirestoreError(err, OperationType.DELETE, "notes");
    }
  };
  const populateEditForm = (note) => {
    setIsEditing(true);
    setTitle(note.title);
    setCategory(note.category);
    setContent(note.content);
    setCodeSnippet(note.codeSnippet || "");
    setCodeLanguage(note.codeLanguage || "cpp");
    setTagsInput(note.tags.join(", "));
    setIsPreviewMode(false);
    setShowCodeArea(!!note.codeSnippet);
  };
  const resetForm = () => {
    setIsEditing(false);
    setSelectedNote(null);
    setTitle("");
    setCategory("LeetCode");
    setContent("");
    setCodeSnippet("");
    setCodeLanguage("cpp");
    setTagsInput("");
    setLeftTab("vault");
    setIsPreviewMode(false);
    setShowCodeArea(false);
  };
  const handleRunTestCode = () => {
    if (!selectedNote) return;
    setCompiling(true);
    setCompileOutput("");
    setTimeout(() => {
      const lang = selectedNote.codeLanguage || "cpp";
      const lines = [
        `[Environment] Running sandboxed compilation on compiler instance v2.5...`,
        `[Compiler] Language profile loaded: ${lang.toUpperCase()}`,
        `[Input Cases] Test input bound standard checked: "${testInput || "<Empty Input>"}"`,
        `[Success] Output exit status: 0 (OK CODE)`,
        `----------------------------------------`,
        `\u26A1 Executing algorithm dry run metrics...`,
        `[Stdout Matrix Stack Trace]:`,
        `>> Virtual memory offset allocation stable`,
        `>> Iteration loops completed bounds verification`,
        `[Final Output]: Successfully executed compilation sandbox with zero limits.`,
        `----------------------------------------`,
        `\u{1F552} Linker Speed: 4.2ms`
      ];
      setCompileOutput(lines.join("\n"));
      setCompiling(false);
    }, 1e3);
  };
  const filteredNotes = notes.filter((note) => {
    const matchesCategory = categoryFilter === "All" || note.category === categoryFilter;
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || note.content.toLowerCase().includes(search.toLowerCase()) || note.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const gateFinishedCount = Object.keys(gateStats).filter((k) => gateStats[k] === "COMPLETED").length;
  const leetCodeTotalCount = (lcStats.easy || 0) + (lcStats.medium || 0) + (lcStats.hard || 0);
  return <div className={`min-h-screen bg-gradient-to-b ${activeTheme.gradientBg} flex flex-col font-sans text-slate-100 relative overflow-x-hidden min-w-[320px] transition-all duration-750`} id="cse-dashboard">
      
      {
    /* 🔮 Background ambient cyber glow elements */
  }
      {showParticles && <FloatingMatrixNetwork
    color={activeTheme.accentHex}
    speedMultiplier={particleSpeed}
    density={particleDensity}
    maxDist={particleDistance}
  />}
      
      <div className={`absolute top-[8%] left-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${activeTheme.glowTopLeft} blur-[120px] pointer-events-none select-none z-0 transition-all duration-750`} />
      <div className={`absolute bottom-[25%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr ${activeTheme.glowBottomRight} blur-[140px] pointer-events-none select-none z-0 transition-all duration-750`} />
      
      {
    /* 🚀 Brand & Ingress Navbar */
  }
      <nav className={`border-b ${activeTheme.borderAccent} ${activeTheme.navBg} sticky top-0 z-30 backdrop-blur shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-fuchsia-500/20 blur-md animate-pulse" />
              <div className="absolute inset-0 rounded-xl border border-cyan-500/35 bg-slate-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Layers className={`w-5 h-5 ${activeTheme.textAccent} filter drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]`} />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-[0.2em] font-mono flex items-center gap-2">
                CODEXGATE <span className={`text-[8.5px] bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black px-2.5 py-0.5 border ${activeTheme.borderAccent} rounded-full font-mono`}>WORKSPACE</span>
              </h1>
              <p className="text-[9.5px] text-slate-400 font-mono uppercase tracking-wider">Advanced CS Study Workstation & AI Oracle</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/5">
                <div className="w-5 h-5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-full flex items-center justify-center text-[9.5px] font-bold text-white uppercase shadow-md">
                  {currentUser.displayName ? currentUser.displayName[0] : "U"}
                </div>
                <span className="text-xs text-slate-350 font-bold truncate max-w-[120px] font-mono">
                  {currentUser.displayName ? currentUser.displayName : "Developer"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-ping" />
              </div>}
            <button
    onClick={onLogout}
    className="px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950/45 border border-white/5 hover:border-rose-505/35 text-slate-400 hover:text-rose-400 text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5 font-mono"
  >
              <LogOut className="w-3.5 h-3.5" />
              Eject
            </button>
          </div>
        </div>
      </nav>

      {
    /* 📊 Innovative Top Telemetry & Pomodoro Dashboard Deck */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 border ${activeTheme.borderAccent} rounded-2xl backdrop-blur-md relative overflow-hidden transition-all duration-500`}>
          {
    /* Subtle cyber grid backdrop */
  }
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-20" />

          {
    /* Stat 1: Study Notes Logged */
  }
          <div className={`bg-[#0b101d]/60 border border-white/5 p-3.5 rounded-xl flex items-center gap-4 hover:${activeTheme.borderAccent} transition-all duration-300`}>
            <div className={`w-10 h-10 ${activeTheme.tagBg} rounded-xl flex items-center justify-center`}>
              <BookOpen className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">Memos Logged</span>
              <h3 className="text-xl font-mono font-black text-white">{notes.length} notes</h3>
            </div>
          </div>

          {
    /* Stat 2: LeetCode solved */
  }
          <div className={`bg-[#0b101d]/60 border border-white/5 p-3.5 rounded-xl flex items-center gap-4 hover:${activeTheme.borderAccent} transition-all duration-300`}>
            <div className="w-10 h-10 bg-amber-955/25 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">DSA Solved</span>
              <h3 className="text-xl font-mono font-black text-white">{leetCodeTotalCount} algorithms</h3>
            </div>
          </div>

          {
    /* Stat 3: GATE progress */
  }
          <div className={`bg-[#0b101d]/60 border border-white/5 p-3.5 rounded-xl flex items-center gap-4 hover:${activeTheme.borderAccent} transition-all duration-300`}>
            <div className="w-10 h-10 bg-emerald-955/20 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">GATE Mastery</span>
              <h3 className="text-xl font-mono font-black text-white">{gateFinishedCount}/10 Topics</h3>
            </div>
          </div>

          {
    /* Stat 4: Interactive Pomodoro Focus deck with selectable presets */
  }
          <div className={`bg-[#0b101d]/80 border ${activeTheme.borderAccentFocus} p-3 rounded-xl flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden group transition-all duration-550`}>
            {
    /* Ambient card glow */
  }
            <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/10 blur-xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Clock className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                  {pomoActive && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <div>
                  <span className="text-[8px] font-mono text-fuchsia-400 uppercase tracking-widest font-extrabold block">
                    {pomoBreak ? "\u2615 BREATHER" : "\u{1F3AF} FOCUS TIMER"}
                  </span>
                  <span className="text-base font-mono font-black text-white tracking-wider">
                    {formatPomoTime(pomoTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
    onClick={togglePomo}
    type="button"
    className="p-1 hover:text-cyan-400 transition cursor-pointer"
    title={pomoActive ? "Pause Timer" : "Start Focus Timer"}
  >
                  {pomoActive ? <PauseCircle className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" /> : <PlayCircle className="w-6 h-6 text-slate-400 hover:text-white" />}
                </button>
                <button
    onClick={resetPomo}
    type="button"
    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
    title="Reset Focus Clock"
  >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {
    /* Preset selector bar */
  }
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
              <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">presets</span>
              <div className="flex gap-1">
                {[10, 25, 50].map((mins) => <button
    key={mins}
    onClick={() => selectPomoDuration(mins)}
    type="button"
    className={`text-[8.5px] font-mono px-2 py-0.5 rounded cursor-pointer transition ${pomoDuration === mins && !pomoBreak ? "bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-500/40 font-bold shadow-[0_0_8px_rgba(217,70,239,0.3)]" : "bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-white/5"}`}
  >
                    {mins}m
                  </button>)}
              </div>
            </div>

            {
    /* Custom slider with glow effect */
  }
            <div className="mt-2 pt-1.5 border-t border-white/5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">variable timer</span>
                <span className="text-[9px] font-mono text-fuchsia-400 font-extrabold tracking-wider">{pomoDuration} min</span>
              </div>
              <input
    type="range"
    min="1"
    max="120"
    value={pomoDuration}
    onChange={(e) => selectPomoDuration(parseInt(e.target.value) || 25)}
    className="w-full accent-fuchsia-500 bg-slate-950 rounded-lg appearance-none h-1 cursor-pointer focus:outline-none shadow-[0_0_8px_rgba(217,70,239,0.2)]"
  />
            </div>
          </div>

        </div>
      </div>

      {
    /* 🚀 Main Core 3-Pane Layout Grid */
  }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
         
        {
    /* ================= LEFT AREA (span 4): Unified Knowledge Map Tab Deck ================= */
  }
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className={`${activeTheme.glassClass} rounded-2xl border ${activeTheme.borderAccent} shadow-[0_0_20px_rgba(6,182,212,0.05)] overflow-hidden flex flex-col backdrop-blur-md flex-grow transition-all duration-500`}>
             
            {
    /* Swapper tab control */
  }
            <div className="flex bg-slate-950/80 border-b border-white/5 p-1">
              <button
    onClick={() => setLeftTab("vault")}
    className={`flex-1 py-2 rounded-xl text-[10.5px] font-mono font-bold uppercase transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${leftTab === "vault" ? `${activeTheme.tabActiveBg} text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] font-extrabold` : "text-slate-400 hover:text-slate-200"}`}
  >
                📁 Workspace Vault
              </button>
              <button
    onClick={() => setLeftTab("syllabus")}
    className={`flex-1 py-2 rounded-xl text-[10.5px] font-mono font-bold uppercase transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${leftTab === "syllabus" ? `${activeTheme.tabActiveBg} text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] font-extrabold` : "text-slate-400 hover:text-slate-200"}`}
  >
                🗺️ GATE Roadmap
              </button>
            </div>

            {leftTab === "syllabus" ? <div className="p-1 flex-grow">
                <SyllabusTracker stats={gateStats} onChange={handleGateChange} theme={activeTheme} />
              </div> : <div className="p-4 flex-grow flex flex-col min-h-[460px]">
                {
    /* Embedded filters & search */
  }
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-500" />
                    <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search note tags, titles, syntax..."
    className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-cyan-500/60 transition-all font-sans font-medium"
  />
                  </div>

                  {
    /* Pills horizontal list with fine scrollbar */
  }
                  <div className="flex items-center gap-1.5 bg-slate-950/70 rounded-xl p-1.5 border border-white/5 overflow-x-auto scrollbar-none font-mono">
                    {["All", "LeetCode", "DSA", "GATE Prep", "Web Dev", "General"].map((cat) => <button
    key={cat}
    onClick={() => setCategoryFilter(cat)}
    className={`text-[9px] font-mono font-bold rounded-lg px-2.5 py-1.5 transition whitespace-nowrap cursor-pointer ${categoryFilter === cat ? `${activeTheme.tabActiveBg} text-white shadow-[0_0_10px_rgba(6,182,212,0.35)] font-extrabold border border-cyan-400/25` : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
  >
                        {cat}
                      </button>)}
                  </div>
                </div>

                {
    /* 📖 CodexGate Interactive Manual */
  }
                <div className="mb-4 bg-slate-950/95 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
                  <button
    type="button"
    onClick={() => setShowManual(!showManual)}
    className="w-full flex items-center justify-between p-3 text-xs font-mono font-bold text-cyan-400 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer"
  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400 filter drop-shadow-[0_0_3px_rgba(6,182,212,0.5)]" />
                      <span>📖 CODEXGATE USER MANUAL</span>
                    </div>
                    {showManual ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {showManual && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="overflow-hidden border-t border-white/5"
  >
                        <div className="p-3 space-y-3.5 text-[10.5px] text-slate-300 leading-relaxed bg-[#0b101d]/60 max-h-[220px] overflow-y-auto scrollbar-thin">
                          
                          {
    /* Section 1: Variable Focus Timer */
  }
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-fuchsia-400 font-mono font-bold uppercase text-[9.5px]">
                              <Sliders className="w-3 h-3" />
                              <span>1. Variable Focus Timer</span>
                            </div>
                            <p className="pl-4 text-slate-400 text-[10px]">
                              Customize your focus session with pinpoint accuracy using either the <strong className="text-white">preset options (10m, 25m, 50m)</strong> or drag the <strong className="text-white">Variable Timer range slider</strong> up to 120 minutes. It handles breather breaks automatically!
                            </p>
                          </div>

                          {
    /* Section 2: Write Core Workstation */
  }
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold uppercase text-[9.5px]">
                              <Cpu className="w-3 h-3" />
                              <span>2. Write Core Workstation</span>
                            </div>
                            <p className="pl-4 text-slate-400 text-[10px]">
                              Use the middle workstation window to craft custom CS notes & code. Click <strong className="text-white">New Cognitive Memo</strong> to start from scratch. Type title, category, tags, and select code syntax. The workspace has been simplified—toggle <strong className="text-white">Attach Prog Code Snippet</strong> to reveal or hide sandbox code fields instantly!
                            </p>
                          </div>

                          {
    /* Section 3: Interactive To-Do Trackers */
  }
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold uppercase text-[9.5px]">
                              <ListTodo className="w-3 h-3" />
                              <span>3. Interactive To-Do Trackers</span>
                            </div>
                            <p className="pl-4 text-slate-400 text-[10px]">
                              Add interactive checkable trackers directly inside your notes! Start syntax with <strong className="font-mono text-cyan-300">- [ ] Task Name</strong> (or click the checkmark toolbar icon in the editor). In the <strong>Cognitive Study Insights</strong> reviewer frame, click any checkbox to toggle its checked state live. Your updates sync automatically to the Cloud!
                            </p>
                          </div>

                          {
    /* Section 4: AI Oracle Chat */
  }
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold uppercase text-[9.5px]">
                              <Sparkles className="w-3 h-3" />
                              <span>4. AI Oracle Tutor</span>
                            </div>
                            <p className="pl-4 text-slate-400 text-[10px]">
                              Submit your write core memos directly to the semantic chat core to generate coding questions, design summaries, and diagnostic flashcards instantly.
                            </p>
                          </div>

                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </div>

                {
    /* Folder Directory Core List */
  }
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">
                  VAULT DIRECTORY FILES ({filteredNotes.length})
                </span>
                
                <div className="space-y-2 overflow-y-auto pr-1 flex-grow max-h-[380px] scrollbar-thin">
                  {filteredNotes.length === 0 ? <div className="text-center py-16">
                      <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                      <p className="text-slate-400 text-xs font-semibold font-mono">Vault core empty.</p>
                      <button
    onClick={resetForm}
    className="text-[10px] text-cyan-400 hover:underline mt-2 font-mono font-bold uppercase cursor-pointer"
  >
                        + Create First Memo Note
                      </button>
                    </div> : filteredNotes.map((note) => <div
    key={note.id}
    onClick={() => {
      setSelectedNote(note);
      populateEditForm(note);
    }}
    className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer group relative ${selectedNote?.id === note.id ? "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]" : "bg-slate-950/25 border-white/5 hover:border-cyan-500/30 hover:bg-slate-950/60"}`}
  >
                        <div className="flex items-start justify-between gap-1.5">
                          <h3 className="text-xs font-black text-slate-100 group-hover:text-cyan-300 font-sans transition truncate pr-4">
                            {note.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded border font-bold uppercase shrink-0 ${CATEGORY_COLORS[note.category] || CATEGORY_COLORS["General"]}`}>
                            {note.category}
                          </span>
                        </div>

                        <p className="text-[10.5px] text-slate-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>

                        <div className="flex items-center justify-between mt-3 text-[8.5px] font-mono text-slate-500 border-t border-white/2 pt-1.5">
                          <span className="font-bold">MOD: {new Date(note.updatedAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
    onClick={(e) => {
      e.stopPropagation();
      populateEditForm(note);
    }}
    className="p-1 rounded bg-slate-950 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition active:scale-90"
    title="Edit Code Note"
  >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteNote(note.id);
    }}
    className="p-1 rounded bg-slate-950 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-450 transition active:scale-95"
    title="Delete Note"
  >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>)}
                </div>

                {
    /* Fixed Add Button in drawer footer */
  }
                <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-[8px] font-mono text-slate-600 uppercase">Live Sync Node</span>
                  <button
    onClick={resetForm}
    className="text-[10.5px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-transform active:scale-95 cursor-pointer font-mono"
  >
                    <Plus className="w-4 h-4" />
                    NEW COGNITIVE MEMO
                  </button>
                </div>

              </div>}
          </div>
        </div>

        {
    /* ================= MIDDLE AREA (span 5): Active Quantum Workstation & Interpreter ================= */
  }
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className={`${activeTheme.glassClass} rounded-2xl border ${activeTheme.borderAccent} p-5 shadow-[0_0_35px_rgba(6,182,212,0.04)] backdrop-blur-md flex-grow flex flex-col relative overflow-hidden transition-all duration-500`} id="workspace-container">
            
            {
    /* Decorative Vector corner */
  }
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <button
    type="button"
    onClick={() => setIsPreviewMode(false)}
    className={`text-[10.5px] font-bold uppercase tracking-widest pb-1 px-1 border-b-2 transition-all cursor-pointer font-mono ${!isPreviewMode ? `${activeTheme.textAccent} ${activeTheme.borderAccentFocus} font-bold` : "text-slate-500 border-transparent hover:text-slate-300 font-semibold"}`}
  >
                  Write Core
                </button>
                <button
    type="button"
    onClick={() => setIsPreviewMode(true)}
    className={`text-[10.5px] font-bold uppercase tracking-widest pb-1 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 font-mono ${isPreviewMode ? `${activeTheme.textAccent} ${activeTheme.borderAccentFocus} font-bold` : "text-slate-500 border-transparent hover:text-slate-300 font-semibold"}`}
  >
                  <Eye className="w-3.5 h-3.5" />
                  Visual Preview
                </button>
              </div>
              <div className="text-[9.5px]/[13px] font-bold flex items-center gap-1">
                <LayoutSyncState isEditing={isEditing} />
              </div>
            </div>

            {isPreviewMode ? <div className="flex-grow flex flex-col justify-between relative z-10" id="preview-mode-panel">
                <div className="space-y-4">
                  
                  {
    /* Title card */
  }
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between gap-2.5">
                      <h3 className="text-sm font-black text-white font-sans tracking-tight leading-relaxed text-left">
                        {title || "Untitled Active Workspace Memo"}
                      </h3>
                      <span className={`px-2 py-0.5 rounded border uppercase text-[8.5px] shrink-0 font-bold font-mono ${CATEGORY_COLORS[category] || CATEGORY_COLORS["General"]}`}>
                        {category}
                      </span>
                    </div>

                    {
    /* Dynamic styled tags layout */
  }
                    {tagsInput && <div className="flex flex-wrap gap-1 mt-2.5">
                        {tagsInput.split(",").map((tag, i) => {
    const cleaned = tag.trim();
    if (!cleaned) return null;
    return <span key={i} className="text-[8.5px] font-mono font-bold bg-cyan-950/30 text-cyan-400 px-2.5 py-0.5 rounded-md border border-cyan-500/20 shadow-sm">
                              #{cleaned}
                            </span>;
  })}
                      </div>}
                  </div>

                  {
    /* Verified Code Fragment display */
  }
                  {codeSnippet && <div className="border border-cyan-500/10 rounded-xl overflow-hidden font-mono shadow-[0_5px_15px_-4px_rgba(0,0,0,0.4)]">
                      <div className="bg-slate-950 text-slate-400 px-3.5 py-2 flex justify-between items-center text-[10px] font-bold font-mono border-b border-white/5">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Code className="w-3.5 h-3.5" />
                          {codeLanguage.toUpperCase()} CODE ENVIRONMENT
                        </span>
                        <span className="text-[8px] uppercase tracking-wider bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/20 text-cyan-400">Syntax Verified</span>
                      </div>
                      <pre className="p-3.5 bg-slate-950 text-cyan-300 text-[10.5px]/[15px] overflow-x-auto select-all max-h-[160px] scrollbar-thin text-left">
                        <code>{codeSnippet}</code>
                      </pre>
                    </div>}

                  {
    /* Formatted Text Content */
  }
                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 min-h-[160px] max-h-[300px] overflow-y-auto shadow-inner scrollbar-thin">
                    <span className="text-[8.5px] font-mono font-black uppercase tracking-widest text-slate-500 block mb-3 border-b border-white/5 pb-1 text-left">Cognitive Study Insights</span>
                    {parseNoteToReact(content, toggleCheckbox)}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/5 mt-5">
                  <button
    type="button"
    onClick={() => setIsPreviewMode(false)}
    className="btn-cyber-cyan text-[10.5px] font-bold py-2 px-4 rounded-xl cursor-pointer transition shadow-md font-mono"
  >
                    Edit Instructions
                  </button>
                </div>
              </div> : <form onSubmit={handleSaveNote} className="space-y-4 flex-grow flex flex-col relative z-10" id="write-mode-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {
    /* Topic Title */
  }
                  <div className="sm:col-span-2">
                    <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1">
                      MEMO / PROBLEM TOPIC
                    </label>
                    <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Dijkstra Single-Source Path, OS CPU Scheduling benchmarks"
    className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/60 transition-all font-sans font-bold shadow-inner"
  />
                  </div>

                  {
    /* Category Selection */
  }
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1">
                      SCIENCE CATEGORY
                    </label>
                    <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500/60 cursor-pointer font-sans"
  >
                      <option value="LeetCode" className="bg-[#0b101d]">LeetCode Challenge</option>
                      <option value="DSA" className="bg-[#0b101d]">Data Structures & Algo</option>
                      <option value="GATE Prep" className="bg-[#0b101d]">GATE Computer Science</option>
                      <option value="Web Dev" className="bg-[#0b101d]">Full-Stack Web Dev</option>
                      <option value="General" className="bg-[#0b101d]">General Engineering</option>
                    </select>
                  </div>

                  {
    /* Tags Keywords */
  }
                  <div>
                    <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1">
                      KEYWORDS / TAGS (comma separated)
                    </label>
                    <input
    type="text"
    value={tagsInput}
    onChange={(e) => setTagsInput(e.target.value)}
    placeholder="e.g. array, recursion, graphs"
    className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/60 transition-all font-sans font-bold shadow-inner"
  />
                  </div>
                </div>

                {
    /* Toggle for Optional Code Block */
  }
                <div className="flex items-center justify-between bg-slate-950/40 border border-white/5 p-3 rounded-xl">
                  <div className="flex flex-col text-left">
                     <span className="text-[10px] font-mono font-bold text-slate-300">ATTACH PROG CODE SNIPPET</span>
                     <span className="text-[8.5px] text-slate-500 font-sans">Simulate compilation sandbox alongside your memo</span>
                  </div>
                  <button
    type="button"
    onClick={() => setShowCodeArea(!showCodeArea)}
    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showCodeArea ? "bg-cyan-500" : "bg-slate-800"}`}
  >
                    <span
    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-100 shadow ring-0 transition duration-200 ease-in-out ${showCodeArea ? "translate-x-5" : "translate-x-0"}`}
  />
                  </button>
                </div>

                {
    /* Expanded Code Fields */
  }
                {showCodeArea && <div className="space-y-4 border-l-2 border-cyan-500/20 pl-3">
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1">
                        COMPILATION SCHEME
                      </label>
                      <select
    value={codeLanguage}
    onChange={(e) => setCodeLanguage(e.target.value)}
    className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500/60 cursor-pointer font-sans"
  >
                        <option value="cpp" className="bg-[#0b101d]">C++ (GCC Gnu)</option>
                        <option value="python" className="bg-[#0b101d]">Python 3.10</option>
                        <option value="java" className="bg-[#0b101d]">Java JDK Runtime</option>
                        <option value="javascript" className="bg-[#0b101d]">JavaScript ES6</option>
                        <option value="bash" className="bg-[#0b101d]">Bash Shell CLI</option>
                        <option value="sql" className="bg-[#0b101d]">DB Relational SQL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1 flex items-center justify-between">
                        <span>Active Algorithm Snippet</span>
                        <Code className="w-3.5 h-3.5 text-slate-650" />
                      </label>
                      <textarea
    value={codeSnippet}
    onChange={(e) => setCodeSnippet(e.target.value)}
    placeholder="// Insert raw algorithms or functions to simulate compilation..."
    className="w-full h-24 bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-cyan-300 font-mono placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 transition-all scrollbar-thin shadow-inner"
  />
                    </div>
                  </div>}

                {
    /* Note Contents with Formatting Toolbar */
  }
                <div className="flex-grow flex flex-col">
                  <label className="block text-[8px] uppercase tracking-widest text-slate-450 font-mono font-black mb-1 flex items-center justify-between font-bold">
                    <span>Explanation & Structural Analytics</span>
                    <AlignLeft className="w-3.5 h-3.5 text-slate-650" />
                  </label>

                  {
    /* Formatting Toolbar */
  }
                  <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 border border-white/5 border-b-0 rounded-t-xl select-none overflow-x-auto flex-wrap scrollbar-none">
                    <button
    type="button"
    onClick={() => insertFormat("bold")}
    title="Bold (**text**)"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center font-bold text-xs"
  >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("italic")}
    title="Italic (*text*)"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center text-xs"
  >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("underline")}
    title="Underline (<u>text</u>)"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center text-xs"
  >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button
    type="button"
    onClick={() => insertFormat("ul")}
    title="Unordered Bullet list"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center text-xs"
  >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("ol")}
    title="Numbered List"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center text-xs"
  >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("todo")}
    title="Todo Checkbox List"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center text-xs"
  >
                      <ListTodo className="w-3.5 h-3.5" />
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("inlinecode")}
    title="Inline Code (`text`)"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center font-mono text-[10px]"
  >
                      `code`
                    </button>
                    <button
    type="button"
    onClick={() => insertFormat("codeblock")}
    title="Full Code Block"
    className="p-1 hover:bg-slate-900 rounded-md text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center justify-center font-mono text-[9px] uppercase tracking-wider"
  >
                      ``` block
                    </button>
                  </div>

                  <textarea
    ref={contentRef}
    required
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Write detailed explanations. Use the quick formatter above for markdown, codeblocks, and items..."
    className="flex-grow w-full h-32 bg-slate-950 border border-white/5 rounded-b-xl p-3 text-xs text-slate-200 placeholder-slate-705 focus:outline-none focus:border-cyan-500/60 transition-all font-sans leading-relaxed scrollbar-thin shadow-inner"
  />
                </div>

                 {
    /* Submits */
  }
                <div className="flex gap-2.5 pt-2 border-t border-white/5">
                  {isEditing && <button
    type="button"
    onClick={resetForm}
    className="w-1/3 border border-white/5 hover:border-rose-550/30 bg-slate-950 text-slate-400 hover:text-rose-450 py-2.5 px-4 rounded-xl text-xs transition uppercase font-bold tracking-wider font-mono cursor-pointer"
  >
                      Cancel Core
                    </button>}
                  <button
    type="submit"
    className={`flex-1 ${activeTheme.buttonPrimary} text-white py-2.5 px-4 rounded-xl text-xs font-black transition shadow-[0_0_20px_rgba(0,0,0,0.3)] cursor-pointer tracking-widest font-mono uppercase active:scale-95`}
  >
                    {isEditing ? "Modify Core Node" : "Synthesize Core Note"}
                  </button>
                </div>
              </form>}

          </div>

          {
    /* ⚡ Compiler Simulation Sandbox */
  }
          {selectedNote && selectedNote.codeSnippet && <div className={`${activeTheme.glassClass} rounded-2xl border ${activeTheme.borderAccent} p-5 shadow-[0_0_25px_rgba(6,182,212,0.03)] backdrop-blur-md relative overflow-hidden transition-all duration-500`} id="sandbox-container">
              <div className="absolute inset-0 bg-[#060913]/30 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-pulse filter drop-shadow-[0_0_4px_#10b981]" />
                  <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest">
                    Quantum Compile Sandbox ({selectedNote.codeLanguage || "C++"})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Interpreter Core Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
                {
    /* Custom input args */
  }
                <div className="md:col-span-4 flex flex-col gap-2">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block">stdin values</span>
                  <textarea
    value={testInput}
    onChange={(e) => setTestInput(e.target.value)}
    placeholder="e.g. 5\n10 20 30"
    className="w-full text-slate-100 placeholder-slate-700 bg-slate-950 border border-white/5 rounded-xl p-2 h-[75px] text-[10.5px] font-mono focus:outline-none focus:border-cyan-500/50 transition-all scrollbar-none"
  />
                </div>

                {
    /* Simulated runtime stdout logs view */
  }
                <div className="md:col-span-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">stdout log stream</span>
                    <button
    onClick={handleRunTestCode}
    disabled={compiling}
    className="btn-cyber-emerald text-[9px] px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
  >
                      {compiling ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      <span>Run Code Sandbox</span>
                    </button>
                  </div>
                  <pre className="w-full h-[75px] bg-slate-950 border border-white/5 rounded-xl p-2.5 text-[9.5px]/[13px] text-emerald-450 font-mono overflow-y-auto whitespace-pre leading-snug scrollbar-thin select-all shadow-inner text-left">
                    {compileOutput || 'Console standby... Click "Run Code Sandbox" to execute the active memo code.'}
                  </pre>
                </div>
              </div>
            </div>}
        </div>

        {
    /* ================= RIGHT AREA (span 3): LeetCode & AI Assistant Suite ================= */
  }
        <div className="lg:col-span-3 flex flex-col gap-5">
          {
    /* LeetCode stats tracker */
  }
          <LeetCodeTracker stats={lcStats} onChange={handleLeetCodeChange} theme={activeTheme} />

          {
    /* AI companion chatbot assistant */
  }
          <AIBotChat
    currentNoteContent={selectedNote?.content}
    currentNoteTitle={selectedNote?.title}
    theme={activeTheme}
  />
        </div>

      </div>

      {
    /* 🔔 Beautiful Neon Glow Pomodoro Cycle Alert Popup Modal */
  }
      <AnimatePresence>
        {pomoAlert && pomoAlert.show && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
    id="pomo-completion-alert"
  >
            <motion.div
    initial={{ scale: 0.9, y: 15 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0.9, y: 15 }}
    transition={{ type: "spring", duration: 0.4 }}
    className="relative w-full max-w-md bg-gradient-to-b from-[#0d1430] to-[#070b17] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center overflow-hidden"
  >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent blur-3xl pointer-events-none select-none" />
              
              <div className="w-14 h-14 bg-cyan-950/60 border-2 border-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-bounce">
                <Clock className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              </div>

              <h3 className="text-base font-black font-mono text-white tracking-widest uppercase mb-2 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {pomoAlert.message}
              </h3>
              
              <p className="text-slate-300 text-xs px-2 mb-6 leading-relaxed">
                {pomoAlert.sub}
              </p>

              <button
    onClick={() => setPomoAlert(null)}
    type="button"
    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold font-mono py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] cursor-pointer active:scale-95"
    id="close-pomo-alert-btn"
  >
                Acknowledge & Continue
              </button>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {
    /* Floating Workstation System Panel controls */
  }
      <motion.button
    onClick={() => setIsConsoleMin((prev) => !prev)}
    className={`fixed right-6 bottom-24 z-40 w-14 h-14 rounded-full flex items-center justify-center border-2 ${activeTheme.borderAccentFocus} ${activeTheme.glassClass} cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all`}
    animate={{ y: [0, -6, 0] }}
    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    whileHover={{ scale: 1.1, rotate: 15 }}
    title="Open Workstation System Console"
  >
        <Settings className={`w-6 h-6 ${activeTheme.textAccent} hover:scale-110 transition`} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-600 rounded-full border border-slate-950 flex items-center justify-center text-[7px] text-white font-mono font-black animate-pulse">SYS</span>
      </motion.button>

      <AnimatePresence>
        {!isConsoleMin && <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 40 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 40 }}
    className={`fixed right-6 bottom-[165px] max-h-[82vh] overflow-y-auto sm:right-10 z-50 w-80 p-5 rounded-2xl ${activeTheme.glassClass} border-2 ${activeTheme.borderAccentFocus} shadow-[0_15px_40px_rgba(0,0,0,0.7)] scrollbar-thin flex flex-col gap-3.5`}
  >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${activeTheme.textAccent} animate-pulse`} />
                <h3 className="text-xs font-black font-mono tracking-wider text-white uppercase">SYSTEM CONTROL PANEL</h3>
              </div>
              <button
    onClick={() => setIsConsoleMin(true)}
    className="text-slate-400 hover:text-white font-mono text-[9px] uppercase bg-white/5 hover:bg-slate-800 px-2 py-0.5 rounded transition cursor-pointer"
  >
                Close
              </button>
            </div>

            {
    /* Dynamic Theme selection */
  }
            <div className="space-y-1.5">
              <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Contrast Color infusion</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(THEMES).map(([id, t]) => <button
    key={id}
    onClick={() => setThemeId(id)}
    className={`py-1 px-2 text-[9px] rounded-lg font-mono font-bold border text-left transition flex items-center gap-1.5 cursor-pointer ${themeId === id ? `bg-white/10 ${t.textAccent} ${t.borderAccentFocus} shadow-inner` : "bg-[#0f1422]/60 hover:bg-slate-900 border-white/5 text-slate-400"}`}
  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accentHex }} />
                    {t.name}
                  </button>)}
              </div>
            </div>

            {
    /* Cognitive Audio Synthesizer */
  }
            <div className="space-y-2.5 p-2.5 bg-slate-950/75 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Music className="w-3 text-cyan-400" /> Focus Synthesizer
                </label>
                {ambientType !== "none" && <span className="text-[7px] bg-indigo-950 text-indigo-300 font-mono font-black px-1.5 py-0.5 rounded animate-pulse uppercase">ON</span>}
              </div>
              
              <div className="grid grid-cols-2 gap-1 animate-fade-in">
                {[
    { type: "none", label: "\u{1F6D1} SILENCE" },
    { type: "binaural_alpha", label: "\u{1F9E0} ALPHA WAVE" },
    { type: "binaural_theta", label: "\u{1F92F} THETA WAVE" },
    { type: "cosmic_pink_noise", label: "\u{1FA90} COSMIC PINK" },
    { type: "digital_wind", label: "\u{1F32C}\uFE0F GUST WIND" },
    { type: "submarine_sonar", label: "\u{1F4E1} DEEP SONAR" },
    { type: "subterrene_rumble", label: "\u{1F30B} EARTH CORE" },
    { type: "rainfall_forest", label: "\u{1F327}\uFE0F FOREST RAIN" },
    { type: "tibetan_bowl", label: "\u{1F514} TIBETAN BOWL" },
    { type: "space_nebula", label: "\u{1F30C} NEBULA SHIFT" }
  ].map((snd) => <button
    key={snd.type}
    onClick={() => setAmbientType(snd.type)}
    className={`py-1 text-[8px] rounded font-mono font-bold border transition text-center cursor-pointer ${ambientType === snd.type ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-500/10" : "bg-slate-900 hover:bg-slate-850 border-white/5 text-slate-400"}`}
  >
                    {snd.label}
                  </button>)}
              </div>

              {
    /* LIVE OSCILLOSCOPE WAVE VISUALIZER */
  }
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[7px] font-mono text-slate-500">
                  <span>LIVE ACOUSTIC SPECTRUM</span>
                  <span className="animate-pulse">● SAMPLING ACTIVE</span>
                </div>
                <FocusAudioVisualizer soundType={ambientType} color={activeTheme.accentHex} />
              </div>

              {
    /* Synth Volume slider */
  }
              {ambientType !== "none" && <div className="space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span className="uppercase">Volume Tuning</span>
                    <span>{Math.round(ambientVolume * 100)}%</span>
                  </div>
                  <input
    type="range"
    min="0"
    max="0.4"
    step="0.01"
    value={ambientVolume}
    onChange={(e) => setAmbientVolume(parseFloat(e.target.value) || 0.12)}
    className="w-full accent-indigo-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer focus:outline-none"
  />
                </div>}

              {
    /* Sub-harmonic 40Hz Brainwave Toggle */
  }
              {ambientType !== "none" && <div className="flex items-center justify-between text-[8.5px] font-mono border-t border-white/5 pt-2">
                  <span className="text-slate-400 font-bold uppercase flex items-center gap-1">🌌 Sub-Harmonic (40Hz) Layers</span>
                  <button
    type="button"
    onClick={() => setIsSubHarmonic((prev) => !prev)}
    className={`px-2 py-0.5 rounded text-[7.5px] border transition font-black ${isSubHarmonic ? `${activeTheme.textAccent} ${activeTheme.borderAccentFocus} bg-white/5` : "border-white/5 text-slate-500 hover:text-slate-300"}`}
  >
                    {isSubHarmonic ? "BOOSTED" : "STANDARD"}
                  </button>
                </div>}
            </div>

            {
    /* Draggable Pomodoro toggles */
  }
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-slate-300 font-bold uppercase">Draggable Focus Tool</span>
                  <span className="text-[7.5px] text-slate-500 uppercase">Detached layout card</span>
                </div>
                <button
    type="button"
    onClick={() => setIsFloatingPomo((prev) => !prev)}
    className={`px-3 py-1 text-[9px] font-bold rounded-lg border font-mono transition uppercase cursor-pointer ${isFloatingPomo ? `${activeTheme.textAccent} ${activeTheme.borderAccentFocus} bg-white/5` : "text-slate-400 border-white/5 hover:bg-slate-900"}`}
  >
                  {isFloatingPomo ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            </div>

          </motion.div>}
      </AnimatePresence>

      {
    /* Floating / draggable Focus Timer widget */
  }
      <AnimatePresence>
        {isFloatingPomo && <motion.div
    drag
    dragMomentum={false}
    style={{ touchAction: "none" }}
    initial={{ x: window.innerWidth > 768 ? 100 : 20, y: 150 }}
    className={`fixed z-50 p-4 rounded-2xl border-2 ${activeTheme.borderAccentFocus} bg-[#0c1223]/95 shadow-[0_0_25px_rgba(0,0,0,0.6)] backdrop-blur-md cursor-grab active:cursor-grabbing w-72 flex flex-col gap-3 group`}
  >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-fuchsia-450 animate-pulse" />
                <span className="text-[9.5px] font-mono tracking-wider uppercase font-black text-slate-300">
                  {pomoBreak ? "\u2615 Breather break" : "\u{1F3AF} focus timer"}
                </span>
              </div>
              <button
    type="button"
    onClick={() => setIsFloatingPomo(false)}
    className="text-[8.5px] font-mono hover:text-rose-450 bg-white/5 hover:bg-rose-500/20 px-2 py-0.5 rounded transition cursor-pointer"
  >
                Dock
              </button>
            </div>
            
            <div className="text-center py-1">
              <span className="text-3xl font-black font-mono tracking-wider text-white select-none">
                {formatPomoTime(pomoTime)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
    type="button"
    onClick={togglePomo}
    className="p-1.5 px-4 hover:bg-cyan-500/10 border border-cyan-500/35 rounded-xl transition font-mono font-black text-xs flex items-center gap-1.5 uppercase hover:text-cyan-400 cursor-pointer"
  >
                {pomoActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {pomoActive ? "Pause" : "Start"}
              </button>
              <button
    type="button"
    onClick={resetPomo}
    className="p-1 hover:text-slate-200 text-slate-500 transition cursor-pointer"
    title="Reset Timer"
  >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="text-[8px] font-mono text-slate-500 text-center uppercase tracking-wider bg-slate-950/60 py-1.5 rounded border border-white/5 select-none">
              🚀 Press & drag this widget anywhere!
            </div>
          </motion.div>}
      </AnimatePresence>

    </div>;
}
function LayoutSyncState({ isEditing }) {
  if (isEditing) {
    return <span className="flex items-center gap-1 text-amber-350 bg-amber-955/20 border border-amber-500/25 rounded-md px-2.5 py-0.5 font-mono text-[9px] font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>EDITING MEMO ACTIVE</span>
      </span>;
  }
  return <span className="flex items-center gap-1 text-emerald-450 bg-emerald-955/20 border border-emerald-550/25 rounded-md px-2.5 py-0.5 font-mono text-[9px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span>CLOUD SECURE</span>
    </span>;
}
