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
  category: string;
  isPinned?: boolean;
  status?: 'online' | 'offline';
}

export type ServiceCategory = {
  name: string;
  services: Service[];
};

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  state: 'running' | 'paused' | 'exited' | 'created';
  status: string;
  project?: string;
}
