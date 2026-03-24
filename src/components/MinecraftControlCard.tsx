import { Power, Loader2, Terminal } from 'lucide-react';

interface MinecraftControlCardProps {
  isRunning: boolean;
  isLoading: boolean;
  onToggle: () => void;
  lastLog?: string;
  onConsoleClick?: () => void;
}

export function MinecraftControlCard({
  isRunning,
  isLoading,
  onToggle,
  lastLog,
  onConsoleClick,
}: MinecraftControlCardProps) {
  return (
    <div className="panel-section h-full flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Minecraft</span>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '20px',
            background: isRunning ? 'rgba(126, 200, 160, 0.15)' : 'rgba(232, 138, 124, 0.15)',
            color: isRunning ? 'var(--status-green)' : 'var(--status-red)',
            transition: 'all 0.3s',
          }}
        >
          {isRunning ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Body */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
      }}>
        {/* Power Button */}
        <button
          onClick={onToggle}
          disabled={isLoading}
          className={`power-btn ${isRunning ? 'running' : ''}`}
          title={isRunning ? 'Stop server' : 'Start server'}
        >
          {isLoading ? (
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Power size={28} />
          )}
        </button>

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isRunning ? 'var(--status-green)' : 'var(--text-secondary)',
            transition: 'color 0.3s',
          }}>
            {isLoading ? 'Processing...' : isRunning ? 'Server running' : 'Server stopped'}
          </div>
          {lastLog && (
            <div
              className="mono"
              style={{
                fontSize: '10px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={lastLog}
            >
              {lastLog}
            </div>
          )}
        </div>

        {/* Console link */}
        <button
          onClick={onConsoleClick}
          className="btn-ghost"
          style={{ fontSize: '11px', marginTop: 'auto' }}
        >
          <Terminal size={12} />
          Console
        </button>
      </div>
    </div>
  );
}
