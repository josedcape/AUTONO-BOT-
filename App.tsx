
import React, { useState, useCallback, useEffect } from 'react';
import ChatPanel from './components/ChatPanel';
import BrowserPanel from './components/BrowserPanel';
import SchedulerPanel from './components/SchedulerPanel';
import { Message, Sender, BrowserState, ActionLog, UserProfile, Theme, ScheduledTask } from './types';
import { generateResponse } from './services/geminiService';
import { X, Plus, Trash2, Clock, Download } from './components/Icons';

const INITIAL_BROWSER_STATE: BrowserState = {
  url: '',
  title: 'Listo',
  isLoading: false,
  canGoBack: false,
  canGoForward: false,
  contentPreview: '',
  htmlContent: '' 
};

const DEFAULT_PROFILE_ID = 'default-profile';

const DEFAULT_PROFILE: UserProfile = {
  id: DEFAULT_PROFILE_ID,
  name: 'Alpha User',
  theme: 'dark',
  data: {
    messages: [],
    browserState: INITIAL_BROWSER_STATE,
    logs: [],
    tasks: [] // Tareas programadas del perfil
  },
  created: Date.now()
};

const BACKEND_API = 'http://localhost:3001';

function App() {
  // Global State
  const [profiles, setProfiles] = useState<UserProfile[]>([DEFAULT_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILE_ID);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false); // Panel de Tareas

  // Active Profile State
  const [messages, setMessages] = useState<Message[]>([]);
  const [browserState, setBrowserState] = useState<BrowserState>(INITIAL_BROWSER_STATE);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  
  // UI State
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [lastInput, setLastInput] = useState<string>(''); 
  const [pageContent, setPageContent] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // --- State Synchronization Logic ---
  useEffect(() => {
    const profile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    setMessages(profile.data.messages);
    setBrowserState(profile.data.browserState);
    setLogs(profile.data.logs);
    setTasks(profile.data.tasks || []);
    setTheme(profile.theme);
  }, [activeProfileId]);

  useEffect(() => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          theme: theme,
          data: { messages, browserState, logs, tasks }
        };
      }
      return p;
    }));
  }, [messages, browserState, logs, theme, activeProfileId, tasks]);

  // --- SCHEDULER ENGINE (Check every minute) ---
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        tasks.forEach(task => {
            // Si la hora coincide, está activa y no se ejecutó en el último minuto
            if (task.active && task.time === currentTime) {
                 const lastRun = task.lastRun || 0;
                 if (Date.now() - lastRun > 60000) { // Evitar doble ejecución en el mismo minuto
                     console.log(`Ejecutando tarea programada: ${task.command}`);
                     handleSendMessage(`[TAREA AUTOMÁTICA ${currentTime}] ${task.command}`);
                     
                     // Actualizar lastRun
                     setTasks(prev => prev.map(t => t.id === task.id ? { ...t, lastRun: Date.now() } : t));
                 }
            }
        });
    }, 10000); // Chequear cada 10s

    return () => clearInterval(interval);
  }, [tasks]);


  // --- Profile Management Helpers ---
  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const newProfile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProfileName.trim(),
      theme: 'dark',
      data: { messages: [], browserState: INITIAL_BROWSER_STATE, logs: [], tasks: [] },
      created: Date.now()
    };
    setProfiles(prev => [...prev, newProfile]);
    setNewProfileName('');
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) setActiveProfileId(newProfiles[0].id);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addLog = (action: string, details: string, status: 'pending' | 'success' | 'error' = 'success') => {
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      action,
      details,
      status
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- SCHEDULER UI HELPERS ---
  const handleAddTask = (task: ScheduledTask) => setTasks(prev => [...prev, task]);
  const handleDeleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleToggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));


  // --- REAL BACKEND TOOLS (Updated with ProfileId) ---

  const handleNavigate = async (url: string) => {
    addLog('navigate', url, 'pending');
    setBrowserState(prev => ({ ...prev, isLoading: true })); 
    
    try {
        const response = await fetch(`${BACKEND_API}/navigate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, profileId: activeProfileId }) // Send Profile ID
        });

        if (!response.ok) throw new Error('Error conectando al servidor backend');
        
        const data = await response.json();
        
        setPageContent(data.content || "");
        setBrowserState(prev => ({
            ...prev,
            url: data.url,
            title: data.title,
            htmlContent: data.screenshot, 
            isLoading: false,
            canGoBack: true
        }));
        
        addLog('navigate', `Navegado a: ${data.title}`, 'success');
        return `Éxito. Estás en "${data.title}".`;

    } catch (e) {
        addLog('navigate', `Fallo: ${url}`, 'error');
        setBrowserState(prev => ({ ...prev, isLoading: false }));
        return "Error: No se pudo conectar al servidor.";
    }
  };

  const handleAction = async (type: 'click' | 'type' | 'select' | 'wait', selector: string, value?: string) => {
    addLog(type, selector || value || '', 'pending');
    setBrowserState(prev => ({ ...prev, isLoading: true }));

    try {
        const response = await fetch(`${BACKEND_API}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, selector, value, profileId: activeProfileId })
        });
        
        const data = await response.json();
        
        setBrowserState(prev => ({
            ...prev,
            htmlContent: data.screenshot,
            isLoading: false
        }));
        
        addLog(type, 'Acción completada', 'success');
        return `Acción ${type} ejecutada.`;

    } catch (e) {
        addLog(type, 'Error', 'error');
        setBrowserState(prev => ({ ...prev, isLoading: false }));
        return "Error ejecutando acción.";
    }
  };

  const handleCheckDownloads = async () => {
      try {
          const response = await fetch(`${BACKEND_API}/downloads`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileId: activeProfileId })
          });
          const data = await response.json();
          const files = data.files.join(', ');
          return files ? `Archivos descargados encontrados: ${files}` : "La carpeta de descargas está vacía.";
      } catch (e) {
          return "Error verificando descargas.";
      }
  };

  const onToolCall = async (name: string, args: any) => {
    const toolMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.SYSTEM,
      text: `Ejecutando: ${name} ${args.url || args.selector || ''}`,
      timestamp: Date.now(),
      isToolOutput: true,
      toolName: name
    };
    setMessages(prev => [...prev, toolMsg]);

    switch (name) {
      case 'navigate': return handleNavigate(args.url);
      case 'click': return handleAction('click', args.selector);
      case 'type': return handleAction('type', args.selector, args.text);
      case 'select': return handleAction('select', args.selector, args.value);
      case 'wait': return handleAction('wait', '', args.duration);
      case 'check_downloads': return handleCheckDownloads();
      case 'extract': return `Contenido de texto actual (memoria): ${pageContent.substring(0, 500)}...`;
      default: return "Herramienta no encontrada";
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    setLastInput(text);
    const userMsg: Message = { id: Date.now().toString(), sender: Sender.USER, text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsAiProcessing(true);

    try {
      const historyForModel = messages
        .filter(m => m.text && m.text.trim().length > 0)
        .filter(m => m.sender === Sender.USER || m.sender === Sender.AI)
        .map(m => ({ role: m.sender === Sender.USER ? 'user' : 'model', parts: [{ text: m.text }] }));

      const responseText = await generateResponse(historyForModel, text, onToolCall);

      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: Sender.AI, text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error(error);
      let userFriendlyError = "Error desconocido.";
      if (String(error).includes("Protocolo")) userFriendlyError = "Error de Protocolo. Reintentando...";
      else if (String(error).includes("fetch")) userFriendlyError = "Error de Red: Verifique el servidor backend.";
      else if (String(error).includes("API Key")) userFriendlyError = "Falta API Key.";

      const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: Sender.SYSTEM, text: `⚠️ ${userFriendlyError}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiProcessing(false);
    }
  }, [messages]);

  const handleRetry = () => {
    if (lastInput) {
        setMessages(prev => prev.filter(m => m.sender !== Sender.SYSTEM));
        handleSendMessage(lastInput);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-100 text-gray-800'}`}>
      {isChatVisible && (
        <ChatPanel 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isProcessing={isAiProcessing} 
          theme={theme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          profileName={activeProfile?.name || 'Desconocido'}
          onToggleChat={() => setIsChatVisible(false)}
          onRetry={handleRetry}
        />
      )}
      
      <div className="flex-1 flex flex-col relative">
        {/* Scheduler Toggle Overlay Button */}
        <button 
            onClick={() => setIsSchedulerOpen(true)}
            className={`absolute top-3 right-20 z-50 p-2 rounded-lg border shadow-lg backdrop-blur-md transition-all ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500 text-cyan-400' : 'bg-white/80 border-gray-200 text-cyan-600'}`}
            title="Programar Tareas"
        >
            <Clock size={18} />
        </button>

        <BrowserPanel 
            state={browserState} 
            logs={logs} 
            theme={theme}
            isChatVisible={isChatVisible}
            onToggleChat={() => setIsChatVisible(true)}
            isAiProcessing={isAiProcessing} // PASAMOS EL ESTADO DE PROCESAMIENTO PARA EL EFECTO DE NIEBLA
        />
      </div>

      {/* SCHEDULER MODAL */}
      {isSchedulerOpen && (
          <SchedulerPanel 
            tasks={tasks}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onClose={() => setIsSchedulerOpen(false)}
            theme={theme}
          />
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-[600px] rounded-2xl border p-8 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between mb-6">
                <h2 className="font-display font-bold text-xl">CONFIGURACIÓN</h2>
                <button onClick={() => setIsSettingsOpen(false)}><X /></button>
            </div>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span>Tema Oscuro</span>
                    <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative ${theme === 'dark' ? 'bg-cyan-600' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'translate-x-6' : ''}`}></span>
                    </button>
                </div>
                <div>
                    <h3 className="text-sm font-bold mb-3">PERFILES (Datos Persistentes)</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {profiles.map(p => (
                            <div key={p.id} onClick={() => setActiveProfileId(p.id)} className={`p-3 rounded border cursor-pointer flex justify-between ${activeProfileId === p.id ? 'border-cyan-500 bg-cyan-500/10' : ''}`}>
                                <span>{p.name}</span>
                                {profiles.length > 1 && <button onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}><Trash2 size={16}/></button>}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                        <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} placeholder="Nuevo perfil..." className="flex-1 p-2 rounded border bg-transparent" />
                        <button onClick={handleCreateProfile} disabled={!newProfileName} className="p-2 bg-cyan-600 text-white rounded"><Plus /></button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
