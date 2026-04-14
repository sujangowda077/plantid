/**
 * /lib/careTips.js
 * Returns care tips for a detected plant using keyword matching.
 * Falls back to generic tips when no match is found.
 *
 * In production you could replace this with a call to an external
 * plant database API (e.g. Perenual, Trefle) for richer data.
 */

/** Generic fallback tips shown when no specific match is found */
const GENERIC_TIPS = {
  water:    'Water when the top inch of soil feels dry.',
  sunlight: 'Most plants prefer bright, indirect light.',
  soil:     'Use well-draining potting mix.',
  humidity: 'Average household humidity (40–60%) suits most plants.',
  notes:    'Observe your plant and adjust care based on its response.',
};

/** Plant-specific care tips database */
const PLANT_CARE_DB = [
  {
    keywords: ['rose', 'rosa'],
    water:    'Water deeply 2–3× per week; avoid wetting leaves.',
    sunlight: 'Full sun — at least 6 hours of direct sunlight daily.',
    soil:     'Rich, loamy, well-draining soil with pH 6.0–6.5.',
    humidity: 'Moderate humidity; good air circulation prevents disease.',
    notes:    'Deadhead spent blooms regularly to encourage flowering.',
  },
  {
    keywords: ['monstera', 'swiss cheese'],
    water:    'Water every 1–2 weeks; allow soil to dry halfway between waterings.',
    sunlight: 'Bright indirect light; direct sun can scorch leaves.',
    soil:     'Well-draining, peat-based potting mix.',
    humidity: 'Prefers 60–80% humidity; mist leaves or use a pebble tray.',
    notes:    'Wipe leaves with a damp cloth monthly to keep them shiny.',
  },
  {
    keywords: ['pothos', 'epipremnum'],
    water:    'Water every 1–2 weeks; very forgiving of drought.',
    sunlight: 'Tolerates low light; grows faster in bright indirect light.',
    soil:     'Any standard potting mix works well.',
    humidity: 'Adapts to most indoor humidity levels.',
    notes:    'One of the easiest houseplants — great for beginners.',
  },
  {
    keywords: ['snake plant', 'sansevieria', 'dracaena trifasciata'],
    water:    'Water every 2–6 weeks; extremely drought tolerant.',
    sunlight: 'Tolerates low light; thrives in indirect bright light.',
    soil:     'Fast-draining cactus or succulent mix.',
    humidity: 'Very adaptable; low humidity is fine.',
    notes:    'One of NASA\'s top air-purifying plants.',
  },
  {
    keywords: ['lavender', 'lavandula'],
    water:    'Water deeply but infrequently; allow soil to dry fully.',
    sunlight: 'Full sun — 6–8 hours daily is ideal.',
    soil:     'Sandy, alkaline, well-draining soil.',
    humidity: 'Prefers low humidity; poor drainage causes root rot.',
    notes:    'Prune after flowering to maintain shape and vigor.',
  },
  {
    keywords: ['fern', 'nephrolepis', 'asplenium', 'polypodium'],
    water:    'Keep soil consistently moist but never waterlogged.',
    sunlight: 'Indirect light or filtered shade.',
    soil:     'Rich, moisture-retaining potting mix with perlite.',
    humidity: 'High humidity (50–80%) is essential; mist daily.',
    notes:    'Avoid cold draughts and heating vents.',
  },
  {
    keywords: ['succulent', 'cactus', 'aloe', 'echeveria', 'sedum'],
    water:    'Water every 2–3 weeks in summer; monthly in winter.',
    sunlight: 'Bright direct to indirect light; 4–6 hours minimum.',
    soil:     'Cactus or succulent mix — excellent drainage is critical.',
    humidity: 'Low humidity preferred; avoid misting.',
    notes:    'Overwatering is the #1 killer of succulents.',
  },
  {
    keywords: ['basil', 'ocimum'],
    water:    'Water regularly; keep soil moist but not waterlogged.',
    sunlight: 'Full sun — 6–8 hours of direct light.',
    soil:     'Rich, moist, well-draining potting mix.',
    humidity: 'Moderate humidity; avoid cold below 10°C (50°F).',
    notes:    'Pinch off flower buds to keep leaves flavorful.',
  },
  {
    keywords: ['peace lily', 'spathiphyllum'],
    water:    'Water weekly; drooping leaves signal thirst.',
    sunlight: 'Low to medium indirect light; thrives away from windows.',
    soil:     'Rich potting mix; keep slightly moist.',
    humidity: 'Prefers high humidity; mist or use a humidifier.',
    notes:    'Toxic to pets — keep out of reach of dogs and cats.',
  },
  {
    keywords: ['fiddle leaf', 'ficus lyrata'],
    water:    'Water when top 2 inches of soil are dry (~weekly).',
    sunlight: 'Bright indirect light; avoid direct harsh sun.',
    soil:     'Well-draining, nutrient-rich potting mix.',
    humidity: '30–65% humidity; avoid cold draughts.',
    notes:    'Very sensitive to being moved — find its spot and leave it.',
  },
  {
    keywords: ['orchid', 'phalaenopsis', 'dendrobium'],
    water:    'Water every 7–10 days; let roots dry between waterings.',
    sunlight: 'Bright indirect light; no direct sun.',
    soil:     'Orchid bark mix — never regular potting soil.',
    humidity: '50–70% humidity; good ventilation around roots.',
    notes:    'Blooms can last 2–3 months; re-bloom after a cool rest period.',
  },
  {
    keywords: ['tomato', 'solanum lycopersicum'],
    water:    'Deep, consistent watering 1–2× per week; avoid wetting foliage.',
    sunlight: 'Full sun — 8+ hours daily.',
    soil:     'Rich, loamy soil with pH 6.0–6.8; add compost.',
    humidity: 'Moderate; good air flow prevents fungal disease.',
    notes:    'Stake or cage early; remove suckers for better yield.',
  },
];

/**
 * Returns care tips for a given plant name.
 *
 * @param {string} plantName - common or scientific plant name
 * @returns {{ water: string, sunlight: string, soil: string, humidity: string, notes: string }}
 */
export function getCareTips(plantName) {
  if (!plantName) return GENERIC_TIPS;
  const lower = plantName.toLowerCase();

  for (const entry of PLANT_CARE_DB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      const { keywords: _k, ...tips } = entry;
      return tips;
    }
  }

  return GENERIC_TIPS;
}

/** Icons for each care category */
export const CARE_ICONS = {
  water:    { icon: '💧', label: 'Watering' },
  sunlight: { icon: '☀️', label: 'Sunlight' },
  soil:     { icon: '🪴', label: 'Soil' },
  humidity: { icon: '🌫️', label: 'Humidity' },
  notes:    { icon: '📝', label: 'Tips' },
};
