import { ingestAllMinesWeather } from './weatherService.js';
import { ingestAllMinesSatellite } from './copernicusService.js';
import { runAndPersistMLPipeline } from './mlService.js';
import { getAllMines } from '../config/mines.js';
import { logIngestion } from '../db/database.js';

let weatherInterval = null;
let satelliteInterval = null;
let isIngestingWeather = false;
let isIngestingSatellite = false;

// 3 Hours in milliseconds
const WEATHER_REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000;
// 24 Hours in milliseconds
const SATELLITE_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Execute automated weather pipeline for all mines
 */
export async function triggerWeatherPipeline() {
  if (isIngestingWeather) return;
  isIngestingWeather = true;
  console.log('[Scheduler] 🌦 Starting automated Weather ingestion cycle...');

  try {
    const results = await ingestAllMinesWeather();
    console.log('[Scheduler] ✓ Weather cycle complete:', results);

    // Update ML predictions with fresh weather
    for (const mine of getAllMines()) {
      runAndPersistMLPipeline(mine.id);
    }
  } catch (err) {
    console.error('[Scheduler] ⚠ Weather cycle encountered error:', err.message);
  } finally {
    isIngestingWeather = false;
  }
}

/**
 * Execute automated Copernicus Sentinel-2 satellite pipeline for all mines
 */
export async function triggerSatellitePipeline() {
  if (isIngestingSatellite) return;
  isIngestingSatellite = true;
  console.log('[Scheduler] 🛰 Starting automated Copernicus Sentinel-2 discovery cycle...');

  try {
    const results = await ingestAllMinesSatellite();
    console.log('[Scheduler] ✓ Satellite cycle complete:', results);

    // Update ML predictions with fresh spectral indices
    for (const mine of getAllMines()) {
      runAndPersistMLPipeline(mine.id);
    }
  } catch (err) {
    console.error('[Scheduler] ⚠ Satellite cycle encountered error:', err.message);
  } finally {
    isIngestingSatellite = false;
  }
}

/**
 * Initialize background cron timers
 */
export function startIngestionScheduler() {
  console.log('[Scheduler] Initializing automated data pipeline scheduler...');

  // 1. Run immediate ingestion cycle on startup (asynchronously after a brief delay)
  setTimeout(async () => {
    await triggerWeatherPipeline();
    await triggerSatellitePipeline();
  }, 2000);

  // 2. Set interval for Weather (every 3 hours)
  weatherInterval = setInterval(async () => {
    await triggerWeatherPipeline();
  }, WEATHER_REFRESH_INTERVAL_MS);

  // 3. Set interval for Sentinel-2 Satellite (daily)
  satelliteInterval = setInterval(async () => {
    await triggerSatellitePipeline();
  }, SATELLITE_REFRESH_INTERVAL_MS);

  console.log(`[Scheduler] ✓ Weather scheduled every 3h, Satellite scheduled every 24h.`);
}

export function stopIngestionScheduler() {
  if (weatherInterval) clearInterval(weatherInterval);
  if (satelliteInterval) clearInterval(satelliteInterval);
  console.log('[Scheduler] Scheduled timers stopped.');
}
