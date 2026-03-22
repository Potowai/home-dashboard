export interface LogEntry {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface StatusResponse {
  running: boolean;
}

export interface ToggleResponse {
  success: boolean;
  running: boolean;
  error?: string;
}

export interface LogsResponse {
  logs: LogEntry[];
}

export interface Service {
  id?: number;
  name: string;
  url: string;
  description: string;
  icon: string;
  iconUrl?: string;
  color: string;
}
