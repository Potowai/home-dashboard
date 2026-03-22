import type { StatusResponse, ToggleResponse, LogsResponse, Service } from '../types';

const API_BASE = '';

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_BASE}/api/services`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function addService(service: Omit<Service, 'id'>): Promise<Service | null> {
  try {
    const res = await fetch(`${API_BASE}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteService(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getStats(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getWeather(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/weather`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateSettings(settings: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch {
    return false;
  }
}

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
