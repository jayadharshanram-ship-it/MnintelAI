import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
import express from 'express';
import cors from 'cors';
import { initDatabase, getPipelineStatus, getIngestionLogs, getProductionRecords, recordDailyProductionSample } from './db/database.js';
import { getAllMines, getMineConfig } from './config/mines.js';
import { getWeatherForMine, getMineWeatherHistory, fetchAndStoreWeather } from './services/weatherService.js';
import { 
  getLatestSatelliteForMine, getSatelliteHistoryForMine, getSpectralIndicesForMine, 
  discoverAndProcessSatellite 
} from './services/copernicusService.js';
import { 
  calculateManganeseProspectivity, calculateShortfallRisk, runAndPersistMLPipeline 
} from './services/mlService.js';
import { 
  startIngestionScheduler, triggerWeatherPipeline, triggerSatellitePipeline 
} from './services/scheduler.js';

// Initialize Database on startup
initDatabase();

// Start Background Scheduler
startIngestionScheduler();

const app = express();

// Wildcard CORS to allow requests from Vercel deployment and local dev
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// --------------------------------------------------------------------------
// 1. HEALTH ENDPOINT
// --------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "MnIntel Automated Space & Mining Intelligence Center API",
    version: "2.5.0",
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// 2. MINES ENDPOINT
// --------------------------------------------------------------------------
app.get('/api/mines', (req, res) => {
  const mines = getAllMines();
  res.json({
    mines,
    count: mines.length,
    source: "Centralized MOIL Mine Registry",
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// 3. WEATHER ENDPOINTS
// --------------------------------------------------------------------------
app.get('/api/weather/:mineId', async (req, res) => {
  try {
    const weather = await getWeatherForMine(req.params.mineId);
    res.json(weather);
  } catch (err) {
    console.error(`Error fetching weather for ${req.params.mineId}:`, err.message);
    res.status(500).json({ error: "Failed to retrieve weather data", message: err.message });
  }
});

app.get('/api/weather/:mineId/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 14;
    const history = getMineWeatherHistory(req.params.mineId, limit);
    res.json({
      mine: req.params.mineId,
      history,
      source: "MnIntel Weather Observations Database",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve weather history", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 4. SATELLITE & SPECTRAL ENDPOINTS
// --------------------------------------------------------------------------
app.get('/api/satellite/:mineId/latest', async (req, res) => {
  try {
    const mine = getMineConfig(req.params.mineId);
    let satellite = getLatestSatelliteForMine(mine.id);

    // If no observation in DB yet, trigger discovery
    if (!satellite) {
      try {
        const result = await discoverAndProcessSatellite(mine.id);
        satellite = result.observation;
      } catch (ingestErr) {
        console.warn('Initial satellite discovery deferred:', ingestErr.message);
      }
    }

    const indices = getSpectralIndicesForMine(mine.id);

    res.json({
      mine: mine.id,
      mineName: mine.name,
      observation: satellite || {
        product_name: "No Sentinel-2 Level-2A observation yet recorded",
        status: "Pending automated discovery"
      },
      indices: indices || null,
      source: "Copernicus Sentinel-2 Level-2A",
      note: "Satellite-derived spectral indicators, not direct manganese measurements.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve latest satellite observation", message: err.message });
  }
});

app.get('/api/satellite/:mineId/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = getSatelliteHistoryForMine(req.params.mineId, limit);
    res.json({
      mine: req.params.mineId,
      history,
      source: "Copernicus Sentinel-2 Observations Database",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve satellite history", message: err.message });
  }
});

app.get('/api/satellite/:mineId/indices', (req, res) => {
  try {
    const indices = getSpectralIndicesForMine(req.params.mineId);
    res.json({
      mine: req.params.mineId,
      indices: indices || null,
      source: "Copernicus Sentinel-2 L2A (Satellite-Derived Indicators)",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve spectral indices", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 5. PRODUCTION ENDPOINT
// --------------------------------------------------------------------------
app.get('/api/production/:mineId', (req, res) => {
  try {
    const mine = getMineConfig(req.params.mineId);
    const limit = parseInt(req.query.limit) || 30;
    const records = getProductionRecords(mine.id, limit);
    res.json({
      mine: mine.id,
      mineName: mine.name,
      dailyTarget: mine.dailyTarget,
      monthlyTarget: mine.monthlyTarget,
      estimatedReserves: mine.estimatedReserves,
      records,
      source: "MOIL Production & Dispatch Database",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve production records", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 6. PROSPECTIVITY & RISK (ML) ENDPOINTS
// --------------------------------------------------------------------------
app.get('/api/prospectivity/:mineId', (req, res) => {
  try {
    const prospectivity = calculateManganeseProspectivity(req.params.mineId);
    res.json(prospectivity);
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate prospectivity", message: err.message });
  }
});

app.get('/api/risk/:mineId', (req, res) => {
  try {
    const shortfall = calculateShortfallRisk(req.params.mineId);
    res.json(shortfall);
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate production shortfall risk", message: err.message });
  }
});

app.get('/api/recommendations/:mineId', (req, res) => {
  try {
    const shortfall = calculateShortfallRisk(req.params.mineId);
    res.json({
      mine: req.params.mineId,
      recommendations: shortfall.recommendations,
      disclaimer: "AI-assisted operational recommendations. Advisory only, not an automatic control command.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate recommendations", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 7. DATA STATUS & AUDIT LOGS ENDPOINT
// --------------------------------------------------------------------------
app.get('/api/data-status', (req, res) => {
  try {
    const status = getPipelineStatus();
    const recentLogs = getIngestionLogs(10);
    res.json({
      ...status,
      recentIngestionLogs: recentLogs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve pipeline status", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 8. MANUAL INGESTION TRIGGER (FOR HACKATHON DEMO / AUDITING)
// --------------------------------------------------------------------------
app.post('/api/pipeline/trigger', async (req, res) => {
  try {
    const type = req.body.type || 'all';
    if (type === 'weather' || type === 'all') {
      await triggerWeatherPipeline();
    }
    if (type === 'satellite' || type === 'all') {
      await triggerSatellitePipeline();
    }
    // Update daily dispatch sample with fresh weighbridge telemetry
    if (type === 'all' || type === 'production') {
      for (const m of getAllMines()) {
        recordDailyProductionSample(m.id);
      }
    }
    res.json({
      status: "Pipeline execution triggered successfully",
      type,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Pipeline trigger failed", message: err.message });
  }
});

// --------------------------------------------------------------------------
// 9. DEBUG KEYS ENDPOINT
// --------------------------------------------------------------------------
app.get('/api/keys', (req, res) => {
  res.json({
    COPERNICUS_CLIENT_ID: process.env.COPERNICUS_CLIENT_ID ? `${process.env.COPERNICUS_CLIENT_ID.substring(0, 8)}...` : null,
    COPERNICUS_CONFIGURED: !!process.env.COPERNICUS_CLIENT_ID,
    DATABASE: "SQLite (node:sqlite active)"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ MnIntel Space & Mining Automated API running on port ${PORT}`);
});
