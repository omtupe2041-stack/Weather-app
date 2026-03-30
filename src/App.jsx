import { useState, useEffect } from 'react';
import './App.css';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherGrid from './components/WeatherGrid';
import SearchBar from './components/SearchBar';

const GEOCODE_API_BASE = 'https://nominatim.openstreetmap.org';
const WEATHER_API_BASE = 'https://api.open-meteo.com';

function App() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buildCityWeather = ({ weatherData, lat, lon, cityName, address, id }) => {
    if (!weatherData?.current) {
      console.error('Weather API response:', weatherData);
      throw new Error('Invalid weather data');
    }

    return {
      id,
      ...weatherData.current,
      time: weatherData.current.time || new Date().toISOString(),
      timezone: weatherData.timezone || 'UTC',
      city: address?.city || address?.town || address?.county || cityName || 'Unknown',
      country: address?.country || '',
      latitude: lat,
      longitude: lon
    };
  };

  // Fetch weather for a single city
  const fetchWeatherByCity = async (cityName) => {
    try {
      // Geocode the city name
      const geoResponse = await fetch(
        `${GEOCODE_API_BASE}/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
      
      if (!geoResponse.ok) throw new Error('Geocoding service error');
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error(`City "${cityName}" not found`);
      }

      const { lat, lon, address } = geoData[0];
      
      const weatherResponse = await fetch(
        `${WEATHER_API_BASE}/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature,pressure_msl,cloud_cover,is_day&timezone=auto`
      );
      
      if (!weatherResponse.ok) throw new Error('Weather service error');
      
      const weatherData = await weatherResponse.json();
      const newCity = buildCityWeather({
        weatherData,
        lat,
        lon,
        cityName,
        address,
        id: Date.now() + Math.random()
      });

      setCities((currentCities) => {
        const cityExists = currentCities.some(
          (city) => city.city.toLowerCase() === newCity.city.toLowerCase()
        );

        if (cityExists) {
          setError(`"${newCity.city}" is already displayed`);
          return currentCities;
        }

        setError('');
        return [...currentCities, newCity];
      });
    } catch (err) {
      console.error('City weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature,pressure_msl,cloud_cover,is_day&timezone=auto`
      );
      if (!response.ok) throw new Error('Weather data fetch failed');
      
      const data = await response.json();
      
      const geoResponse = await fetch(
        `${GEOCODE_API_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
      const geoData = await geoResponse.json();

      const newCity = buildCityWeather({
        weatherData: data,
        lat,
        lon,
        cityName: 'Unknown',
        address: geoData.address,
        id: Date.now()
      });

      setCities([newCity]);
      setError('');
    } catch (err) {
      console.error('Geolocation weather fetch error:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Get user's location on mount
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // If geolocation fails, default to London
          fetchWeatherByCoords(51.5074, -0.1278);
        },
        { timeout: 10000 }
      );
    } else {
      // Fallback for browsers without geolocation
      fetchWeatherByCoords(51.5074, -0.1278);
    }
  }, []);

  const handleSearch = (cityName) => {
    if (cityName && cityName.trim()) {
      setLoading(true);
      fetchWeatherByCity(cityName.trim());
    }
  };

  const removeCity = (id) => {
    setCities(cities.filter(city => city.id !== id));
  };

  const clearAllCities = () => {
    setCities([]);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-title">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="13" r="8"></circle>
              <path d="M12 1v6m0 6v6"></path>
              <path d="M4.22 4.22l4.24 4.24m0 5.08l-4.24 4.24"></path>
              <path d="M19.78 4.22l-4.24 4.24m0 5.08l4.24 4.24"></path>
            </svg>
            <h1>WeatherHub</h1>
          </div>
          <p className="header-subtitle">Real-time Weather Worldwide 🌍</p>
        </div>
        <SearchBar onSearch={handleSearch} />
        {cities.length > 0 && (
          <div className="cities-info">
            <span className="cities-count">📍 {cities.length} {cities.length === 1 ? 'city' : 'cities'} tracked</span>
            <button onClick={clearAllCities} className="clear-all-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear All
            </button>
          </div>
        )}
      </header>
      <main className="App-main">
        {loading && cities.length === 0 && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}
        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}
        {cities.length > 0 && (
          <>
            {loading && <div className="loader-small">Loading...</div>}
            {cities.length === 1 ? (
              <WeatherDisplay data={cities[0]} onRemove={() => removeCity(cities[0].id)} />
            ) : (
              <WeatherGrid cities={cities} onRemoveCity={removeCity} />
            )}
          </>
        )}
        {cities.length === 0 && !loading && (
          <div className="empty-state">
            <p className="empty-icon">🌐</p>
            <p className="empty-title">No cities added yet</p>
            <p className="empty-subtitle">Search for a city above to get started!</p>
          </div>
        )}
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>WeatherHub</h4>
            <p>Real-time weather data from around the world</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>🌍 Global Coverage</li>
              <li>⚡ Real-time Updates</li>
              <li>📊 Detailed Info</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Data Source</h4>
            <p>Open-Meteo API & OpenStreetMap</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 WeatherHub. Built with ❤️ for weather enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
