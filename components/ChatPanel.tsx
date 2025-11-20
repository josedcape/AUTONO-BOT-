import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Theme } from '../types';
import { Send, Bot, User, Terminal, Settings, Zap, Cpu, Mic, MicOff, PanelLeftClose, RotateCw } from './Icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  theme: Theme;
  onOpenSettings: () => void;
  profileName: string;
  onToggleChat: () => void;
  onRetry?: () => void; // Added retry prop
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  theme,
  onOpenSettings,
  profileName,
  onToggleChat,
  onRetry
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Tu navegador no soporta reconocimiento de voz nativo.');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES'; // Set to Spanish
      recognition.continuous = false; 
      recognition.interimResults = true; // Real-time typing effect

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const isDark = theme === 'dark';
  
  // Futuristic color palette logic
  const bgMain = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const borderMain = isDark ? 'border-slate-800' : 'border-gray-200';
  
  return (
    <div className={`flex flex-col h-full ${bgMain} border-r ${borderMain} w-full md:w-[420px] flex-shrink-0 transition-colors duration-300 relative z-20`}>
      
      {/* Header - Futuristic HUD Style */}
      <div className={`p-5 border-b ${borderMain} ${isDark ? 'bg-slate-900/80' : 'bg-white/90'} backdrop-blur-md flex items-center justify-between shadow-lg z-30 relative overflow-hidden`}>
        {/* Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div className="flex items-center gap-4">
          <div className="relative">
             {/* Pulsar Animation Container */}
            <div className="absolute -inset-1 bg-cyan-500/30 rounded-lg blur opacity-40 animate-pulse"></div>
            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-slate-900 border border-cyan-500/50' : 'bg-white border border-cyan-400'} flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(6,182,212,0.3)]`}>
              <Zap size={22} className="text-cyan-400 fill-cyan-400/20" />
            </div>
            {/* Status Dot */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center z-20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
            </div>
          </div>
          
          <div>
            <h2 className={`font-display font-bold text-lg tracking-wider ${isDark ? 'text-white' : 'text-slate-900'} leading-none mb-1`}>
              AUTONO<span className="text-cyan-400">BOT</span>
            </h2>
            <p className={`text-[10px] uppercase tracking-[0.15em] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              Agente de navegación autónomo
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
            <button 
            onClick={onToggleChat}
            className={`p-2 rounded-lg border ${isDark ? 'border-slate-800 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-800' : 'border-gray-200 bg-white hover:bg-gray-50'} transition-all duration-300 group`}
            title="Ocultar Chat"
            >
            <PanelLeftClose size={18} className={`${isDark ? 'text-slate-400 group-hover:text-cyan-400' : 'text-gray-500 group-hover:text-cyan-600'} transition-colors`} />
            </button>

            <button 
            onClick={onOpenSettings}
            className={`p-2 rounded-lg border ${isDark ? 'border-slate-800 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-800' : 'border-gray-200 bg-white hover:bg-gray-50'} transition-all duration-300 group`}
            title="Configuración"
            >
            <Settings size={18} className={`${isDark ? 'text-slate-400 group-hover:text-cyan-400' : 'text-gray-500 group-hover:text-cyan-600'} transition-colors`} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {messages.length === 0 && (
          <div className={`mt-12 p-8 rounded-2xl border ${isDark ? 'border-cyan-900/30 bg-slate-900/40' : 'border-cyan-100 bg-white/50'} backdrop-blur-sm text-center relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
            
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? 'bg-slate-800' : 'bg-gray-100'} flex items-center justify-center border border-dashed ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
              <Bot className={`text-cyan-500`} size={32} />
            </div>
            
            <h3 className={`font-display font-bold text-xl mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>SISTEMA EN LÍNEA</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-xs mx-auto mb-6`}>
              El protocolo de navegación autónoma está listo. Indique su comando para iniciar la secuencia.
            </p>
            
            <div className="grid gap-3">
              <button 
                onClick={() => onSendMessage("Analiza las noticias tecnológicas más importantes de hoy")}
                className={`text-xs font-mono py-3 px-4 rounded border transition-all duration-300 text-left group-hover:translate-x-1 ${
                  isDark 
                    ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50 text-cyan-100 hover:shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'bg-white border-gray-200 hover:border-cyan-300 text-slate-700'
                }`}
              >
                <span className="text-cyan-500 mr-2">&gt;</span>
                "Analizar noticias tecnológicas"
              </button>
              <button 
                onClick={() => onSendMessage("Busca vuelos baratos a Tokio para noviembre")}
                className={`text-xs font-mono py-3 px-4 rounded border transition-all duration-300 text-left group-hover:translate-x-1 delay-75 ${
                  isDark 
                    ? 'bg-slate-900/80 border-slate-700 hover:border-purple-500/50 text-purple-100 hover:shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                    : 'bg-white border-gray-200 hover:border-purple-300 text-slate-700'
                }`}
              >
                <span className="text-purple-500 mr-2">&gt;</span>
                "Buscar vuelos baratos a Tokio"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isError = msg.text.startsWith('⚠️') || msg.text.includes('Error');
          
          return (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'} items-end group`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border ${
                msg.sender === Sender.AI 
                  ? (isDark ? 'bg-slate-900 border-cyan-500/30 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-600')
                  : msg.sender === Sender.SYSTEM 
                    ? (isDark ? 'bg-slate-900 border-amber-500/30 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-600')
                    : (isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-gray-100 border-gray-200 text-gray-500')
              }`}>
                {msg.sender === Sender.AI ? <Bot size={16} /> : msg.sender === Sender.SYSTEM ? <AlertIcon isError={isError} /> : <User size={16} />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col items-start max-w-[85%]">
                <div
                  className={`relative p-4 text-sm shadow-sm ${
                    msg.sender === Sender.USER
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl rounded-br-none shadow-[0_4px_15px_rgba(79,70,229,0.3)]'
                      : msg.isToolOutput 
                        ? `${isDark ? 'bg-slate-900 border-slate-700/50 text-emerald-400' : 'bg-gray-50 border-gray-200 text-emerald-700'} border border-l-4 border-l-emerald-500 font-mono text-xs rounded-r-xl rounded-tl-xl`
                        : isError
                            ? `${isDark ? 'bg-amber-950/30 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'} border rounded-2xl rounded-bl-none`
                            : `${isDark ? 'bg-slate-800/80 border border-slate-700 text-slate-200' : 'bg-white border border-gray-200 text-gray-800'} rounded-2xl rounded-bl-none`
                  }`}
                >
                  {msg.isToolOutput && (
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'} text-[10px] font-sans uppercase tracking-wider opacity-70`}>
                      <Terminal size={10} />
                      <span>EJECUTANDO COMANDO: {msg.toolName}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                </div>

                {/* Retry Button for Errors */}
                {isError && onRetry && (
                    <button 
                        onClick={onRetry}
                        className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-all ${
                            isDark 
                            ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50' 
                            : 'bg-white text-cyan-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <RotateCw size={12} />
                        <span>Reintentar Conexión</span>
                    </button>
                )}
              </div>
            </div>
          );
        })}
        
        {isProcessing && (
          <div className="flex gap-4">
             <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border ${isDark ? 'bg-slate-900 border-cyan-500/30 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-600'}`}>
                <Bot size={16} />
              </div>
              <div className={`rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-3 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex gap-1">
                  <span className="w-1 h-4 bg-cyan-500/50 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-6 bg-cyan-500 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
                  <span className="w-1 h-4 bg-cyan-500/50 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
                </div>
                <span className={`text-xs font-mono uppercase ${isDark ? 'text-cyan-500' : 'text-cyan-700'} animate-pulse`}>Procesando...</span>
              </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${borderMain} ${bgMain} relative z-30`}>
        <form onSubmit={handleSubmit} className="relative group flex gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center border relative ${
              isListening
                ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : isDark 
                    ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50' 
                    : 'bg-white text-gray-400 border-gray-200 hover:text-cyan-600 hover:border-cyan-300'
            }`}
            title="Activar voz"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            
            {/* Ripple Effect when listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-xl border border-red-500 animate-ping opacity-50"></span>
            )}
          </button>

          <div className="relative flex-1 group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-[2px]`}></div>
            <div className="relative flex items-center">
              <div className={`absolute left-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  <Terminal size={16} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Escuchando..." : "Ingrese comando de navegación..."}
                disabled={isProcessing}
                className={`w-full ${isDark ? 'bg-slate-900 text-slate-200 placeholder-slate-600' : 'bg-white text-gray-800 placeholder-gray-400'} rounded-xl py-4 pl-12 pr-14 border ${isDark ? 'border-slate-700' : 'border-gray-200'} focus:outline-none transition-all disabled:opacity-50 font-mono text-sm`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`absolute right-2 p-2 rounded-lg transition-all duration-300 ${
                  !input.trim() || isProcessing
                    ? 'bg-transparent text-slate-500'
                    : 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)] hover:bg-cyan-500'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
        <div className="flex justify-between items-center mt-3 px-1">
           <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-green-500' : 'bg-green-500'} shadow-[0_0_5px_#22c55e]`}></div>
             <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Sistema Nominal</span>
           </div>
           <span className={`text-[10px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>v2.7.1-fix</span>
        </div>
      </div>
    </div>
  );
};

const AlertIcon = ({ isError }: { isError: boolean }) => {
    if (isError) return <div className="text-xl font-bold">!</div>;
    return <Settings size={16} />;
}

export default ChatPanel;