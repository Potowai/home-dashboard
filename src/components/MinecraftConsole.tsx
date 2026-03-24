import { X } from 'lucide-react';
import type { LogEntry } from '../types';

interface MinecraftConsoleProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function MinecraftConsole({ logs, isOpen, onClose }: MinecraftConsoleProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '24px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '100%',
          height: '400px',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-elevated)',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Minecraft Console
          </span>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Log output */}
        <div
          className="custom-scrollbar mono"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'var(--bg)',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', marginTop: '32px' }}>
              Waiting for server output...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>[{log.time}]</span>{' '}
                <span style={{
                  color: log.level === 'ERROR' ? 'var(--status-red)' :
                         log.level === 'WARN' ? 'var(--status-amber)' :
                         'var(--text-primary)',
                }}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
