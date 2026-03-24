import { useState } from 'react';
import { Activity, Trash2, ChevronDown } from 'lucide-react';
import type { LogEntry } from '../types';

interface LogsPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

function LogEntryRow({ log }: { log: LogEntry }) {
  return (
    <div className="log-entry">
      <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '11px', flexShrink: 0 }}>
        {log.time}
      </span>
      <span className={`log-level ${log.level}`}>{log.level}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {log.message}
      </span>
    </div>
  );
}

export function LogsPanel({ logs, onClear }: LogsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="panel-section">
      {/* Header */}
      <div className="panel-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Logs</span>
          {!isOpen && logs.length > 0 && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '20px',
                background: 'rgba(126, 200, 160, 0.15)',
                color: 'var(--status-green)',
              }}
            >
              {logs.length} entries
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      </div>

      {/* Ticker (collapsed) */}
      {!isOpen && logs.length > 0 && (
        <div style={{
          padding: '10px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {logs.slice(0, 3).map((log, i) => (
            <div
              key={i}
              className="mono fade-in"
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{log.time}</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '3px',
                  background: log.level === 'WARN' ? 'rgba(232, 200, 124, 0.1)' :
                             log.level === 'ERROR' ? 'rgba(232, 138, 124, 0.1)' :
                             log.level === 'DEBUG' ? 'rgba(168, 124, 168, 0.1)' :
                             'var(--surface-elevated)',
                  color: log.level === 'WARN' ? 'var(--status-amber)' :
                         log.level === 'ERROR' ? 'var(--status-red)' :
                         log.level === 'DEBUG' ? 'var(--graph-purple)' :
                         'var(--text-secondary)',
                  flexShrink: 0,
                }}
              >
                {log.level}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expanded view */}
      {isOpen && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={onClear}
              className="btn-ghost"
              style={{ fontSize: '11px' }}
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>

          {/* Log list */}
          <div
            className="custom-scrollbar"
            style={{
              maxHeight: '320px',
              overflowY: 'auto',
              padding: '12px 20px',
            }}
          >
            {logs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}>
                No log entries yet
              </div>
            ) : (
              [...logs].reverse().map((log, i) => (
                <LogEntryRow key={i} log={log} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
