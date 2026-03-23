import { useState, useCallback } from 'react';
import { toggleServer, clearLogs } from '../api/dashboard';
import { useWSChannel } from './useWebSocket';
import type { LogEntry } from '../types';

export function useDashboard(_isStatusCollapsed: boolean = false, _isLogsCollapsed: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to WS channels instead of polling
  const statusData = useWSChannel<{ running: boolean }>('status');
  const logsData = useWSChannel<{ logs: LogEntry[] }>('logs');

  const isRunning = statusData?.running ?? false;
  const logs = logsData?.logs ?? [];

  const toggle = useCallback(async () => {
    setIsLoading(true);
    const result = await toggleServer();
    setIsLoading(false);
    // Server will broadcast 'status' and 'logs' updates via WS
    if (!result.success) {
      console.error('Toggle failed:', result.error);
    }
  }, []);

  const clear = useCallback(async () => {
    await clearLogs();
    // Server will broadcast empty logs via WS
  }, []);

  const addLocalLog = (_level: LogEntry['level'], _message: string) => {
    // Logs now come from the server's WS broadcast; local-only logs are not needed
  };

  return {
    isRunning,
    logs,
    isLoading,
    toggle,
    clear,
    addLocalLog,
  };
}
