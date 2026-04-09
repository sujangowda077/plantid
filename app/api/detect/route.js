/**
 * /app/api/detect/route.js  v3
 * Server-side plant detection proxy — API keys never reach the browser.
 * Fixed: better error messages, handles PlantNet 404 (no match) cleanly,
 *        Plant.id integration stub with merge logic.
 *
 * POST /api/detect
 * Body: FormData { image: File, organ?: string }
 * Response: { results: Array<{ name, scientific, family, confidence, source }> }
 */

import { NextResponse } from 'next/server';

const PLANTNET_KEY = process.env.PLANTNET_API_KEY;
const PLANTID_KEY  = process.env.PLANTID_API_KEY; // optional

export async function POST(request) {
  try {
    const formData  = await request.formData();
    const imageFile = formData.get('image');
    const organ     = formData.get('organ') || 'auto';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check file size (10 MB limit)
    const sizeBytes = imageFile.size || 0;
    if (sizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Please use an image under 10 MB.' }, { status: 400 });
    }

    const plantNetResults = await queryPlantNet(imageFile, organ);

    // Optionally combine with Plant.id when key is present
    // const plantIdResults = PLANTID_KEY ? await queryPlantId(imageFile) : [];
    // const results = mergeResults(plantNetResults, plantIdResults);

    return NextResponse.json({ results: plantNetResults });

  } catch (err) {
    console.error('[/api/detect]', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Detection failed. Please try again.' },
      { status: 500 }
    );
  }
}

/* ── PlantNet ───────────────────────────────────────── */
async function queryPlantNet(imageFile, organ) {
  if (!PLANTNET_KEY) {
    throw new Error(
      'PLANTNET_API_KEY is not configured. Add it to your .env.local file. ' +
      'Get a free key at https://my.plantnet.org/'
    );
  }

  const fd = new FormData();
  fd.append('images', imageFile);
  fd.append('organs', organ);

  const url =
    `https://my-api.plantnet.org/v2/identify/all` +
    `?api-key=${PLANTNET_KEY}&lang=en&nb-results=5&include-related-images=false`;

  const res = await fetch(url, { method: 'POST', body: fd });

  // 404 from PlantNet = no plant found (score below threshold)
  if (res.status === 404) return [];

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `PlantNet API error ${res.status}`);
  }

  const json = await res.json();
  if (!json.results?.length) return [];

  return json.results.map((r) => ({
    name:       r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor || 'Unknown',
    scientific: r.species?.scientificNameWithoutAuthor || '',
    family:     r.species?.family?.scientificNameWithoutAuthor || '',
    confidence: r.score,
    source:     'plantnet',
  }));
}

/* ── Plant.id (uncomment when you have a key) ──────── */
/*
async function queryPlantId(imageFile) {
  if (!PLANTID_KEY) return [];
  try {
    const arrayBuf = await imageFile.arrayBuffer();
    const base64   = Buffer.from(arrayBuf).toString('base64');
    const mime     = imageFile.type || 'image/jpeg';

    const res = await fetch('https://api.plant.id/v2/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: PLANTID_KEY,
        images:  [`data:${mime};base64,${base64}`],
        modifiers: ['crops_fast'],
        plant_language: 'en',
        plant_details: ['common_names', 'taxonomy'],
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.suggestions || []).slice(0, 5).map(s => ({
      name:       s.plant_details?.common_names?.[0] || s.plant_name,
      scientific: s.plant_name,
      family:     s.plant_details?.taxonomy?.family || '',
      confidence: s.probability,
      source:     'plantid',
    }));
  } catch { return []; }
}

function mergeResults(a, b) {
  const map = new Map();
  [...a, ...b].forEach(r => {
    const key = (r.scientific || r.name).toLowerCase().trim();
    if (!map.has(key) || map.get(key).confidence < r.confidence) map.set(key, r);
  });
  return [...map.values()].sort((x, y) => y.confidence - x.confidence).slice(0, 5);
}
*/
