import { X, Save, Settings as SettingsIcon, Globe, MapPin, Palette, Layout } from 'lucide-react';
import { TextInput, Select } from '@mantine/core';
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
              
              <TextInput
                leftSection={<Layout size={16} className="text-text-dim/50" />}
                label="Dashboard Branding"
                value={settings.dashboard_title}
                onChange={e => setSettings({ ...settings, dashboard_title: e.target.value })}
                placeholder="e.g. HOME_NODE_01"
                classNames={{
                  input: 'form-input bg-transparent',
                  label: 'text-xs font-bold uppercase tracking-wider mb-1.5',
                }}
              />

              <Select
                label="Color Schema"
                value={settings.theme || 'dark'}
                onChange={val => setSettings({ ...settings, theme: val || 'dark' })}
                data={[
                  { value: 'dark', label: 'Deep Space (Dark)' },
                  { value: 'light', label: 'Arctic White (Light)' },
                ]}
                allowDeselect={false}
                checkIconPosition="right"
                classNames={{
                  input: 'form-input bg-transparent',
                  label: 'text-xs font-bold uppercase tracking-wider mb-1.5',
                  dropdown: 'bg-surface border border-white/10',
                  option: 'hover:bg-accent-color/10',
                }}
              />
            </div>

            <div className="h-[1px] bg-white/5 my-2" />

            {/* Section: Localization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent-color/60">
                <MapPin size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Localization</span>
              </div>

              <TextInput
                leftSection={<Globe size={16} className="text-text-dim/50" />}
                label="Target City"
                value={settings.weather_city}
                onChange={e => setSettings({ ...settings, weather_city: e.target.value })}
                placeholder="e.g. Paris, FR"
                classNames={{
                  input: 'form-input bg-transparent',
                  label: 'text-xs font-bold uppercase tracking-wider mb-1.5',
                }}
              />

              <TextInput
                label="Network Node IP"
                value={settings.ip_address}
                onChange={e => setSettings({ ...settings, ip_address: e.target.value })}
                placeholder="192.168.1.xxx"
                classNames={{
                  input: 'form-input bg-transparent',
                  label: 'text-xs font-bold uppercase tracking-wider mb-1.5',
                }}
              />
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
