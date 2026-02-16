import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Unable to fetch weather');
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  // Function to determine background class based on weather
  const getWeatherBackground = () => {
    if (!weather) return 'default';
    
    const weatherMain = weather.weather[0].main.toLowerCase();
    const weatherId = weather.weather[0].id;
    
    // Check time of day
    const currentTime = new Date().getTime() / 1000;
    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;
    const isNight = currentTime < sunrise || currentTime > sunset;

    if (isNight) return 'night';
    
    // Weather conditions
    if (weatherMain.includes('clear')) return 'clear';
    if (weatherMain.includes('cloud')) return 'cloudy';
    if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) return 'rainy';
    if (weatherMain.includes('thunder')) return 'stormy';
    if (weatherMain.includes('snow')) return 'snowy';
    if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze') || weatherMain.includes('smoke')) return 'foggy';
    
    return 'default';
  };

  return (
    <div className={`app ${getWeatherBackground()}`}>
      <div className="weather-container">
        <h1>🌤️ Weather App</h1>
        
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
           
          />
          <button onClick={fetchWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
         
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-info">
            <h2>📍 {weather.name}, {weather.sys.country}</h2>
            <div className="temperature">
              <h1>{Math.round(weather.main.temp)}°C</h1>
            </div>
            <div className="condition">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
              />
              <p>{weather.weather[0].description}</p>
            </div>
            <div className="details">
              <div className="detail-item">
                <span className="label">Feels like</span>
                <span className="value">{Math.round(weather.main.feels_like)}°C</span>
              </div>
              <div className="detail-item">
                <span className="label">Humidity</span>
                <span className="value">{weather.main.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="label">Wind Speed</span>
                <span className="value">{weather.wind.speed} m/s</span>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="welcome-message">
            <p>🌍 Enter a city name or use your location to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;