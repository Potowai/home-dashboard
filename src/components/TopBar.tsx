import { Settings, Sun, Moon, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, CloudOff } from 'lucide-react';
import { useWSChannel } from '../hooks/useWebSocket';

interface TopBarProps {
  greetingName: string;
  onSettingsClick: () => void;
  currentTime: Date;
}

function WeatherIcon({ condition, isDay }: { condition?: string; isDay?: boolean }) {
  const props = { size: 18 };

  if (!condition) return <Cloud {...props} style={{ color: 'var(--text-secondary)' }} />;

  if (!isDay && (condition === 'Clear' || condition === 'Mainly Clear')) {
    return <Moon size={18} style={{ color: 'var(--graph-blue)' }} />;
  }

  switch (condition) {
    case 'Clear':
    case 'Mainly Clear':
      return <Sun {...props} style={{ color: 'var(--status-amber)' }} />;
    case 'Partly Cloudy':
    case 'Overcast':
    case 'Cloudy':
    case 'Mainly Sunny':
      return <Cloud {...props} style={{ color: 'var(--text-secondary)' }} />;
    case 'Foggy':
      return <CloudFog {...props} style={{ color: 'var(--text-secondary)' }} />;
    case 'Drizzle':
    case 'Showers':
    case 'Rainy':
      return <CloudRain {...props} style={{ color: 'var(--graph-blue)' }} />;
    case 'Snowy':
    case 'Snow Showers':
      return <Snowflake {...props} style={{ color: 'var(--graph-blue)' }} />;
    case 'Stormy':
    case 'Thunderstorm':
      return <CloudLightning {...props} style={{ color: 'var(--status-amber)' }} />;
    default:
      return <CloudOff {...props} style={{ color: 'var(--text-secondary)' }} />;
  }
}

export function TopBar({ greetingName, onSettingsClick, currentTime }: TopBarProps) {
  const weather = useWSChannel('weather');

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="top-bar">
      {/* Left: Greeting */}
      <div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {greeting}, {greetingName || 'there'}
        </span>
      </div>

      {/* Right: Weather, Time, Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Weather compact */}
        <div className="weather-compact">
          <WeatherIcon condition={weather?.condition} isDay={weather?.isDay} />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>
            {weather ? `${weather.temp}°` : '--°'}
          </span>
          {weather?.city && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {weather.city}
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

        {/* Time */}
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
          {timeStr}
        </span>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="btn-icon"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
