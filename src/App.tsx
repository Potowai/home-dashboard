import { Server } from 'lucide-react';
import { Header, PowerButton, StatusDisplay, LogsPanel, ServiceCard } from './components';
import { useDashboard } from './hooks/useDashboard';
import type { Service } from './types';
import './App.css';

const services: Service[] = [
  { name: 'CasaOS', url: 'https://casa.potowai.cloud', description: 'System Management', icon: 'casa', color: 'casa' },
  { name: 'Immich', url: 'https://immich.potowai.cloud', description: 'Photo Backup', icon: 'immich', color: 'immich' },
  { name: 'Nextcloud', url: 'https://nextcloud.potowai.cloud', description: 'File Storage', icon: 'nextcloud', color: 'nextcloud' },
  { name: 'Minecraft', url: 'https://mc.potowai.cloud', description: 'Game Server', icon: 'mc', color: 'mc' },
];

function App() {
  const { isRunning, logs, isLoading, toggle, clear } = useDashboard();

  return (
    <>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      
      <div className="container">
        <Header ip="192.168.1.138" />

        <div className="main-grid">
          <div className="left-column">
            <div className="panel">
              <div className="panel-body">
                <div className="minecraft-hero">
                  <div className="minecraft-icon">
                    <Server size={40} />
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
                      <ServiceCard key={service.name} service={service} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <LogsPanel logs={logs} onClear={clear} />
        </div>

        <footer>
          <p>potowai.cloud | Tailscale: 100.80.72.64</p>
        </footer>
      </div>
    </>
  );
}

export default App;
