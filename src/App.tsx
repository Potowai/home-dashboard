import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { ServiceLaunchpad } from './components/ServiceLaunchpad';
import { SystemHealthCard } from './components/SystemHealthCard';
import { MinecraftControlCard } from './components/MinecraftControlCard';
import { MinecraftConsole } from './components/MinecraftConsole';
import { DockerPanel } from './components/DockerPanel';
import { LogsPanel } from './components/LogsPanel';
import { SettingsModal } from './components/SettingsModal';
import { useDashboard } from './hooks/useDashboard';
import { useWSChannel } from './hooks/useWebSocket';
import { getSettings } from './api/dashboard';
import type { Service } from './types';

function App() {
  const [settings, setSettings] = useState<any>(null);
  const [localServices, setLocalServices] = useState<Service[] | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const wsServices = useWSChannel<Service[]>('services');

  // MC server hooks
  const { isRunning, logs, isLoading, toggle, clear } = useDashboard();

  // Services: prefer local, fall back to WS
  const services = localServices ?? wsServices ?? [];

  // Sync WS data into local state
  useEffect(() => {
    if (wsServices) setLocalServices(wsServices);
  }, [wsServices]);

  // Load settings
  useEffect(() => {
    getSettings().then((data) => {
      if (data) setSettings(data);
    });
  }, []);

  // Apply theme
  useEffect(() => {
    const theme = settings?.theme ?? 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings?.theme]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Escape key exits edit mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditMode(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadData = useCallback(async () => {
    const data = await getSettings();
    if (data) setSettings(data);
  }, []);

  const lastLog = logs.length > 0 ? logs[logs.length - 1].message : undefined;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <TopBar
        greetingName={settings?.name || settings?.dashboard_title || 'there'}
        onSettingsClick={() => setIsSettingsOpen(true)}
        currentTime={currentTime}
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '24px',
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Hero Zone: Services + Quick Stack */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Service Launchpad */}
          <ServiceLaunchpad
            services={services}
            isEditMode={isEditMode}
            onToggleEdit={() => setIsEditMode(v => !v)}
          />

          {/* Quick Status Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SystemHealthCard />
            <MinecraftControlCard
              isRunning={isRunning}
              isLoading={isLoading}
              onToggle={toggle}
              lastLog={lastLog}
              onConsoleClick={() => setConsoleOpen(true)}
            />
          </div>
        </section>

        {/* Fluid Zone: Docker + Logs */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DockerPanel />
          <LogsPanel logs={logs} onClear={clear} />
        </section>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={loadData}
      />

      <MinecraftConsole
        logs={logs}
        isOpen={consoleOpen}
        onClose={() => setConsoleOpen(false)}
      />
    </div>
  );
}

export default App;
