import { Server, Plus, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header, PowerButton, StatusDisplay, LogsPanel, ServiceCard, SystemStats, WeatherWidget, SettingsModal } from './components';
import { useDashboard } from './hooks/useDashboard';
import { getServices, addService, deleteService, getSettings } from './api/dashboard';
import type { Service } from './types';
import './App.css';

function App() {
  const { isRunning, logs, isLoading, toggle, clear } = useDashboard();
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const loadData = async () => {
    const [serviceData, settingsData] = await Promise.all([
      getServices(),
      getSettings()
    ]);
    setServices(serviceData);
    setSettings(settingsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    const iconSlug = name.toLowerCase().replace(/\s+/g, '-');
    const iconUrl = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${iconSlug}.svg`;

    const newService: Omit<Service, 'id'> = {
      name,
      url,
      description: 'Manually Added',
      icon: iconSlug,
      iconUrl,
      color: 'generic'
    };

    const saved = await addService(newService);
    if (saved) {
      setServices([...services, saved]);
      setName('');
      setUrl('');
    }
  };

  const handleDeleteService = async (id: number) => {
    const success = await deleteService(id);
    if (success) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      
      <div className="container">
        <div className="header-top">
          <Header ip={settings?.ip_address || "192.168.1.138"} title={settings?.dashboard_title} />
          <button className="settings-btn" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} />
            Settings
          </button>
        </div>

        <WeatherWidget key={settings?.weather_city} />

        <div className="main-grid">
          <div className="left-column">
            <div className="panel">
              <div className="panel-body">
                <div className="minecraft-hero">
                  <div className="minecraft-icon">
                    <img 
                      src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/minecraft.svg" 
                      alt="Minecraft" 
                      className="real-icon" 
                    />
                  </div>
                  <h1 className="minecraft-title">Minecraft</h1>
                  <p className="minecraft-subtitle">Server Control Center</p>
                  
                  <StatusDisplay isRunning={isRunning} />
                  
                  <PowerButton 
                    isRunning={isRunning} 
                    isLoading={isLoading} 
                    onToggle={toggle} 
                  />
                </div>
              </div>
            </div>

            <SystemStats />

            <div className="services-section">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">
                    <Server size={18} />
                    Quick Access
                  </span>
                </div>
                <div className="panel-body services-body">
                  <div className="services-grid">
                    {services.map(service => (
                      <ServiceCard 
                        key={service.id || service.name} 
                        service={service} 
                        onDelete={handleDeleteService}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel add-service-panel">
                <div className="panel-header">
                  <span className="panel-title">Add New Service</span>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddService} className="form-grid">
                    <div className="form-group">
                      <label>App Name</label>
                      <input 
                        className="form-input" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Obsidian"
                      />
                    </div>
                    <div className="form-group">
                      <label>URL</label>
                      <input 
                        className="form-input" 
                        value={url} 
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <button type="submit" className="add-btn">
                      <Plus size={18} />
                      Add App
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <LogsPanel logs={logs} onClear={clear} />
        </div>

        <footer>
          <p>{settings?.dashboard_title || 'potowai.cloud'} | Tailscale: 100.80.72.64</p>
        </footer>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={loadData}
      />
    </>
  );
}

export default App;
