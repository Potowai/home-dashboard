import { X, Save, Settings as SettingsIcon, Globe, MapPin, Palette, Layout } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    ip_address: '',
    theme: 'dark'
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

  const modalContent = (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <div className="modal-title">
            <div className="w-10 h-10 bg-accent-dim/20 rounded-xl flex items-center justify-center border border-accent-color/20">
              <SettingsIcon size={22} className="text-accent-color" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest uppercase opacity-50 leading-none mb-1">System</span>
              <span className="text-xl font-black uppercase tracking-tighter italic">Configuration</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body custom-scrollbar max-h-[70vh] overflow-y-auto">
            {/* Section: Appearance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent-color/60">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Appearance</span>
              </div>
              
              <div className="form-group">
                <label>Dashboard Branding</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none border-r border-white/5">
                    <Layout className="text-text-dim/50" size={16} />
                  </div>
                  <input
                    className="form-input pl-14"
                    value={settings.dashboard_title}
                    onChange={e => setSettings({ ...settings, dashboard_title: e.target.value })}
                    placeholder="e.g. HOME_NODE_01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Color Schema</label>
                <select
                  className="form-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                  value={settings.theme || 'dark'}
                  onChange={e => setSettings({ ...settings, theme: e.target.value })}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' opacity='0.3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                >
                  <option value="dark">Deep Space (Dark)</option>
                  <option value="light">Arctic White (Light)</option>
                </select>
              </div>
            </div>

            <div className="h-[1px] bg-white/5 my-2" />

            {/* Section: Localization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent-color/60">
                <MapPin size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Localization</span>
              </div>

              <div className="form-group">
                <label>Target City</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none border-r border-white/5">
                    <Globe className="text-text-dim/50" size={16} />
                  </div>
                  <input
                    className="form-input pl-14"
                    value={settings.weather_city}
                    onChange={e => setSettings({ ...settings, weather_city: e.target.value })}
                    placeholder="e.g. Paris, FR"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Network Node IP</label>
                <input
                  className="form-input"
                  value={settings.ip_address}
                  onChange={e => setSettings({ ...settings, ip_address: e.target.value })}
                  placeholder="192.168.1.xxx"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Synchronize Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use createPortal to ensure the modal literally renders on top of the document.body
  return createPortal(modalContent, document.body);

}
