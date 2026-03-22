import { X, Save, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/dashboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function SettingsModal({ isOpen, onClose, onRefresh }: SettingsModalProps) {
  const [settings, setSettings] = useState<any>({
    weather_city: '',
    dashboard_title: '',
    ip_address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        const data = await getSettings();
        if (data) setSettings(data);
      };
      fetchSettings();
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateSettings(settings);
    if (success) {
      onRefresh();
      onClose();
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <div className="modal-title">
            <SettingsIcon size={20} />
            Dashboard Settings
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label>Dashboard Title</label>
            <input
              className="form-input"
              value={settings.dashboard_title}
              onChange={e => setSettings({ ...settings, dashboard_title: e.target.value })}
              placeholder="Home Dashboard"
            />
          </div>
          <div className="form-group">
            <label>Weather City</label>
            <input
              className="form-input"
              value={settings.weather_city}
              onChange={e => setSettings({ ...settings, weather_city: e.target.value })}
              placeholder="e.g. Toulouse"
            />
          </div>
          <div className="form-group">
            <label>Local IP Address</label>
            <input
              className="form-input"
              value={settings.ip_address}
              onChange={e => setSettings({ ...settings, ip_address: e.target.value })}
              placeholder="192.168.1.xxx"
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="save-btn" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
