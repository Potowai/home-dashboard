import { Cpu, Zap, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats } from '../api/dashboard';

export function SystemStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="panel stats-panel">
      <div className="panel-header">
        <span className="panel-title">System Metrics</span>
      </div>
      <div className="panel-body stats-body">
        <div className="stat-card">
          <div className="stat-icon cpu">
            <Cpu size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">CPU Load</span>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${stats.cpu}%` }} />
            </div>
            <span className="stat-value">{stats.cpu}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ram">
            <Zap size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">RAM Usage</span>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${stats.ram}%` }} />
            </div>
            <span className="stat-value">{stats.ram}% of {stats.totalMem}GB</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon uptime">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">System Uptime</span>
            <span className="stat-value big">{stats.uptime} Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
