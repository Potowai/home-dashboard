import { Activity, Trash2 } from 'lucide-react';
import type { LogEntry } from '../types';

interface LogsPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function LogsPanel({ logs, onClear }: LogsPanelProps) {
  return (
    <div className="panel logs-panel">
      <div className="logs-header">
        <div className="logs-title">
          <Activity size={16} />
          <span>System Logs</span>
        </div>
        <div className="live-indicator">
          <span className="live-dot" />
          <span>Live</span>
        </div>
        <button className="clear-btn" onClick={onClear} aria-label="Clear logs">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="logs-body">
        {logs.length === 0 ? (
          <div className="empty-logs">
            <Activity size={48} />
            <span>Waiting for activity...</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-time">{log.time}</span>
              <span className={`log-level ${log.level}`}>{log.level}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
