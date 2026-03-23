import { Cpu, Zap, Clock, ChevronDown, ChevronUp, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { useWSChannel } from '../hooks/useWebSocket';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function SystemStats() {
  const stats = useWSChannel('stats');
  const history = useWSChannel<any[]>('statsHistory');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!stats) return null;

  return (
    <div className={`panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="panel-title">System Metrics & Health</span>
        <button className="collapse-btn text-text-dim hover:text-accent-color transition-colors">
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>
      {!isCollapsed && (
        <div className="p-6 space-y-6">
          <div className="bg-bg-primary rounded-2xl border border-white/[0.05] p-5">
            <span className="block text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">CPU & RAM Usage (Last 50 Samples)</span>
            <div className="w-full h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history || []}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px', color: 'var(--text)' }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="ram" stroke="var(--blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'CPU Load', value: `${stats.cpu}%`, icon: Cpu, color: 'text-accent-color', val: stats.cpu },
              { label: 'RAM Usage', value: `${stats.ram}%`, icon: Zap, color: 'text-blue-color', val: stats.ram, sub: `of ${stats.totalMem}GB` },
              { label: 'System Uptime', value: `${stats.uptime}h`, icon: Clock, color: 'text-yellow-color' }
            ].map((item, i) => (
              <div key={i} className="bg-bg-primary p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.1] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-white/[0.03] ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-text-dim uppercase tracking-wider">{item.label}</span>
                </div>
                {item.val !== undefined && (
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-current transition-all duration-500" style={{ width: `${item.val}%`, color: `var(--${item.color.split('-')[1]})` }} />
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-text-primary tracking-tight">{item.value}</span>
                  {item.sub && <span className="text-[10px] text-text-dim font-medium">{item.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-bg-primary rounded-2xl border border-white/[0.05] p-5">
            <span className="block text-[11px] font-bold text-text-dim uppercase tracking-widest mb-4">Storage Devices</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.disks?.filter((d: any) => d.size > 0).slice(0, 3).map((disk: any) => (
                <div className="space-y-2" key={disk.mount}>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <HardDrive size={13} />
                      <span className="truncate max-w-[80px]">{disk.mount}</span>
                    </div>
                    <span className="text-text-primary">{disk.used}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${disk.used > 90 ? 'bg-red-color' : disk.used > 70 ? 'bg-yellow-color' : 'bg-accent-color'}`} 
                      style={{ width: `${disk.used}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
