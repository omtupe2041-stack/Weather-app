import { useState, useEffect } from 'react';
import './WeatherGrid.css';

function WeatherGrid({ cities, onRemoveCity }) {
  const [timeUpdated, setTimeUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherInfo = (code) => {
    const weatherCodes = {
      0: { desc: 'Clear', icon: '☀️' },
      1: { desc: 'Mainly Clear', icon: '🌤️' },
      2: { desc: 'Partly Cloudy', icon: '⛅' },
      3: { desc: 'Overcast', icon: '☁️' },
      45: { desc: 'Foggy', icon: '🌫️' },
      48: { desc: 'Foggy', icon: '🌫️' },
      51: { desc: 'Drizzle', icon: '🌧️' },
      53: { desc: 'Drizzle', icon: '🌧️' },
      55: { desc: 'Drizzle', icon: '🌧️' },
      61: { desc: 'Rain', icon: '🌧️' },
      63: { desc: 'Rain', icon: '🌧️' },
      65: { desc: 'Heavy Rain', icon: '⛈️' },
      71: { desc: 'Snow', icon: '❄️' },
      73: { desc: 'Snow', icon: '❄️' },
      75: { desc: 'Heavy Snow', icon: '❄️' },
      77: { desc: 'Snow', icon: '❄️' },
      80: { desc: 'Showers', icon: '🌧️' },
      81: { desc: 'Showers', icon: '⛈️' },
      82: { desc: 'Showers', icon: '⛈️' },
      85: { desc: 'Snow', icon: '❄️' },
      86: { desc: 'Snow', icon: '❄️' },
      95: { desc: 'Storm', icon: '⛈️' },
      96: { desc: 'Storm', icon: '⛈️' },
      99: { desc: 'Storm', icon: '⛈️' }
    };
    return weatherCodes[code] || { desc: 'Unknown', icon: '🌍' };
  };

  const getHumidityLevel = (humidity) => {
    if (humidity < 30) return 'Dry';
    if (humidity < 60) return 'Comfortable';
    if (humidity < 80) return 'Humid';
    return 'Very Humid';
  };

  const getLocalTime = (timeStr) => {
    if (timeStr) {
      const [date, time] = timeStr.split('T');
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    return null;
  };

  const getDayNightIndicator = (isDay) => {
    if (isDay === 1) {
      return { emoji: '☀️', text: 'Day', className: 'day' };
    } else if (isDay === 0) {
      return { emoji: '🌙', text: 'Night', className: 'night' };
    }
    return { emoji: '🌍', text: 'Unknown', className: 'unknown' };
  };

  // Sort cities by temperature (descending)
  const sortedCities = [...cities].sort((a, b) => b.temperature_2m - a.temperature_2m);

  return (
    <div className="weather-grid-container">
      <div className="grid-header">
        <h3>🌍 Weather Worldwide</h3>
        <p>{cities.length} locations tracked • Updated: {timeUpdated.toLocaleTimeString()}</p>
      </div>
      <div className="weather-grid">
        {sortedCities.map((city, index) => {
          const weatherInfo = getWeatherInfo(city.weather_code);
          const temp = Math.round(city.temperature_2m);
          const feelsLike = Math.round(city.apparent_temperature);
          const humidity = getHumidityLevel(city.relative_humidity_2m);
          const localTime = getLocalTime(city.time);
          const dayNightInfo = getDayNightIndicator(city.is_day);

          return (
            <div key={city.id} className="weather-grid-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <button 
                className="grid-remove-btn"
                onClick={() => onRemoveCity(city.id)}
                title="Remove city"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="grid-card-header">
                <div>
                  <h4>📍 {city.city}</h4>
                  <p>{city.country}</p>
                </div>
                <div className={`grid-day-night ${dayNightInfo?.className}`}>
                  <span className="grid-day-night-emoji">{dayNightInfo?.emoji}</span>
                  <span className="grid-day-night-text">{dayNightInfo?.text}</span>
                  {localTime && <span className="grid-local-time">{localTime}</span>}
                </div>
              </div>

              <div className="grid-icon-temp">
                <div className="grid-icon">{weatherInfo.icon}</div>
                <div className="grid-temperature">
                  <span className="grid-temp">{temp}°C</span>
                  <span className="grid-feels">feels {feelsLike}°C</span>
                </div>
              </div>

              <div className="grid-description">{weatherInfo.desc}</div>

              <div className="grid-details">
                <div className="grid-detail">
                  <span>💧</span>
                  <div>
                    <span className="detail-val">{city.relative_humidity_2m}%</span>
                    <span className="detail-label">{humidity}</span>
                  </div>
                </div>
                <div className="grid-detail">
                  <span>💨</span>
                  <div>
                    <span className="detail-val">{Math.round(city.wind_speed_10m)} m/s</span>
                    <span className="detail-label">Wind</span>
                  </div>
                </div>
                <div className="grid-detail">
                  <span>☁️</span>
                  <div>
                    <span className="detail-val">{city.cloud_cover}%</span>
                    <span className="detail-label">Cloud</span>
                  </div>
                </div>
              </div>

              <div className="grid-pressure">
                <span className="grid-pressure-label">Pressure: </span>
                <span className="grid-pressure-value">{Math.round(city.pressure_msl)} hPa</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherGrid;
