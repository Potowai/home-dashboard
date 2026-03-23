import { Box, ChevronDown, ChevronUp, RefreshCw, Play, Square, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { controlDockerContainer } from '../api/dashboard';
import { useWSChannel, useWSSend } from '../hooks/useWebSocket';

export function DockerPanel() {
  const wsContainers = useWSChannel<any[]>('docker');
  const send = useWSSend();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const containers = wsContainers || [];

  const handleRefresh = () => {
    setIsLoading(true);
    send({ type: 'refresh', channel: 'docker' });
    // Reset loading after a reasonable delay (WS response will update the data)
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleControl = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${id}-${action}`);
    await controlDockerContainer(id, action);
    // Server broadcasts updated docker data via WS after the action
    setActionLoading(null);
  };

  return (
    <div className={`panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.03] text-blue-color">
            <Box size={18} />
          </div>
          <span className="panel-title font-black uppercase tracking-tighter">Docker Containers</span>
        </div>
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <button 
              className={`p-1.5 rounded-lg hover:bg-white/[0.05] text-text-dim hover:text-accent-color transition-all ${isLoading ? 'spinning' : ''}`} 
              onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button className="collapse-btn text-text-dim hover:text-accent-color">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 space-y-3">
          {containers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-dim">
              <Box size={40} className="opacity-10 mb-4" />
              <span className="text-xs font-bold uppercase tracking-widest">No containers found</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {containers.map((container) => (
                <div key={container.id} className="group flex items-center justify-between p-4 bg-bg-primary rounded-2xl border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-text-primary tracking-tight group-hover:text-accent-color transition-colors">{container.name}</span>
                    <span className="text-[10px] text-text-dim font-mono tracking-tighter truncate max-w-[200px]" title={container.image}>{container.image}</span>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      {container.state === 'running' ? (
                        <button 
                          className="w-8 h-8 rounded-lg bg-red-dim text-red-color flex items-center justify-center hover:scale-110 active:scale-90 transition-all" 
                          onClick={() => handleControl(container.id, 'stop')}
                          disabled={actionLoading !== null}
                          title="Stop container"
                        >
                          {actionLoading === `${container.id}-stop` ? <Loader2 size={12} className="spinning" /> : <Square size={12} fill="currentColor" />}
                        </button>
                      ) : (
                        <button 
                          className="w-8 h-8 rounded-lg bg-accent-dim text-accent-color flex items-center justify-center hover:scale-110 active:scale-90 transition-all" 
                          onClick={() => handleControl(container.id, 'start')}
                          disabled={actionLoading !== null}
                          title="Start container"
                        >
                          {actionLoading === `${container.id}-start` ? <Loader2 size={12} className="spinning" /> : <Play size={12} fill="currentColor" />}
                        </button>
                      )}
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${container.state === 'running' ? 'bg-accent-dim text-accent-color shadow-[0_0_10px_var(--accent-glow)]' : 'bg-red-dim text-red-color'}`}>
                        {container.state}
                      </span>
                      <div className="text-[9px] font-bold text-text-dim tracking-tight">{container.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
