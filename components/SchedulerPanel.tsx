
import React, { useState } from 'react';
import { ScheduledTask, Theme } from '../types';
import { Clock, Plus, Trash2, Play, Pause, X, Check } from 'lucide-react';

interface SchedulerPanelProps {
  tasks: ScheduledTask[];
  onAddTask: (task: ScheduledTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onClose: () => void;
  theme: Theme;
}

const SchedulerPanel: React.FC<SchedulerPanelProps> = ({ 
  tasks, 
  onAddTask, 
  onDeleteTask, 
  onToggleTask,
  onClose,
  theme 
}) => {
  const [newTime, setNewTime] = useState('');
  const [newCommand, setNewCommand] = useState('');

  const isDark = theme === 'dark';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTime && newCommand) {
        const newTask: ScheduledTask = {
            id: Date.now().toString(),
            time: newTime,
            command: newCommand,
            active: true
        };
        onAddTask(newTask);
        setNewCommand('');
        setNewTime('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-xl rounded-2xl border flex flex-col max-h-[90vh] shadow-2xl ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'} flex justify-between items-center shrink-0`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                    <Clock size={24} />
                </div>
                <div>
                    <h2 className="font-display font-bold text-lg md:text-xl leading-tight">PROGRAMADOR</h2>
                    <p className="text-[10px] md:text-xs opacity-60 font-mono">AUTOMATIZACIÓN DE COMANDOS</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin">
            {/* Add New Task Form */}
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-end ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col gap-1 w-full md:w-32">
                    <label className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Hora (24h)</label>
                    <input 
                        type="time" 
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 focus:border-cyan-500' : 'bg-white border-gray-300'} outline-none font-mono text-center`}
                        required
                    />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Comando</label>
                    <input 
                        type="text" 
                        value={newCommand}
                        onChange={(e) => setNewCommand(e.target.value)}
                        placeholder="Ej: Buscar noticias..."
                        className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 focus:border-cyan-500' : 'bg-white border-gray-300'} outline-none`}
                        required
                    />
                </div>
                <button type="submit" className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 md:w-auto">
                    <Plus size={20} />
                    <span className="md:hidden font-bold text-sm uppercase">Agregar Tarea</span>
                </button>
            </form>

            {/* Task List */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Lista de Tareas</h3>
                
                {tasks.length === 0 && (
                    <div className="text-center py-12 opacity-50 border-2 border-dashed rounded-xl border-slate-700 flex flex-col items-center justify-center gap-2">
                        <Clock size={32} className="opacity-50"/>
                        <p>No hay tareas programadas.</p>
                    </div>
                )}
                
                {tasks.map(task => (
                    <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                        task.active 
                            ? (isDark ? 'bg-slate-800/50 border-cyan-900/50' : 'bg-white border-cyan-100') 
                            : (isDark ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-gray-100 border-gray-200 opacity-60')
                    }`}>
                        <div className="flex items-start gap-4">
                            <div className={`font-mono text-xl font-bold pt-1 ${task.active ? 'text-cyan-500' : 'text-slate-500'}`}>
                                {task.time}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm break-words leading-snug">{task.command}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${task.active ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                    <span className="text-[10px] uppercase tracking-wider opacity-60">{task.active ? 'ACTIVA' : 'PAUSADA'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50 sm:border-none">
                            <button 
                                onClick={() => onToggleTask(task.id)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs font-bold uppercase ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-100'}`}
                            >
                                {task.active ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Activar</>}
                            </button>
                            <button 
                                onClick={() => onDeleteTask(task.id)}
                                className={`p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors`}
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPanel;
