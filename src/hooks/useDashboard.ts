import { useState, useEffect, useCallback } from 'react';
import { getStatus, toggleServer, getLogs, clearLogs } from '../api/dashboard';
import type { LogEntry } from '../types';

export function useDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    const status = await getStatus();
    setIsRunning(status);
  }, []);

  const fetchLogs = useCallback(async () => {
    const data = await getLogs();
    setLogs(data.logs);
  }, []);

  const toggle = useCallback(async () => {
    setIsLoading(true);
    const result = await toggleServer();
    setIsRunning(result.running);
    setIsLoading(false);
    if (result.success) {
      addLocalLog('INFO', `Server ${result.running ? 'started' : 'stopped'} successfully`);
    } else {
      addLocalLog('ERROR', result.error || 'Operation failed');
    }
  }, []);

  const addLocalLog = (level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time, level, message }]);
  };

  const clear = useCallback(async () => {
    await clearLogs();
    setLogs([]);
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, [fetchStatus, fetchLogs]);

  useEffect(() => {
    const statusInterval = setInterval(fetchStatus, 3000);
    const logsInterval = setInterval(fetchLogs, 1000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, [fetchStatus, fetchLogs]);

  return {
    isRunning,
    logs,
    isLoading,
    toggle,
    clear,
    addLocalLog,
  };
}
