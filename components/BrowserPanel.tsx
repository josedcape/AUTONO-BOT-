import React from 'react';
import { BrowserState, ActionLog, Theme } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Star, MoreVertical, Globe, Wifi, Activity, MousePointer2, PanelLeftOpen, Image as ImageIcon } from 'lucide-react';

interface BrowserPanelProps {
  state: BrowserState;
  logs: ActionLog[];
  theme: Theme;
  isChatVisible: boolean;
  onToggleChat: () => void;
  isAiProcessing: boolean; // Recibir estado de procesamiento
}

const BrowserPanel: React.FC<BrowserPanelProps> = ({ state, logs, theme, isChatVisible, onToggleChat, isAiProcessing }) => {
  const isDark = theme === 'dark';

  const bgChrome = isDark ? 'bg-slate-950' : 'bg-white';
  const borderChrome = isDark ? 'border-slate-800' : 'border-gray-200';
  const textChrome = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgInput = isDark ? 'bg-slate-900' : 'bg-gray-100';
  const textUrl = isDark ? 'text-cyan-400' : 'text-gray-800';
  const borderInput = isDark ? 'border-slate-800 focus-within:border-cyan-500/50' : 'border-gray-200 focus-within:border-cyan-500';
  const iconHover = isDark ? 'hover:bg-slate-800 hover:text-cyan-400' : 'hover:bg-gray-200 hover:text-cyan-600';

  // El contenido ahora es una IMAGEN (Screenshot del servidor)
  const screenshotUrl = state.htmlContent; // Reutilizamos este campo para guardar la URL base64 de la imagen

  return (
    <div className={`flex-1 flex flex-col h-full relative transition-colors duration-300 p-1`}>
      
      {/* --- EFECTO DE NIEBLA (GLOW) --- */}
      {/* Esta capa está DETRÁS del navegador y brilla cuando isAiProcessing es true */}
      <div 
        className={`absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 via-purple-600 to-blue-600 blur-xl opacity-0 transition-opacity duration-700 rounded-xl ${
            isAiProcessing ? 'opacity-70 animate-nebula' : ''
        }`}
      ></div>

      {/* Contenedor Principal del Navegador (Con Background sólido para tapar el centro del brillo) */}
      <div className={`flex-1 flex flex-col h-full rounded-lg overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-gray-50'} relative z-10`}>
        
        {/* Top Bar */}
        <div className={`${bgChrome} border-b ${borderChrome} p-3 flex items-center gap-3 shadow-md z-10 transition-colors duration-300`}>
            {!isChatVisible && (
                <button onClick={onToggleChat} className={`p-2 ${iconHover} rounded-lg border ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                <PanelLeftOpen size={16} />
                </button>
            )}
            <div className={`flex items-center gap-1 ${textChrome}`}>
            <button className={`p-2 ${iconHover} rounded-lg disabled:opacity-30`} disabled={!state.canGoBack}><ArrowLeft size={16} /></button>
            <button className={`p-2 ${iconHover} rounded-lg disabled:opacity-30`} disabled={!state.canGoForward}><ArrowRight size={16} /></button>
            <button className={`p-2 ${iconHover} rounded-lg`}><RotateCw size={16} className={state.isLoading ? 'animate-spin text-cyan-500' : ''} /></button>
            </div>
            <div className={`flex-1 ${bgInput} rounded-lg border ${borderInput} flex items-center px-3 py-2 text-sm group transition-all shadow-inner relative overflow-hidden`}>
            {state.isLoading && <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500 animate-[loading_2s_ease-in-out_infinite] w-full opacity-50"></div>}
            <div className={`mr-3 flex items-center justify-center w-5 h-5 rounded ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><Lock size={10} /></div>
            <div className="flex-1 font-mono text-xs truncate flex items-center">
                <span className="text-slate-500 select-none mr-0.5">REMOTE</span>
                <span className={`${textUrl} font-medium ml-2`}>{state.url || 'Esperando comando...'}</span>
            </div>
            <div className="flex items-center gap-2">
                {state.isLoading ? <span className="text-[10px] font-mono text-cyan-500 animate-pulse">CONECTANDO</span> : <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>}
            </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgInput} ${borderChrome} ${textChrome}`}>
                <span className="text-[10px] font-display font-bold uppercase hidden md:inline tracking-wider">LIVE VIEW</span>
            </div>
        </div>

        {/* Viewport - Muestra la captura de pantalla del servidor */}
        <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-black">
            
            {!screenshotUrl ? (
                <div className={`flex flex-col items-center justify-center h-full w-full ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                    <div className={`w-32 h-32 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-full flex items-center justify-center shadow-2xl mb-3`}>
                        <Globe size={48} className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'}`} />
                    </div>
                    <h1 className={`font-display font-bold text-3xl ${isDark ? 'text-white' : 'text-slate-800'}`}>AUTONO<span className="text-cyan-500">BOT</span></h1>
                    <p className="text-slate-500 text-sm mt-2 font-mono">MOTOR DE NAVEGACIÓN REMOTA: ESPERANDO</p>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                    {/* La imagen se ajusta para mostrar la vista completa del navegador remoto */}
                    <img 
                        src={screenshotUrl} 
                        alt="Remote Browser View" 
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                    
                    {state.isLoading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-30">
                            <div className={`px-8 py-4 rounded-xl border shadow-2xl ${isDark ? 'bg-slate-900/90 border-cyan-500 text-cyan-400' : 'bg-white/90 border-cyan-400 text-cyan-700'} flex flex-col items-center gap-2`}>
                            <Activity size={32} className="animate-bounce text-cyan-500"/>
                            <span className="font-mono text-sm font-bold tracking-widest">PROCESANDO EN SERVIDOR...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Logs */}
        <div className={`absolute bottom-6 right-6 w-96 ${isDark ? 'bg-slate-950/95 border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-gray-200 shadow-2xl'} backdrop-blur border rounded-md overflow-hidden flex flex-col max-h-72 transition-all z-40`}>
            <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'} px-4 py-2 flex justify-between items-center border-b`}>
                <div className={`flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-slate-600'}`}>
                    <Activity size={12} /><span>Registro de Navegación Real</span>
                </div>
            </div>
            <div className="overflow-y-auto p-3 space-y-1.5 scrollbar-thin font-mono text-[11px]">
                {logs.map((log) => (
                    <div key={log.id} className={`flex gap-3 border-l-2 pl-2 ${log.status === 'success' ? 'border-emerald-500/50' : log.status === 'error' ? 'border-red-500/50' : 'border-amber-500/50'} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span className="font-bold text-cyan-500">{log.action.toUpperCase()}</span>
                        <span className="truncate">{log.details}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserPanel;