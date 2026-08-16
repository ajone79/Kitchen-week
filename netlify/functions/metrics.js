import { getStore } from '@netlify/blobs';

// "How are we doing?" metrics endpoint.
//
// GET  /api/metrics
//   -> { tiles: [ { label, value }, ... ], updatedAt }
//   Auth: same shared x-site-key as the rest of the app.
//
// POST /api/metrics   { tiles: [ { label, value }, ... ] }
//   -> { ok: true, value: {...} }
//   Auth: a SEPARATE secret, x-metrics-key, matching the METRICS_KEY env var.
//   Not the same as SITE_KEY on purpose: this is called from outside the
//   app (a Power Automate flow), so it gets its own rotatable key.
//
// The tile list is fully flexible — to add, remove, rename, or reorder a
// metric, just change what's sent in the POST body (i.e. edit the Power
// Automate flow / the Form it's fed by). No app code changes needed.
// Each tile's value should be a number 0-100 (shown as a %).

const METRICS_STORE_KEY = 'kw.metrics';
const MAX_TILES = 8;

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-site-key, x-metrics-key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const store = getStore({ name: 'kitchen-week', consistency: 'strong' });

  try {
    if (req.method === 'GET') {
      const siteKey = process.env.SITE_KEY;
      if (siteKey) {
        const provided = req.headers.get('x-site-key');
        if (provided !== siteKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...cors }
          });
        }
      }
      const value = await store.get(METRICS_STORE_KEY, { type: 'json' });
      return new Response(JSON.stringify(value || { tiles: [], updatedAt: null }), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    if (req.method === 'POST') {
      const metricsKey = process.env.METRICS_KEY;
      if (!metricsKey) {
        return new Response(JSON.stringify({ error: 'METRICS_KEY not configured on server' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }
      const provided = req.headers.get('x-metrics-key');
      if (provided !== metricsKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      const body = await req.json();
      if (!Array.isArray(body.tiles) || body.tiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Body must include a non-empty "tiles" array' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...cors } }
        );
      }

      const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) * 10) / 10));

      const tiles = body.tiles
        .slice(0, MAX_TILES)
        .filter((t) => t && typeof t.label === 'string' && t.label.trim() && !Number.isNaN(Number(t.value)))
        .map((t) => ({ label: t.label.trim().slice(0, 40), value: clamp(t.value) }));

      if (tiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid tiles found (each needs a label and a numeric value)' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...cors } }
        );
      }

      const next = { tiles, updatedAt: new Date().toISOString() };
      await store.setJSON(METRICS_STORE_KEY, next);
      return new Response(JSON.stringify({ ok: true, value: next }), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors }
    });
  }
};

export const config = { path: '/api/metrics' };
