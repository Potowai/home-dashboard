import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, CloudFog } from 'lucide-react';
import { useWSChannel } from '../hooks/useWebSocket';

export function WeatherWidget() {
  const weather = useWSChannel('weather');

  const getIcon = () => {
    if (!weather) return <Cloud size={32} />;
    const { condition, isDay } = weather;

    if (!isDay && (condition === 'Clear' || condition === 'Mainly Clear')) {
      return <Moon size={32} className="text-blue-400" />;
    }

    switch (condition) {
      case 'Clear':
      case 'Mainly Clear':
        return <Sun size={32} className="text-yellow-400" />;
      case 'Partly Cloudy':
      case 'Overcast':
      case 'Cloudy':
        return <Cloud size={32} className="text-gray-400" />;
      case 'Foggy':
        return <CloudFog size={32} className="text-gray-400" />;
      case 'Drizzle':
      case 'Showers':
      case 'Rainy':
        return <CloudRain size={32} className="text-blue-400" />;
      case 'Snowy':
      case 'Snow Showers':
        return <Snowflake size={32} className="text-blue-200" />;
      case 'Stormy':
        return <CloudLightning size={32} className="text-purple-400" />;
      default:
        return <Cloud size={32} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center gap-4 text-text-primary">
      <div className="flex flex-col items-end">
        <div className="text-2xl font-black tracking-tighter leading-none">
          {weather ? `${weather.temp}°` : '--°'}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-dim mt-1">
          {weather?.condition || 'Loading'}
        </div>
      </div>
      <div>
        {getIcon()}
      </div>
    </div>
  );
}
