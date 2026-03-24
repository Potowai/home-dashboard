import { X, Save, Settings, Globe, MapPin, Palette } from 'lucide-react';
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
    theme: 'dark',
    name: '',
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

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#1E1E24',
          border: '1px solid #3A3A44',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #3A3A44',
          background: '#26262E',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(232,168,124,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(232,168,124,0.25)',
            }}>
              <Settings size={20} style={{ color: '#E8A87C' }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A8894', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                System
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#F0EDE6' }}>
                Configuration
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid #3A3A44',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8A8894',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#3A3A44';
              (e.currentTarget as HTMLElement).style.color = '#F0EDE6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#8A8894';
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}>
            {/* Appearance section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Palette size={14} style={{ color: '#E8A87C' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8A8894', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Appearance
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <FormField label="Dashboard Title">
                  <input
                    type="text"
                    value={settings.dashboard_title ?? ''}
                    onChange={e => setSettings({ ...settings, dashboard_title: e.target.value })}
                    placeholder="Home Dashboard"
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Greeting Name">
                  <input
                    type="text"
                    value={settings.name ?? ''}
                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                    placeholder="Alex"
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Theme">
                  <select
                    value={settings.theme ?? 'dark'}
                    onChange={e => setSettings({ ...settings, theme: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer', color: '#F0EDE6' }}
                  >
                    <option value="dark" style={{ background: '#1E1E24' }}>Dark</option>
                    <option value="light" style={{ background: '#1E1E24' }}>Light</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#3A3A44' }} />

            {/* Localization section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MapPin size={14} style={{ color: '#E8A87C' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8A8894', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Localization
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <FormField label="Weather City">
                  <div style={{ position: 'relative' }}>
                    <Globe size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8894', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={settings.weather_city ?? ''}
                      onChange={e => setSettings({ ...settings, weather_city: e.target.value })}
                      placeholder="Toulouse"
                      style={{ ...inputStyle, paddingLeft: '38px', color: '#F0EDE6' }}
                    />
                  </div>
                </FormField>

                <FormField label="Network Node IP">
                  <input
                    type="text"
                    value={settings.ip_address ?? ''}
                    onChange={e => setSettings({ ...settings, ip_address: e.target.value })}
                    placeholder="192.168.1.xx"
                    style={inputStyle}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid #3A3A44',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                background: '#E8A87C',
                color: '#0F0F12',
                border: 'none',
                borderRadius: '12px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                cursor: isSaving ? 'wait' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#C4C0B8',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Use lighter background for inputs to ensure contrast
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#2A2A32',
  border: '1px solid #3A3A44',
  borderRadius: '10px',
  color: '#F0EDE6',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
};
