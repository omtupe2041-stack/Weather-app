import { useState, useEffect } from 'react';
import './WeatherDisplay.css';

function WeatherDisplay({ data, onRemove }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data) return null;

  const getWeatherInfo = (code) => {
    const weatherCodes = {
      0: { desc: 'Clear Sky', icon: '☀️', condition: 'Perfect' },
      1: { desc: 'Mainly Clear', icon: '🌤️', condition: 'Great' },
      2: { desc: 'Partly Cloudy', icon: '⛅', condition: 'Good' },
      3: { desc: 'Overcast', icon: '☁️', condition: 'Fair' },
      45: { desc: 'Foggy', icon: '🌫️', condition: 'Limited' },
      48: { desc: 'Foggy', icon: '🌫️', condition: 'Limited' },
      51: { desc: 'Light Drizzle', icon: '🌧️', condition: 'Wet' },
      53: { desc: 'Moderate Drizzle', icon: '🌧️', condition: 'Wet' },
      55: { desc: 'Heavy Drizzle', icon: '🌧️', condition: 'Very Wet' },
      61: { desc: 'Slight Rain', icon: '🌧️', condition: 'Wet' },
      63: { desc: 'Moderate Rain', icon: '🌧️', condition: 'Wet' },
      65: { desc: 'Heavy Rain', icon: '⛈️', condition: 'Very Wet' },
      71: { desc: 'Slight Snow', icon: '❄️', condition: 'Snowing' },
      73: { desc: 'Moderate Snow', icon: '❄️', condition: 'Snowing' },
      75: { desc: 'Heavy Snow', icon: '❄️', condition: 'Heavy Snow' },
      77: { desc: 'Snow Grains', icon: '❄️', condition: 'Snowing' },
      80: { desc: 'Slight Rain Showers', icon: '🌧️', condition: 'Showers' },
      81: { desc: 'Moderate Rain Showers', icon: '⛈️', condition: 'Heavy Showers' },
      82: { desc: 'Violent Rain Showers', icon: '⛈️', condition: 'Severe' },
      85: { desc: 'Slight Snow Showers', icon: '❄️', condition: 'Snow Showers' },
      86: { desc: 'Heavy Snow Showers', icon: '❄️', condition: 'Heavy Showers' },
      95: { desc: 'Thunderstorm', icon: '⛈️', condition: 'Severe' },
      96: { desc: 'Thunderstorm with Hail', icon: '⛈️', condition: 'Severe' },
      99: { desc: 'Thunderstorm with Hail', icon: '⛈️', condition: 'Severe' }
    };
    return weatherCodes[code] || { desc: 'Unknown', icon: '🌍', condition: 'Unknown' };
  };

  const getWindDirection = (speed) => {
    if (speed < 1) return 'Calm';
    if (speed < 5) return 'Light';
    if (speed < 15) return 'Moderate';
    if (speed < 25) return 'Fresh';
    return 'Strong';
  };

  const getHumidityLevel = (humidity) => {
    if (humidity < 30) return 'Dry';
    if (humidity < 60) return 'Comfortable';
    if (humidity < 80) return 'Humid';
    return 'Very Humid';
  };

  const getLocalTime = () => {
    if (data.time) {
      const [date, timeStr] = data.time.split('T');
      const [hours, minutes] = timeStr.split(':');
      return { hours: parseInt(hours), minutes: parseInt(minutes), time: `${hours}:${minutes}` };
    }
    return null;
  };

  const getDayNightIndicator = () => {
    if (data.is_day === 1) {
      return { emoji: '☀️', text: 'Day', className: 'day' };
    } else if (data.is_day === 0) {
      return { emoji: '🌙', text: 'Night', className: 'night' };
    }
    return { emoji: '🌍', text: 'Unknown', className: 'unknown' };
  };

  const weatherInfo = getWeatherInfo(data.weather_code);
  const temp = Math.round(data.temperature_2m);
  const feelsLike = Math.round(data.apparent_temperature);
  const tempDiff = feelsLike - temp;
  const windDirection = getWindDirection(data.wind_speed_10m);
  const humidityLevel = getHumidityLevel(data.relative_humidity_2m);
  const localTime = getLocalTime();
  const dayNightInfo = getDayNightIndicator();

  return (
    <div className="weather-container">
      <div className="weather-card">
        <button className="remove-btn" onClick={onRemove} title="Remove city">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="card-header">
          <div className="location-info">
            <h2 className="location-name">
              <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
              {data.city}
            </h2>
            <p className="location-country">📍 {data.country}</p>
          </div>
          <div className="time-display">
            <div className={`day-night-indicator ${dayNightInfo?.className}`}>
              <span className="day-night-emoji">{dayNightInfo?.emoji}</span>
              <span className="day-night-text">{dayNightInfo?.text}</span>
            </div>
            {localTime && <div className="local-time">{localTime.time}</div>}
            <div className="date">{time.toLocaleDateString()}</div>
          </div>
        </div>

        <div className="weather-main">
          <div className="weather-icon-large">{weatherInfo.icon}</div>
          <div className="temperature-section">
            <div className="temperature">{temp}°C</div>
            <div className="description">{weatherInfo.desc}</div>
            <div className="condition-badge">{weatherInfo.condition}</div>
            <div className={`feels-like ${tempDiff !== 0 ? 'active' : ''}`}>
              Feels like <span>{feelsLike}°C</span> 
              {tempDiff > 0 ? ' 🔥' : tempDiff < 0 ? ' ❄️' : ''}
            </div>
          </div>
        </div>

        <div className="weather-details-grid">
          <div className="detail-card detail-humidity">
            <div className="detail-icon">💧</div>
            <div className="detail-content">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{data.relative_humidity_2m}%</span>
              <span className="detail-sub">{humidityLevel}</span>
            </div>
          </div>

          <div className="detail-card detail-wind">
            <div className="detail-icon">💨</div>
            <div className="detail-content">
              <span className="detail-label">Wind Speed</span>
              <span className="detail-value">{Math.round(data.wind_speed_10m)} m/s</span>
              <span className="detail-sub">{windDirection}</span>
            </div>
          </div>

          <div className="detail-card detail-pressure">
            <div className="detail-icon">🔽</div>
            <div className="detail-content">
              <span className="detail-label">Pressure</span>
              <span className="detail-value">{Math.round(data.pressure_msl)} hPa</span>
              <span className="detail-sub">
                {data.pressure_msl > 1013 ? 'Rising' : data.pressure_msl < 1013 ? 'Falling' : 'Stable'}
              </span>
            </div>
          </div>

          <div className="detail-card detail-cloud">
            <div className="detail-icon">☁️</div>
            <div className="detail-content">
              <span className="detail-label">Cloud Cover</span>
              <span className="detail-value">{data.cloud_cover}%</span>
              <span className="detail-sub">
                {data.cloud_cover < 20 ? 'Clear' : data.cloud_cover < 50 ? 'Partly' : 'Mostly Cloudy'}
              </span>
            </div>
          </div>
        </div>

        <div className="weather-insights">
          <div className="insight">
            <span className="insight-title">Visibility</span>
            <span className="insight-value">Good</span>
          </div>
          <div className="insight">
            <span className="insight-title">UV Index</span>
            <span className="insight-value">{data.temperature_2m > 25 ? 'High' : 'Moderate'}</span>
          </div>
          <div className="insight">
            <span className="insight-title">Air Quality</span>
            <span className="insight-value">Fair</span>
          </div>
        </div>

        <div className="coordinates">
          📍 {data.latitude?.toFixed(4)}°N, {Math.abs(data.longitude?.toFixed(4))}°E
        </div>

        <button className="add-to-list-btn" onClick={() => window.location.reload()}>
          ➕ Add Another City
        </button>
      </div>
    </div>
  );
}

export default WeatherDisplay;
