/**
 * Centralized Mine Configuration for MnIntel (MOIL Mining Intelligence Center)
 * Extensible configuration supporting official coordinates, bounding boxes, and operational targets.
 */

export const MINES_REGISTRY = {
  "dongri-buzurg": {
    id: "dongri-buzurg",
    name: "Dongri Buzurg Mine",
    aliases: ["Dongri Buzurg Mine", "Dongri Buzurg", "dongri"],
    latitude: 21.545,
    longitude: 79.685,
    // Bounding box: [minLon, minLat, maxLon, maxLat] for Sentinel-2 satellite footprints
    boundingBox: [79.665, 21.530, 79.705, 21.560],
    state: "Maharashtra",
    district: "Bhandara (Tumsar)",
    country: "India",
    elevationMeters: 312,
    commodity: "Manganese Ore (High Grade Pyrolusite/Psilomelane)",
    geologicalFormation: "Sausar Group (Mansar Formation)",
    dailyTarget: 850,
    monthlyTarget: 25000,
    estimatedReserves: 8.4, // Million Tonnes
    coordinatesStatus: "Verified MOIL Mine Site Coordinates"
  },
  "balaghat": {
    id: "balaghat",
    name: "Balaghat Mine",
    aliases: ["Balaghat Mine", "Balaghat", "balaghat-mine"],
    latitude: 21.865,
    longitude: 80.210,
    boundingBox: [80.190, 21.850, 80.230, 21.880],
    state: "Madhya Pradesh",
    district: "Balaghat (Bharveli)",
    country: "India",
    elevationMeters: 320,
    commodity: "Manganese Ore (Deep Underground & Open Cast)",
    geologicalFormation: "Sausar Group (Gondite & Braunite Facies)",
    dailyTarget: 1200,
    monthlyTarget: 36000,
    estimatedReserves: 14.2, // Million Tonnes
    coordinatesStatus: "Verified MOIL Mine Site Coordinates"
  },
  "mine-3": {
    id: "mine-3",
    name: "Gumgaon Mine",
    aliases: ["Mine 3", "Gumgaon Mine", "Gumgaon"],
    latitude: 21.385,
    longitude: 79.015,
    boundingBox: [79.000, 21.370, 79.030, 21.400],
    state: "Maharashtra",
    district: "Nagpur (Saoner)",
    country: "India",
    elevationMeters: 298,
    commodity: "Manganese Ore",
    geologicalFormation: "Sausar Group",
    dailyTarget: 500,
    monthlyTarget: 15000,
    estimatedReserves: 4.8,
    coordinatesStatus: "Verified MOIL Secondary Prospect"
  }
};

/**
 * Resolve a mine by ID, slug, or display name
 */
export function getMineConfig(identifier) {
  if (!identifier) return MINES_REGISTRY["dongri-buzurg"];
  const normalized = identifier.toString().toLowerCase().trim();
  
  // Exact ID match
  if (MINES_REGISTRY[normalized]) return MINES_REGISTRY[normalized];

  // Match by alias or partial name
  for (const key of Object.keys(MINES_REGISTRY)) {
    const mine = MINES_REGISTRY[key];
    if (mine.aliases.some(a => a.toLowerCase() === normalized) ||
        mine.name.toLowerCase() === normalized ||
        normalized.includes(mine.id)) {
      return mine;
    }
  }

  // Fallback to first mine
  return MINES_REGISTRY["dongri-buzurg"];
}

export function getAllMines() {
  return Object.values(MINES_REGISTRY);
}
