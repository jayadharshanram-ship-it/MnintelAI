import axios from 'axios';
import { getMineConfig, getAllMines } from '../config/mines.js';
import { saveWeatherObservation, getLatestWeather, getWeatherHistory, logIngestion } from '../db/database.js';

/**
 * Fetch live weather from Open-Meteo API for a specific mine and store in DB
 */
export async function fetchAndStoreWeather(mineIdentifier) {
  const mine = getMineConfig(mineIdentifier);
  const startTime = Date.now();
  const requestTime = new Date().toISOString();

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${mine.latitude}&longitude=${mine.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=7`;

    const response = await axios.get(url, { timeout: 10000 });
    const duration = Date.now() - startTime;
    const current = response.data.current || {};
    const hourly = response.data.hourly || {};
    const daily = response.data.daily || {};

    const rainfall = current.precipitation ?? current.rain ?? 0;
    let miningImpact = "LOW";
    let blastingRisk = "LOW";
    let haulageRisk = "LOW";
    let productionImpact = 0;

    if (rainfall > 10) {
      miningImpact = "HIGH";
      blastingRisk = "CRITICAL";
      haulageRisk = "HIGH";
      productionImpact = -12;
    } else if (rainfall > 2) {
      miningImpact = "MODERATE";
      blastingRisk = "HIGH";
      haulageRisk = "MODERATE";
      productionImpact = -6;
    }

    // Process 24-hour forecast
    const hourlyForecast = [];
    if (hourly.time && Array.isArray(hourly.time)) {
      const now = new Date();
      let startIdx = hourly.time.findIndex(t => new Date(t) >= now);
      if (startIdx === -1) startIdx = 0;
      for (let i = startIdx; i < Math.min(startIdx + 24, hourly.time.length); i++) {
        const d = new Date(hourly.time[i]);
        const hour = d.getHours();
        const hourLabel = i === startIdx ? "Now" : (hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`);
        hourlyForecast.push({
          time: hourly.time[i],
          hourLabel,
          temp: Math.round(hourly.temperature_2m[i]),
          pop: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
          rain: hourly.precipitation ? hourly.precipitation[i] : 0,
          code: hourly.weather_code ? hourly.weather_code[i] : 0
        });
      }
    }

    // Process 7-day forecast
    const dailyForecast = [];
    if (daily.time && Array.isArray(daily.time)) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const d = new Date(daily.time[i] + 'T00:00:00');
        const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()];
        dailyForecast.push({
          date: daily.time[i],
          dayLabel,
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          pop: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
          rain: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
          code: daily.weather_code ? daily.weather_code[i] : 0
        });
      }
    }

    const observationData = {
      mineId: mine.id,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      rainfall: rainfall,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      cloudCover: current.cloud_cover,
      hourlyForecast,
      dailyForecast,
      operationalImpact: {
        miningImpact,
        blastingRisk,
        haulageRisk,
        productionImpactEstimates: `${productionImpact}%`
      },
      source: "Open-Meteo Automated Weather Pipeline",
      dataTimestamp: current.time || new Date().toISOString()
    };

    saveWeatherObservation(observationData);

    logIngestion({
      pipelineSource: 'Open-Meteo Weather',
      action: `Ingested weather for ${mine.name}`,
      requestTime,
      responseTimeMs: duration,
      status: 'SUCCESS',
      recordCount: 1,
      lastSuccessfulUpdate: observationData.dataTimestamp
    });

    return {
      mine: mine.id,
      mineName: mine.name,
      latitude: mine.latitude,
      longitude: mine.longitude,
      current: {
        temperature: observationData.temperature,
        feelsLike: observationData.feelsLike,
        humidity: observationData.humidity,
        rainfall: observationData.rainfall,
        windSpeed: observationData.windSpeed,
        weatherCode: observationData.weatherCode,
        cloudCover: observationData.cloudCover
      },
      hourlyForecast,
      dailyForecast,
      operationalImpact: observationData.operationalImpact,
      source: observationData.source,
      fetchedAt: new Date().toISOString(),
      dataTimestamp: observationData.dataTimestamp,
      isCached: false
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.warn(`[WeatherService] Error fetching weather for ${mine.name}:`, error.message);

    logIngestion({
      pipelineSource: 'Open-Meteo Weather',
      action: `Weather fetch failed for ${mine.name}`,
      requestTime,
      responseTimeMs: duration,
      status: 'FAILED',
      errorMessage: error.message
    });

    // Retrieve previous valid data from DB
    const cached = getLatestWeather(mine.id);
    if (cached) {
      return {
        mine: mine.id,
        mineName: mine.name,
        latitude: mine.latitude,
        longitude: mine.longitude,
        current: {
          temperature: cached.temperature,
          feelsLike: cached.feels_like,
          humidity: cached.humidity,
          rainfall: cached.rainfall,
          windSpeed: cached.wind_speed,
          weatherCode: cached.weather_code,
          cloudCover: cached.cloud_cover
        },
        hourlyForecast: cached.hourlyForecast,
        dailyForecast: cached.dailyForecast,
        operationalImpact: cached.operationalImpact,
        source: `${cached.source} (Cached)`,
        fetchedAt: cached.created_at,
        dataTimestamp: cached.data_timestamp,
        isCached: true,
        warning: `External weather API unreachable (${error.message}). Displaying latest verified observation.`
      };
    }

    throw error;
  }
}

/**
 * Ingest weather for all configured mines in sequence
 */
export async function ingestAllMinesWeather() {
  const mines = getAllMines();
  const results = [];
  for (const mine of mines) {
    try {
      const res = await fetchAndStoreWeather(mine.id);
      results.push({ mine: mine.id, status: 'SUCCESS', isCached: res.isCached });
    } catch (e) {
      results.push({ mine: mine.id, status: 'FAILED', error: e.message });
    }
  }
  return results;
}

/**
 * Retrieve weather for API route: checks latest DB record or triggers refresh if older than threshold
 */
export async function getWeatherForMine(mineIdentifier, maxAgeMinutes = 180) {
  const mine = getMineConfig(mineIdentifier);
  const latest = getLatestWeather(mine.id);

  if (latest) {
    const ageMs = Date.now() - new Date(latest.created_at).getTime();
    if (ageMs < maxAgeMinutes * 60 * 1000) {
      return {
        mine: mine.id,
        mineName: mine.name,
        latitude: mine.latitude,
        longitude: mine.longitude,
        current: {
          temperature: latest.temperature,
          feelsLike: latest.feels_like,
          humidity: latest.humidity,
          rainfall: latest.rainfall,
          windSpeed: latest.wind_speed,
          weatherCode: latest.weather_code,
          cloudCover: latest.cloud_cover
        },
        hourlyForecast: latest.hourlyForecast,
        dailyForecast: latest.dailyForecast,
        operationalImpact: latest.operationalImpact,
        source: latest.source,
        fetchedAt: latest.created_at,
        dataTimestamp: latest.data_timestamp,
        isCached: true
      };
    }
  }

  // Older than maxAgeMinutes or no record, fetch fresh
  return await fetchAndStoreWeather(mine.id);
}

export function getMineWeatherHistory(mineIdentifier, limit = 14) {
  const mine = getMineConfig(mineIdentifier);
  return getWeatherHistory(mine.id, limit);
}
