import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  Globe, 
  BrainCircuit, 
  Zap, 
  HelpCircle, 
  ExternalLink,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  searchUrls?: string[];
}

export type ChatMode = 'default' | 'thinking' | 'low-latency' | 'grounded';

export const CompanionChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('default');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am your Vozara LS compliance companion. Query me about translation credentials, speed limits, HIPAA, or anything else you'd like!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const presetPrompts = [
    { label: "💡 HIPAA Checklist File Formats", text: "What file formats are acceptable for HIPAA training audits?" },
    { label: "⚡ Minimum Ethernet Bandwidth", text: "What is the strict download/upload speed criteria for our workstation check?" },
    { label: "📜 Legal Special Class Criteria", text: "What continuous training hours do Legal Specialists need?" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(1), // Exclude the greeting for API history limit structure
          mode: mode
        }),
      });

      if (!res.ok) {
        throw new Error("Companion feedback offline.");
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        role: 'model',
        content: data.text || "I was unable to retrieve a response from Gemini.",
        searchUrls: data.searchUrls
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ Failed to reach Compliance AI model: ${err.message || 'Verification timed out'}. Please double check your environment's GEMINI_API_KEY.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="companion-chat-launcher"
          className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 border border-slate-800 text-white font-bold rounded-full shadow-2xl hover:bg-black group transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Bot className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
          <span className="text-xs tracking-tight">Compliance Companion AI</span>
          <span className="flex w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-550/30 shrink-0" />
        </button>
      )}

      {/* Main chat window container */}
      {isOpen && (
        <div 
          id="companion-chat-panel"
          className="w-96 h-[540px] bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-slideUp transition-all z-50 font-sans"
        >
          {/* Panel Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between relative">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  Vozara Companion
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-mono">LIVE</span>
                </h4>
                <p className="text-[9.5px] text-slate-400 font-medium">Multi-mode compliance helper</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 border-b border-slate-100 text-[10px] font-bold">
            <button
              onClick={() => setMode('default')}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'default' ? 'bg-white text-slate-905 shadow-sm border border-slate-150' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Smart Default Mode (gemini-3.5-flash)"
            >
              Default
            </button>
            <button
              onClick={() => setMode('thinking')}
              className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer ${
                mode === 'thinking' ? 'bg-indigo-50 text-indigo-805 shadow-sm border border-indigo-150' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="High Thinking Mode (gemini-3.1-pro-preview)"
            >
              <BrainCircuit className="w-3 h-3 shrink-0 text-indigo-500" />
              Thinking
            </button>
            <button
              onClick={() => setMode('low-latency')}
              className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer ${
                mode === 'low-latency' ? 'bg-amber-50 text-amber-805 shadow-sm border border-amber-150' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Low Latency Speed Mode (gemini-3.1-flash-lite)"
            >
              <Zap className="w-3 h-3 shrink-0 text-amber-500" />
              Speedy
            </button>
            <button
              onClick={() => setMode('grounded')}
              className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer ${
                mode === 'grounded' ? 'bg-sky-50 text-sky-805 shadow-sm border border-sky-150' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Web Search Grounding (gemini-3.5-flash)"
            >
              <Globe className="w-3 h-3 shrink-0 text-sky-500" />
              Search
            </button>
          </div>

          {/* Active Mode Banner */}
          <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100 text-[9px] text-slate-450 font-bold flex items-center justify-between">
            <span>
              {mode === 'default' && "⚡ Model: gemini-3.5-flash • Smart Generalist"}
              {mode === 'thinking' && "🧠 Model: gemini-3.1-pro-preview • High Thinking Level"}
              {mode === 'low-latency' && "⚡ Model: gemini-3.1-flash-lite • Low latency speed"}
              {mode === 'grounded' && "🌐 Model: gemini-3.5-flash • Real-time Web grounding"}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {messages.map((m, index) => (
              <div 
                key={index} 
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 text-[10px] font-black">
                    AI
                  </div>
                )}
                <div 
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-755 border border-slate-100 rounded-tl-none font-semibold'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                  
                  {/* Render grounding links if available */}
                  {m.searchUrls && m.searchUrls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Grounded search sources:</span>
                      {m.searchUrls.map((url, uIdx) => (
                        <a 
                          key={uIdx}
                          href={url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-sky-600 hover:underline font-bold truncate"
                        >
                          <Globe className="w-3 h-3 shrink-0 text-sky-450" />
                          <span>{url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 text-[10px] font-black animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  <span className="flex w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                  <span className="flex w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  <span className="flex w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                  <span className="text-[10px] font-bold text-slate-400">GenAI reasoning...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Chips */}
          <div className="p-2 border-t border-slate-100 bg-slate-50 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {presetPrompts.map((p, pIdx) => (
              <button
                key={pIdx}
                disabled={isLoading}
                onClick={() => handleSendMessage(p.text)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-full shrink-0 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Form Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Query HIPAA, speeds, legal continuous hours..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black hover:scale-105 transition-all text-xs font-bold disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
