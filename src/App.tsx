import { Plus, Settings, ChevronUp, Terminal, GripHorizontal, Edit3, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Responsive as ResponsiveGridLayout, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayoutWithWidth = WidthProvider(ResponsiveGridLayout);

const defaultLayouts = {
  lg: [
    { i: 'system_stats', x: 0, y: 0, w: 7, h: 5, minW: 5, minH: 4 },
    { i: 'mc_core', x: 0, y: 5, w: 7, h: 2, minW: 4, minH: 2 },
    { i: 'docker', x: 7, y: 0, w: 5, h: 4, minW: 4, minH: 3 },
    { i: 'logs', x: 7, y: 4, w: 5, h: 3, minW: 4, minH: 3 }
  ],
  md: [
    { i: 'system_stats', x: 0, y: 0, w: 12, h: 5 },
    { i: 'docker', x: 0, y: 5, w: 12, h: 4 },
    { i: 'mc_core', x: 0, y: 9, w: 12, h: 2 },
    { i: 'logs', x: 0, y: 11, w: 12, h: 4 }
  ]
};
import { PowerButton, StatusDisplay, ServiceCard, WeatherWidget, SettingsModal } from './components';
import { SystemStats } from './components/SystemStats';
import { LogsPanel } from './components/LogsPanel';
import { DockerPanel } from './components/DockerPanel';
import { useDashboard } from './hooks/useDashboard';
import { useWSChannel } from './hooks/useWebSocket';
import { addService, deleteService, getSettings } from './api/dashboard';
import type { Service } from './types';

function App() {
  const wsServices = useWSChannel<Service[]>('services');
  const [localServices, setLocalServices] = useState<Service[] | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Use WS data, but allow local overrides from mutations
  const services = localServices ?? wsServices ?? [];
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  const [isAddServiceCollapsed, setIsAddServiceCollapsed] = useState(true);
  const [isLogsCollapsed, setIsLogsCollapsed] = useState(false);
  const { isRunning, logs, isLoading, toggle, clear } = useDashboard(false, isLogsCollapsed);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [isEditMode, setIsEditMode] = useState(false);

  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem('dashboardLayouts');
    return saved ? JSON.parse(saved) : defaultLayouts;
  });

  const onLayoutChange = (_layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
  };

  const loadData = async () => {
    const settingsData = await getSettings();
    setSettings(settingsData);
    setLocalServices(null); // Reset local override, let WS take over
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync local services when WS pushes new data
  useEffect(() => {
    if (wsServices) setLocalServices(null);
  }, [wsServices]);

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings?.theme]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    await addService({
      name,
      url,
      description: 'Custom Service',
      icon: 'generic',
      iconUrl: iconUrl || undefined,
      color: 'generic'
    });
    setName('');
    setUrl('');
    setIconUrl('');
    setIsAddServiceCollapsed(true);
    // Server broadcasts updated services via WS
  };

  const handleDeleteService = async (id: number) => {
    const success = await deleteService(id);
    if (success) {
      // Optimistic update, then WS will push the full list
      setLocalServices(services.filter(s => s.id !== id));
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <>
      <div className="noise-overlay" />
      <div className="grid-bg" />

      <main className="min-h-screen p-6 md:p-12 max-w-[1920px] mx-auto relative z-10 font-sans text-text-primary flex flex-col gap-12">
        {/* Minimalist Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 animate-stagger" style={{ animationDelay: '0.1s' }}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-accent-color block mb-3">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tighter text-text-primary">
              Good {getGreeting()}!
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <WeatherWidget />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.08] hover:border-white/10 transition-all group/settings shadow-md"
              title="Settings"
            >
              <Settings className="text-text-dim group-hover/settings:text-accent-color transition-colors group-hover/settings:rotate-180 duration-700" size={24} />
            </button>
          </div>
        </header>

        {/* Applications Nexus - Colorful Pills styling */}
        <section className="animate-stagger flex-1 mb-12" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-dim whitespace-nowrap">Applications</h2>
              <div className="h-[1px] w-48 max-w-full bg-gradient-to-r from-border-bright to-transparent opacity-50" />
            </div>

            <button
              onClick={() => setIsAddServiceCollapsed(!isAddServiceCollapsed)}
              className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${!isAddServiceCollapsed ? 'bg-accent-color text-bg-deep border-accent-color shadow-accent' : 'bg-transparent text-text-dim border-white/10 hover:border-accent-color/50 hover:text-accent-color'}`}
            >
              {isAddServiceCollapsed ? <Plus size={14} /> : <ChevronUp size={14} />}
              {isAddServiceCollapsed ? 'Add Service' : 'Close'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id || service.name}
                service={service}
                onDelete={handleDeleteService}
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                className="animate-stagger"
              />
            ))}
          </div>

          {!isAddServiceCollapsed && (
            <div className="mt-8 panel bg-white/[0.02] border border-accent-color/20 p-8 max-w-2xl animate-stagger" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-display font-black uppercase tracking-tight text-xl mb-6 flex items-center gap-3">
                <Plus className="text-accent-color" /> Inject New Node
              </h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-text-dim px-1">Identity Name</label>
                  <input
                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-accent-color focus:ring-1 focus:ring-accent-color outline-none transition-all placeholder:text-text-dim/30"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Pi-Hole"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-text-dim px-1">Service URL</label>
                  <input
                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-accent-color focus:ring-1 focus:ring-accent-color outline-none transition-all placeholder:text-text-dim/30"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://192.168.1.100"
                    type="url"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-accent-color text-bg-deep px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-premium hover:shadow-accent">
                    Deploy
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* High-Tech Monitor Board & Logs */}
        <section className="animate-stagger" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-dim whitespace-nowrap">Monitor Board</h2>
            <div className="h-[1px] w-full bg-gradient-to-r from-border-bright to-transparent opacity-50" />
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${isEditMode
                ? 'bg-accent-color text-bg-primary'
                : 'bg-white/5 text-text-dim hover:bg-white/10 hover:text-white'
                }`}
            >
              {isEditMode ? <Check size={12} /> : <Edit3 size={12} />}
              {isEditMode ? 'Done' : 'Edit'}
            </button>
            {isEditMode && (
              <span className="text-[9px] uppercase tracking-widest text-text-dim/50 italic flex items-center gap-1 hidden md:flex">
                <GripHorizontal size={10} /> Drag & Resize Open
              </span>
            )}
          </div>

          <ResponsiveGridLayoutWithWidth
            className={`layout w-full -mx-4 ${isEditMode ? 'ring-1 ring-accent-color/20 rounded-2xl bg-black/10' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={70}
            onLayoutChange={onLayoutChange}
            draggableHandle=".drag-handle"
            isDraggable={isEditMode}
            isResizable={isEditMode}
            margin={[24, 24]}
          >
            <div key="system_stats" className="relative group/widget">
              <div className={`drag-handle absolute top-4 right-4 z-50 cursor-move transition-opacity p-2 bg-black/40 rounded-lg text-text-dim hover:text-white backdrop-blur ${isEditMode ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <GripHorizontal size={16} />
              </div>
              <SystemStats />
            </div>

            <div key="mc_core" className="relative group/widget">
              <div className={`drag-handle absolute top-4 right-4 z-50 cursor-move transition-opacity p-2 bg-black/40 rounded-lg text-text-dim hover:text-white backdrop-blur ${isEditMode ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <GripHorizontal size={16} />
              </div>
              <div className={`panel border flex items-center justify-between p-6 transition-all h-full ${isRunning ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-white/5 hover:border-red-400/30'}`} title={isRunning ? 'Minecraft Server is ONLINE — Click power to stop' : 'Minecraft Server is OFFLINE — Click power to start'}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full ">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-colors ${isRunning ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <Terminal className={`transition-colors ${isRunning ? 'text-emerald-400' : 'text-red-400'}`} size={24} />
                    </div>
                    <div>
                      <span className="block font-display font-black uppercase tracking-tight text-xl italic leading-none">Minecraft Server</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 block transition-colors ${isRunning ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                        {isRunning ? '● Running' : '○ Stopped'} — Toggle Power to {isRunning ? 'Stop' : 'Start'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-8 justify-end">
                    <StatusDisplay isRunning={isRunning} isLoading={isLoading} />
                    <PowerButton isRunning={isRunning} isLoading={isLoading} onToggle={toggle} />
                  </div>
                </div>
              </div>
            </div>

            <div key="docker" className="relative group/widget">
              <div className={`drag-handle absolute top-4 right-10 z-50 cursor-move transition-opacity p-2 bg-black/40 rounded-lg text-text-dim hover:text-white backdrop-blur ${isEditMode ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <GripHorizontal size={16} />
              </div>
              <DockerPanel />
            </div>


          </ResponsiveGridLayoutWithWidth>
        </section>


      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={loadData}
      />
    </>
  );
}

export default App;

