'use client';

import { useState } from 'react';

const weatherCodeDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
};

export default function Home() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const searchTerm = location.trim();

    if (!searchTerm) {
      setError('Please enter a city or location.');
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError('');
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error('Unable to find that location.');
      }

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error('No matching location found. Try another search.');
      }

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`
      );

      if (!weatherResponse.ok) {
        throw new Error('Unable to load weather for that location.');
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      setWeather({
        name: place.name,
        country: place.country,
        region: place.admin1,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        description: weatherCodeDescriptions[current.weather_code] ?? 'Weather conditions unavailable',
        observedAt: current.time,
      });
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="weather-card" aria-labelledby="app-title">
        <p className="eyebrow">WeatherJS</p>
        <h1 id="app-title">Check the current weather</h1>
        <p className="intro">
          Search for a city to see the current temperature, humidity, wind speed, and sky conditions.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="location">Location</label>
          <div className="search-row">
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Try Seattle, London, or Tokyo"
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get weather'}
            </button>
          </div>
        </form>

        {error ? <p className="message error">{error}</p> : null}

        {weather ? (
          <article className="forecast" aria-live="polite">
            <div>
              <p className="location-name">
                {weather.name}{weather.region ? `, ${weather.region}` : ''}
              </p>
              <p className="country-name">{weather.country}</p>
            </div>
            <p className="temperature">{Math.round(weather.temperature)}°F</p>
            <p className="description">{weather.description}</p>
            <dl className="details-grid">
              <div>
                <dt>Humidity</dt>
                <dd>{weather.humidity}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{Math.round(weather.windSpeed)} mph</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{new Date(weather.observedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </section>
    </main>
  );
}
