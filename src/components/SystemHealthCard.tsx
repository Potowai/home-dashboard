import { Cpu, HardDrive, Zap, ChevronDown, Activity, Thermometer } from 'lucide-react';
import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWSChannel } from '../hooks/useWebSocket';

function getStatusColor(value: number, thresholds: [number, number] = [70, 90]): string {
  if (value >= thresholds[1]) return 'var(--status-red)';
  if (value >= thresholds[0]) return 'var(--status-amber)';
  return 'var(--status-green)';
}

interface MetricProps {
  label: string;
  value: string | number;
  percent?: number;
  icon: React.ComponentType<{ size?: number }>;
  thresholds?: [number, number];
  unit?: string;
}

function Metric({ label, value, percent, icon: Icon, thresholds, unit }: MetricProps) {
  const color = percent !== undefined && thresholds ? getStatusColor(percent, thresholds) : 'var(--status-green)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--surface-elevated)' }}>
        <span style={{ color }}><Icon size={18} /></span>
      </div>
      <div className="metric-value" style={{ color, display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        {value}
        {unit && <span style={{ fontSize: '14px', fontWeight: 500 }}>{unit}</span>}
      </div>
      <div className="metric-label">{label}</div>
      {percent !== undefined && (
        <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'var(--surface-elevated)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percent}%`, background: color, transition: 'width 0.5s ease, background 0.3s' }} />
        </div>
      )}
    </div>
  );
}

export function SystemHealthCard() {
  const stats = useWSChannel('stats');
  const history = useWSChannel<any[]>('statsHistory');
  const [expanded, setExpanded] = useState(false);

  if (!stats) return (
    <div className="panel-section" style={{ padding: '20px' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading system data...</div>
    </div>
  );

  const temp = stats.temp;

  return (
    <div className="panel-section h-full flex flex-col">
      {/* Header */}
      <div
        className="panel-header"
        onClick={() => setExpanded(!expanded)}
        title="Click to expand"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--accent)' }}><Activity size={16} /></span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>System</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {stats.cpu}% CPU · {stats.ram}% RAM{temp ? ` · ${temp}°C` : ''}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--text-secondary)',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* Compact 3-col Grid */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          <Metric
            label="CPU"
            value={`${stats.cpu}%`}
            percent={stats.cpu}
            icon={Cpu}
            thresholds={[70, 90]}
          />
          <Metric
            label="RAM"
            value={`${stats.ram}%`}
            percent={stats.ram}
            icon={Zap}
            thresholds={[70, 90]}
          />
          {temp !== null && temp !== undefined && (
            <Metric
              label="Temp"
              value={temp}
              unit="°C"
              percent={temp}
              icon={Thermometer}
              thresholds={[70, 85]}
            />
          )}
          <Metric
            label="Disk"
            value={`${stats.disk ?? stats.disks?.[0]?.used ?? 0}%`}
            percent={stats.disks?.[0]?.used}
            icon={HardDrive}
            thresholds={[70, 90]}
          />
        </div>
      </div>

      {/* Expanded: Charts */}
      {expanded && history && (
        <div className="fade-in" style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              CPU & RAM — last 50 samples
            </div>
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history || []}>
                  <defs>
                    <linearGradient id="colorCpuNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--graph-blue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--graph-blue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRamNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--graph-purple)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--graph-purple)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="cpu" stroke="var(--graph-blue)" strokeWidth={2} fill="url(#colorCpuNew)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="ram" stroke="var(--graph-purple)" strokeWidth={2} fill="url(#colorRamNew)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disk breakdown */}
          {stats.disks && stats.disks.filter((d: any) => d.size > 0).length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Storage
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.disks.filter((d: any) => d.size > 0).map((disk: any) => (
                  <div key={disk.mount}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{disk.mount}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{disk.used}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'var(--surface-elevated)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${disk.used}%`,
                        background: getStatusColor(disk.used),
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
