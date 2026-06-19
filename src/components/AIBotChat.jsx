import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Zap, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';

const TEMPLATE_PROMPTS = [
  { label: "⚙️ Dry Run Trace", prompt: "Explain the dry run of Quick Sort on an array [5, 2, 9, 1, 5, 6] in a neat step-by-step trace." },
  { label: "🎓 Mock GATE", prompt: "Generate a tough multiple-choice GATE question on Operating Systems (like CPU Scheduling or Deadlocks) with options and detailed answer." },
  { label: "💡 Code Optimism", prompt: "How do I optimize a recursive fibonacci O(2^n) algorithm to O(n) using dynamic programming? Show the exact code." },
  { label: "🛡️ Red-Black vs AVL", prompt: "Explain the differences between AVL Tree and Red-Black Tree in terms of balance factor and rotation complexity." }
];

export default function AIBotChat({ currentNoteContent, currentNoteTitle, theme }) {
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
    tabActiveBg: "bg-gradient-to-r from-cyan-500 to-indigo-550"
  };

  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      role: "model",
      content: "👋 Greetings, Engineer! I am your AI Computer Science Companion. Select one of the high-speed telemetry chips below, or ask me directly to perform binary dry-runs, clarify mathematical theorems, or audit your syllabus notes!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef(null);

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) {
      setInput("");
    }

    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setGenerating(true);

    try {
      const response = await fetch('/api/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           messages: [...messages, userMessage].map(m => ({
             role: m.role,
             content: m.content
           }))
         })
      });

      if (!response.ok) {
        let errMsg = "Failed to communicate with Server.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (jsonErr) {
          // Keep default message if JSON parsing fails
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: `⚠️ **Failed to get AI response**: \n\n${err.message || 'Unknown network error'}\n\n*Troubleshooting Tip: Please check your Internet connection, verify your \`GEMINI_API_KEY\` is correctly configured in Secrets, or try again. I am ready to review algorithms client-side once server connectivity is restored.*`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setGenerating(false);
    }
  };

  const reviewCurrentNote = () => {
    if (!currentNoteContent) {
      const errorMsg = {
        id: Math.random().toString(),
        role: 'model',
        content: "💡 **Note Analyzer Guide**: Please create or select a study note from your Folder Directory first. Once some description is present, click 'Analyze Note' and I will review it for optimizations, logic holes, and mathematical proofs!",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setActiveTab('chat');
      return;
    }
    const reviewPrompt = `Analyze this study note titled "${currentNoteTitle}". Provide improvements, code-snippet refactoring, or a couple of GATE-level mock questions based on the content:\n\n---\n${currentNoteContent}\n---`;
    handleSend(reviewPrompt);
  };

  const parseMarkdownInline = (text) => {
    let parts = [text];

    // Bold **some text**
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const pieces = part.split(/\*\*([\s\S]*?)\*\*/);
      return pieces.map((piece, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-white filter drop-shadow-[0_0_2.5px_rgba(255,255,255,0.2)]">{piece}</strong> : piece);
    });

    // Italic *some text*
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const pieces = part.split(/\*([\s\S]*?)\*/);
      return pieces.map((piece, i) => i % 2 === 1 ? <em key={i} className="italic font-bold" style={{ color: `${activeTheme.accentHex}dd` }}>{piece}</em> : piece);
    });

    // Inline code `some code`
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const pieces = part.split(/`([\s\S]*?)`/);
      return pieces.map((piece, i) => i % 2 === 1 ? <code key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono border font-bold" style={{ color: activeTheme.accentHex, borderColor: `${activeTheme.accentHex}25` }}>{piece}</code> : piece);
    });

    return <React.Fragment>{parts.map((p, index) => <span key={index}>{p}</span>)}</React.Fragment>;
  };

  const renderCleanMessageText = (text, keyVal) => {
    const lines = text.split('\n');
    return (
      <div key={keyVal} className="space-y-1.5 text-left text-[11px] leading-relaxed text-slate-100 font-medium">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          
          // Headings match: e.g. ### Title or ## Title
          const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            return (
              <div key={idx} className="font-extrabold tracking-tight mt-3 mb-1 text-[11.5px] font-mono border-b pb-1" style={{ color: activeTheme.accentHex, borderColor: `${activeTheme.accentHex}20` }}>
                {parseMarkdownInline(headingMatch[2])}
              </div>
            );
          }

          // Bullet match: e.g. - item or * item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2.5 my-0.5">
                <span className="font-extrabold select-none" style={{ color: activeTheme.accentHex }}>•</span>
                <span className="flex-1 text-slate-100 font-semibold">{parseMarkdownInline(content)}</span>
              </div>
            );
          }

          // Numbered match: e.g. 1. item
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2.5 my-0.5">
                <span className="font-black font-mono text-[9.5px] mt-0.5" style={{ color: activeTheme.accentHex }}>{numMatch[1]}.</span>
                <span className="flex-1 text-slate-100 font-semibold">{parseMarkdownInline(numMatch[2])}</span>
              </div>
            );
          }

          // Empty row
          if (trimmed === '') {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="leading-relaxed">
              {parseMarkdownInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to detect code blocks in reply and style them beautifully
  const renderMessageContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.split('\n');
        const language = lines[0].slice(3).trim() || 'code';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={index} className="my-3 border rounded-xl overflow-hidden font-mono text-[10px]" style={{ borderColor: `${activeTheme.accentHex}30`, boxShadow: `0 0 15px ${activeTheme.accentHex}15` }}>
            <div className="bg-[#090e17] px-3 py-1.5 border-b flex justify-between items-center font-bold font-mono" style={{ color: activeTheme.accentHex, borderColor: `${activeTheme.accentHex}20` }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeTheme.accentHex }}></span>
                {language.toUpperCase()}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Live Code Memory</span>
            </div>
            <pre className="p-3 bg-slate-950 text-emerald-400 overflow-x-auto select-all leading-relaxed font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return renderCleanMessageText(part, index);
    });
  };

  return (
    <div className={`${activeTheme.glassClass} flex flex-col h-[480px] rounded-2xl overflow-hidden text-slate-100 backdrop-blur-md relative`} id="ai-companion">
      {/* Decorative top pulse block */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-70" style={{ backgroundImage: `linear-gradient(to right, transparent, ${activeTheme.accentHex}, transparent)` }}></div>
      
      {/* Header Tabs with Glassmorphic effects */}
      <div className="flex border-b border-white/10 bg-slate-950">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3.5 text-center text-[10px] font-sans font-bold uppercase tracking-widest border-b-2 flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
            activeTab === 'chat'
              ? 'font-extrabold bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.01]'
          }`}
          style={activeTab === 'chat' ? { color: activeTheme.accentHex, borderBottomColor: activeTheme.accentHex, filter: `drop-shadow(0 0 8px ${activeTheme.accentHex}60)` } : {}}
        >
          <Terminal className="w-3.5 h-3.5" style={{ color: activeTab === 'chat' ? activeTheme.accentHex : '#94a3b8' }} />
          Quantum AI Chat
        </button>
        <button
          onClick={() => setActiveTab('note-reviewer')}
          className={`flex-1 py-3.5 text-center text-[10px] font-sans font-bold uppercase tracking-widest border-b-2 flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
            activeTab === 'note-reviewer'
              ? 'font-extrabold bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.01]'
          }`}
          style={activeTab === 'note-reviewer' ? { color: activeTheme.accentHex, borderBottomColor: activeTheme.accentHex, filter: `drop-shadow(0 0 8px ${activeTheme.accentHex}60)` } : {}}
        >
          <BookOpen className="w-3.5 h-3.5" style={{ color: activeTab === 'note-reviewer' ? activeTheme.accentHex : '#94a3b8' }} />
          Note Analyzer
        </button>
      </div>

      {activeTab === 'note-reviewer' ? (
        <div className="p-6 flex-grow flex flex-col justify-center items-center text-center bg-slate-950/40 relative">
          <div className="absolute -left-12 -bottom-12 w-28 h-28 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: `${activeTheme.accentHex}10` }}></div>
          
          <div className="w-12 h-12 rounded-full bg-slate-950/80 border flex items-center justify-center mb-3 shadow-lg" style={{ borderColor: `${activeTheme.accentHex}40` }}>
            <Sparkles className="w-6 h-6 animate-pulse" style={{ color: activeTheme.accentHex }} />
          </div>
          
          <h3 className="font-mono font-bold text-white text-xs mb-1 uppercase tracking-widest">Semantic Core Engine</h3>
          <p className="text-slate-400 text-[10px] px-2 mb-4 font-sans leading-relaxed max-w-xs">
            Submit your active workspace memo to the AI parser core to review structures, inspect complexities, and formulate interactive practice cards.
          </p>

          <div className="bg-slate-950 border border-white/5 p-3 rounded-xl max-w-xs text-left mb-5 w-full shadow-inner">
            <div className="flex items-center gap-1.5 mb-1 text-[8px] font-mono uppercase tracking-widest font-bold" style={{ color: activeTheme.accentHex }}>
              <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: activeTheme.accentHex }}></span>
              Active Target Node
            </div>
            <p className="text-[11px] text-slate-100 font-bold truncate">
              {currentNoteTitle ? currentNoteTitle : "No Note Selected"}
            </p>
          </div>

          <button
            onClick={reviewCurrentNote}
            disabled={!currentNoteContent || generating}
            className="w-full max-w-xs text-white font-black py-2.5 px-5 rounded-xl text-xs transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-35 disabled:shadow-none active:scale-[0.98]"
            style={{ 
              background: `linear-gradient(to right, ${activeTheme.accentHex}, ${activeTheme.accentHex}cc)`, 
              boxShadow: `0 0 15px ${activeTheme.accentHex}40`
            }}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Intel...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Analyze Note Now
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Chats panel */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/60 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[88%] ${
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div 
                  className={`px-3.5 py-2.5 rounded-2xl text-[11px] font-sans leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-none font-semibold border'
                      : 'bg-[#0e1424] border text-slate-100 rounded-bl-none shadow-md'
                  }`}
                  style={
                    msg.role === 'user' 
                      ? { 
                          background: `linear-gradient(90deg, ${activeTheme.accentHex}dd, ${activeTheme.accentHex}bb)`, 
                          borderColor: `${activeTheme.accentHex}40`,
                          boxShadow: `0 4px 15px -3px ${activeTheme.accentHex}40`
                        }
                      : { borderColor: `${activeTheme.accentHex}1a` }
                  }
                >
                  {renderMessageContent(msg.content)}
                </div>
                <span className="text-[7.5px] text-slate-400 font-mono mt-1 px-1 tracking-wider uppercase font-bold">{msg.timestamp}</span>
              </div>
            ))}
            {generating && (
              <div className="flex items-center gap-1.5 text-xs pl-1 font-mono" style={{ color: activeTheme.accentHex }}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeTheme.accentHex }}></span>
                <span className="opacity-80 text-[8.5px] uppercase tracking-widest animate-pulse font-black">Running semantic synthesis...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick templates - horizontally scrollable pills */}
          <div className="px-3 py-2 bg-slate-950 border-t border-white/10 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {TEMPLATE_PROMPTS.map((t, index) => (
              <button
                key={index}
                onClick={() => handleSend(t.prompt)}
                disabled={generating}
                className="bg-slate-900/80 text-[9px] font-mono tracking-wide px-2.5 py-1 rounded-full transition duration-305 cursor-pointer disabled:opacity-50 inline-block font-bold"
                style={{ 
                  color: activeTheme.accentHex, 
                  borderColor: `${activeTheme.accentHex}40`, 
                  boxShadow: `0 0 10px ${activeTheme.accentHex}15` 
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input tray */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-white/10 bg-slate-950/90 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query recursive dry runs, OS theorems, DSA..."
              disabled={generating}
              className="flex-1 bg-slate-1000 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all font-sans font-medium"
              style={{ borderColor: `${activeTheme.accentHex}30` }}
            />
            <button
              type="submit"
              disabled={!input.trim() || generating}
              className="w-9 h-9 rounded-xl disabled:opacity-30 transition-all duration-300 flex items-center justify-center cursor-pointer text-white shrink-0 active:scale-95"
              style={{ 
                backgroundColor: activeTheme.accentHex, 
                boxShadow: `0 0 18px ${activeTheme.accentHex}70` 
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
