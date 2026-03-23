import { useState, useEffect, useCallback } from 'react';

export interface WSChannelData {
  stats: any | null;
  statsHistory: any[] | null;
  docker: any[] | null;
  services: any[] | null;
  weather: any | null;
  status: { running: boolean } | null;
  logs: { logs: any[] } | null;
}

type ChannelListener = (data: any) => void;

interface WebSocketStore {
  data: WSChannelData;
  listeners: Map<string, Set<ChannelListener>>;
  ws: WebSocket | null;
  connected: boolean;
}

// ─── Singleton store shared across all hook instances ─────────────────────────
const store: WebSocketStore = {
  data: {
    stats: null,
    statsHistory: null,
    docker: null,
    services: null,
    weather: null,
    status: null,
    logs: null,
  },
  listeners: new Map(),
  ws: null,
  connected: false,
};

let refCount = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

function getWSUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // In dev mode, Vite proxies /api but not WS — connect directly to server port
  const isDev = import.meta.env.DEV;
  if (isDev) {
    return `${protocol}//${window.location.hostname}:3001`;
  }
  return `${protocol}//${window.location.host}`;
}

function notifyListeners(channel: string, data: any) {
  const channelListeners = store.listeners.get(channel);
  if (channelListeners) {
    for (const fn of channelListeners) {
      fn(data);
    }
  }
}

function connect() {
  if (store.ws && (store.ws.readyState === WebSocket.OPEN || store.ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const url = getWSUrl();
  console.log('[WS] Connecting to', url);
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('[WS] Connected');
    store.connected = true;
    notifyListeners('_connection', true);
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const { channel, data } = msg;

      if (channel === 'snapshot') {
        // Full state snapshot on connect
        for (const [key, value] of Object.entries(data as Record<string, any>)) {
          if (value != null) {
            (store.data as any)[key] = value;
            notifyListeners(key, value);
          }
        }
        notifyListeners('_snapshot', store.data);
      } else {
        // Individual channel update
        (store.data as any)[channel] = data;
        notifyListeners(channel, data);
      }
    } catch {
      // Ignore malformed messages
    }
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected, reconnecting in 2s...');
    store.connected = false;
    store.ws = null;
    notifyListeners('_connection', false);
    // Auto-reconnect
    if (refCount > 0) {
      reconnectTimeout = setTimeout(connect, 2000);
    }
  };

  ws.onerror = () => {
    ws.close();
  };

  store.ws = ws;
}

function disconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (store.ws) {
    store.ws.close();
    store.ws = null;
  }
  store.connected = false;
}

// ─── Public hook: subscribe to a specific channel ────────────────────────────

export function useWSChannel<T = any>(channel: keyof WSChannelData): T | null {
  const [data, setData] = useState<T | null>(() => (store.data as any)[channel] ?? null);

  useEffect(() => {
    // Mount: increment ref count, connect if first subscriber
    refCount++;
    if (refCount === 1) connect();

    const listener: ChannelListener = (newData) => {
      setData(newData);
    };

    // Subscribe
    if (!store.listeners.has(channel)) {
      store.listeners.set(channel, new Set());
    }
    store.listeners.get(channel)!.add(listener);

    // Also listen for snapshots to pick up the initial value
    const snapshotListener: ChannelListener = (snapshot) => {
      if (snapshot[channel] != null) {
        setData(snapshot[channel]);
      }
    };
    if (!store.listeners.has('_snapshot')) {
      store.listeners.set('_snapshot', new Set());
    }
    store.listeners.get('_snapshot')!.add(snapshotListener);

    return () => {
      // Unsubscribe
      store.listeners.get(channel)?.delete(listener);
      store.listeners.get('_snapshot')?.delete(snapshotListener);

      refCount--;
      if (refCount === 0) disconnect();
    };
  }, [channel]);

  return data;
}

// ─── Hook to send messages to server (e.g. refresh requests) ──────────────────

export function useWSSend() {
  return useCallback((message: Record<string, any>) => {
    if (store.ws && store.ws.readyState === WebSocket.OPEN) {
      store.ws.send(JSON.stringify(message));
    }
  }, []);
}

// ─── Connection status hook ──────────────────────────────────────────────────

export function useWSConnected(): boolean {
  const [connected, setConnected] = useState(store.connected);

  useEffect(() => {
    const listener: ChannelListener = (status) => setConnected(status);
    if (!store.listeners.has('_connection')) {
      store.listeners.set('_connection', new Set());
    }
    store.listeners.get('_connection')!.add(listener);

    return () => {
      store.listeners.get('_connection')?.delete(listener);
    };
  }, []);

  return connected;
}
