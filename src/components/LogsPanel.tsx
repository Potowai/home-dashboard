import { Activity, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { LogEntry } from '../types';

interface LogsPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function LogsPanel({ logs, onClear, isCollapsed, setIsCollapsed }: LogsPanelProps) {
  return (
    <div className={`panel flex flex-col ${isCollapsed ? 'h-[64px]' : 'h-[500px]'}`}>
      <div 
        className="panel-header flex-shrink-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-accent-color" />
          <span className="panel-title font-black uppercase tracking-tighter">System Kernel Logs</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-accent-dim/50 border border-accent-color/20">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-accent-color" />
            <span className="text-[9px] font-black uppercase tracking-widest text-accent-color">Streaming</span>
          </div>
          <button className="text-text-dim hover:text-accent-color transition-colors">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-shrink-0 p-3 px-6 border-b border-white/[0.06] bg-white/[0.02] flex justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-red-color transition-colors"
            >
              <Trash2 size={12} />
              Purge Buffer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[11px] custom-scrollbar bg-bg-primary/30">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                <Loader2 size={32} className="animate-spin" />
                <span className="uppercase tracking-[0.3em] font-black">Waiting for system noise...</span>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-4 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group">
                  <span className="text-text-dim whitespace-nowrap opacity-50 group-hover:opacity-100 transition-opacity">[{log.time}]</span>
                  <span className={`font-black uppercase tracking-widest px-1.5 rounded text-[9px] h-fit mt-0.5 ${
                    log.level === 'ERROR' ? 'text-red-color bg-red-dim border border-red-color/20' :
                    log.level === 'WARN' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' :
                    'text-accent-color bg-accent-dim border border-accent-color/20'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-text-secondary leading-relaxed break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
