import { Sun, Cloud, CloudRain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWeather } from '../api/dashboard';

export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeather();
      setWeather(data);
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000); // 10 mins

    const timeInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const getIcon = () => {
    switch (weather?.condition) {
      case 'Sunny': return <Sun className="weather-icon sunny" />;
      case 'Cloudy': return <Cloud className="weather-icon" />;
      case 'Rainy': return <CloudRain className="weather-icon rainy" />;
      default: return <Cloud />;
    }
  };

  return (
    <div className="panel weather-panel">
      <div className="weather-gradient" />
      <div className="panel-body weather-body">
        <div className="weather-main">
          <div className="weather-temp">
            {weather ? `${weather.temp}°C` : '--'}
          </div>
          <div className="weather-info">
            <span className="weather-city">{weather?.city || 'Local'}</span>
            <span className="weather-condition">{weather?.condition || 'Updating...'}</span>
          </div>
          <div className="weather-status-icon">
            {getIcon()}
          </div>
        </div>
        
        <div className="clock-section">
          <div className="clock-time">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="clock-date">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
