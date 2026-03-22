import type { StatusResponse, ToggleResponse, LogsResponse } from '../types';

const API_BASE = '';

export async function getStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    const data: StatusResponse = await res.json();
    return data.running;
  } catch {
    return false;
  }
}

export async function toggleServer(): Promise<ToggleResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/toggle`, { method: 'POST' });
    return await res.json();
  } catch (error) {
    return { success: false, running: false, error: 'Connection failed' };
  }
}

export async function getLogs(): Promise<LogsResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/logs`);
    return await res.json();
  } catch {
    return { logs: [] };
  }
}

export async function clearLogs(): Promise<void> {
  await fetch(`${API_BASE}/api/logs/clear`, { method: 'POST' });
}
